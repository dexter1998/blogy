/**
 * PageSpeed scraper.
 *
 * Source: Google PageSpeed Insights API v5 — public, works without an
 * API key for low volumes. If PAGESPEED_API_KEY is set in the environment
 * it's appended for higher quotas.
 *
 * We deliberately use the official PSI endpoint instead of running
 * Lighthouse ourselves: PSI gives us the same Lighthouse score Google
 * itself shows, plus CrUX field data (real user metrics). That's the
 * "real-world accuracy" the spec asks for.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import { scorePageSpeed } from "@/scoring/pagespeed";
import type { CoreWebVital, PageSpeedInput, PageSpeedResult } from "./types";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

type PsiResponse = {
  loadingExperience?: {
    metrics?: Record<string, { percentile: number; category: string }>;
    overall_category?: string;
  };
  lighthouseResult?: {
    finalUrl?: string;
    categories?: { performance?: { score: number | null } };
    audits?: Record<
      string,
      {
        id?: string;
        title?: string;
        description?: string;
        numericValue?: number;
        score?: number | null;
        details?: { overallSavingsMs?: number };
      }
    >;
  };
};

function categorise(metric: string, value: number | null): CoreWebVital["category"] {
  if (value === null) return "unknown";
  switch (metric) {
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "INP":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    default:
      return "unknown";
  }
}

function readField(psi: PsiResponse): PageSpeedResult["field"] {
  const exp = psi.loadingExperience?.metrics ?? {};
  const get = (k: string): number | null => exp[k]?.percentile ?? null;
  const metrics: CoreWebVital[] = [
    { metric: "LCP", value: get("LARGEST_CONTENTFUL_PAINT_MS"), unit: "ms", category: categorise("LCP", get("LARGEST_CONTENTFUL_PAINT_MS")) },
    { metric: "INP", value: get("INTERACTION_TO_NEXT_PAINT") ?? get("EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT"), unit: "ms", category: categorise("INP", get("INTERACTION_TO_NEXT_PAINT") ?? get("EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT")) },
    { metric: "CLS", value: (() => { const v = get("CUMULATIVE_LAYOUT_SHIFT_SCORE"); return v === null ? null : v / 100; })(), unit: "score", category: "unknown" },
    { metric: "FCP", value: get("FIRST_CONTENTFUL_PAINT_MS"), unit: "ms", category: categorise("FCP", get("FIRST_CONTENTFUL_PAINT_MS")) },
    { metric: "TTFB", value: get("EXPERIMENTAL_TIME_TO_FIRST_BYTE"), unit: "ms", category: categorise("TTFB", get("EXPERIMENTAL_TIME_TO_FIRST_BYTE")) },
  ];
  const cls = metrics.find((m) => m.metric === "CLS");
  if (cls) cls.category = categorise("CLS", cls.value);

  const overall = (psi.loadingExperience?.overall_category ?? "").toUpperCase();
  const assessment: PageSpeedResult["field"]["coreWebVitalsAssessment"] =
    overall === "FAST" ? "PASS" : overall === "AVERAGE" || overall === "SLOW" ? "FAIL" : "UNKNOWN";

  const available = !!psi.loadingExperience && Object.keys(exp).length > 0;
  return { available, coreWebVitalsAssessment: assessment, metrics };
}

function readLab(psi: PsiResponse): PageSpeedResult["lab"] {
  const audits = psi.lighthouseResult?.audits ?? {};
  const num = (id: string): number | null => {
    const v = audits[id]?.numericValue;
    return typeof v === "number" ? Math.round(v) : null;
  };
  const score = psi.lighthouseResult?.categories?.performance?.score ?? null;
  const opportunities = Object.values(audits)
    .filter((a) => (a.details?.overallSavingsMs ?? 0) >= 100 && (a.score ?? 1) < 0.9)
    .map((a) => ({
      id: a.id ?? "",
      title: a.title ?? "",
      description: (a.description ?? "").slice(0, 200),
      savingsMs: Math.round(a.details?.overallSavingsMs ?? 0),
    }))
    .sort((a, b) => b.savingsMs - a.savingsMs)
    .slice(0, 8);

  const diagIds = ["unused-javascript", "uses-text-compression", "uses-long-cache-ttl", "dom-size", "third-party-summary"];
  const diagnostics = diagIds
    .map((id) => audits[id])
    .filter((a) => a && (a.score ?? 1) < 0.9)
    .map((a) => ({ id: a!.id ?? "", title: a!.title ?? "", description: (a!.description ?? "").slice(0, 200) }));

  return {
    performanceScore: score === null ? null : Math.round(score * 100),
    metrics: {
      lcp: num("largest-contentful-paint"),
      fcp: num("first-contentful-paint"),
      cls: (() => { const v = audits["cumulative-layout-shift"]?.numericValue; return typeof v === "number" ? Math.round(v * 1000) / 1000 : null; })(),
      tbt: num("total-blocking-time"),
      si: num("speed-index"),
      tti: num("interactive"),
    },
    opportunities,
    diagnostics,
  };
}

export const pagespeedScraper: Scraper<PageSpeedInput, PageSpeedResult> = {
  name: "pagespeed",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return `${input.strategy ?? "mobile"}:${new URL(input.url).toString()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<PageSpeedResult> {
    const strategy = input.strategy ?? "mobile";
    const params = new URLSearchParams({
      url: input.url,
      strategy,
      category: "performance",
    });
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (apiKey) params.set("key", apiKey);

    const res = await httpGet(`${PSI_ENDPOINT}?${params.toString()}`, {
      timeoutMs: 30_000,
    });
    if (!res.ok) {
      throw new ScrapeError("scrape_failed", `PSI request failed: ${res.message}`);
    }
    let psi: PsiResponse;
    try {
      psi = JSON.parse(res.body);
    } catch (e) {
      throw new ScrapeError("scrape_failed", `PSI returned non-JSON: ${e instanceof Error ? e.message : "parse error"}`);
    }

    const field = readField(psi);
    const lab = readLab(psi);

    const result: PageSpeedResult = {
      url: input.url,
      finalUrl: psi.lighthouseResult?.finalUrl ?? input.url,
      strategy,
      fetchedAt: new Date().toISOString(),
      field,
      lab,
      scores: { overall: 0, performance: 0, cwv: 0 },
      source: "psi-v5",
    };
    result.scores = scorePageSpeed(result);
    return result;
  },
};
