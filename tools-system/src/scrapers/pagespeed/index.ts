/**
 * PageSpeed scraper.
 *
 * Source: Google PageSpeed Insights API v5 — public, works without an
 * API key for low volumes. PAGESPEED_API_KEY is appended for higher quotas.
 *
 * We deliberately use the official PSI endpoint instead of running
 * Lighthouse ourselves: PSI gives us the same Lighthouse score Google
 * itself shows, plus CrUX field data (real user metrics).
 *
 * The scraper requests all four Lighthouse categories (performance, seo,
 * accessibility, best-practices) and surfaces per-category audit buckets
 * (failing / passed / manual / not-applicable) so the UI can render a
 * Seobility-style full audit dashboard.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import { scorePageSpeed } from "@/scoring/pagespeed";
import type {
  AuditBuckets,
  AuditEntry,
  CoreWebVital,
  PageSpeedInput,
  PageSpeedResult,
} from "./types";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

type LhAudit = {
  id?: string;
  title?: string;
  description?: string;
  numericValue?: number;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  details?: {
    overallSavingsMs?: number;
    overallSavingsBytes?: number;
  };
};

type LhCategory = {
  id?: string;
  title?: string;
  score?: number | null;
  auditRefs?: Array<{ id: string; weight?: number; group?: string }>;
};

type PsiResponse = {
  loadingExperience?: {
    metrics?: Record<string, { percentile: number; category: string }>;
    overall_category?: string;
  };
  lighthouseResult?: {
    finalUrl?: string;
    fullPageScreenshot?: { screenshot?: { data?: string } };
    audits?: Record<string, LhAudit>;
    categories?: {
      performance?: LhCategory;
      seo?: LhCategory;
      accessibility?: LhCategory;
      "best-practices"?: LhCategory;
    };
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

function toEntry(a: LhAudit | undefined): AuditEntry | null {
  if (!a || !a.id) return null;
  return {
    id: a.id,
    title: a.title ?? a.id,
    description: (a.description ?? "").slice(0, 280),
    score: typeof a.score === "number" ? a.score : null,
    scoreDisplayMode: a.scoreDisplayMode ?? "binary",
    displayValue: a.displayValue,
    savingsMs: a.details?.overallSavingsMs,
    savingsBytes: a.details?.overallSavingsBytes,
  };
}

function bucketCategory(
  cat: LhCategory | undefined,
  audits: Record<string, LhAudit>,
): AuditBuckets {
  const out: AuditBuckets = { failing: [], passed: [], manual: [], notApplicable: [] };
  if (!cat?.auditRefs) return out;
  for (const ref of cat.auditRefs) {
    const a = audits[ref.id];
    const e = toEntry(a);
    if (!e) continue;
    const mode = e.scoreDisplayMode;
    if (mode === "manual") out.manual.push(e);
    else if (mode === "notApplicable") out.notApplicable.push(e);
    else if (mode === "informative") {
      // surface as passed (informational only)
      out.passed.push(e);
    } else if (e.score !== null && e.score >= 0.9) out.passed.push(e);
    else if (e.score !== null && e.score < 0.9) out.failing.push(e);
    else out.passed.push(e); // unknown numeric → treat as informational
  }
  // Stable, deterministic ordering: highest savings first for failing, alpha for passed.
  out.failing.sort((a, b) => (b.savingsMs ?? 0) - (a.savingsMs ?? 0) || a.title.localeCompare(b.title));
  out.passed.sort((a, b) => a.title.localeCompare(b.title));
  return out;
}

function readScreenshot(psi: PsiResponse): string {
  const data = psi.lighthouseResult?.fullPageScreenshot?.screenshot?.data;
  return typeof data === "string" ? data : "";
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
    // PSI accepts repeated `category` query params; URLSearchParams.append
    // handles that correctly. Asking for all four expands the response by
    // ~3x but unlocks the Seobility-style full audit dashboard.
    const params = new URLSearchParams();
    params.set("url", input.url);
    params.set("strategy", strategy);
    for (const cat of ["performance", "seo", "accessibility", "best-practices"]) {
      params.append("category", cat);
    }
    const apiKey = env.pageSpeedApiKey;
    if (apiKey) params.set("key", apiKey);

    const res = await httpGet(`${PSI_ENDPOINT}?${params.toString()}`, {
      timeoutMs: 60_000,
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
    const audits = psi.lighthouseResult?.audits ?? {};
    const cats = psi.lighthouseResult?.categories ?? {};

    const pct = (s: number | null | undefined): number | null =>
      typeof s === "number" ? Math.round(s * 100) : null;

    const result: PageSpeedResult = {
      url: input.url,
      finalUrl: psi.lighthouseResult?.finalUrl ?? input.url,
      strategy,
      fetchedAt: new Date().toISOString(),
      screenshot: readScreenshot(psi),
      field,
      lab,
      categories: {
        performance: pct(cats.performance?.score),
        seo: pct(cats.seo?.score),
        accessibility: pct(cats.accessibility?.score),
        bestPractices: pct(cats["best-practices"]?.score),
      },
      audits: {
        performance: bucketCategory(cats.performance, audits),
        seo: bucketCategory(cats.seo, audits),
        accessibility: bucketCategory(cats.accessibility, audits),
        bestPractices: bucketCategory(cats["best-practices"], audits),
      },
      scores: { overall: 0, performance: 0, cwv: 0 },
      source: "psi-v5",
    };
    result.scores = scorePageSpeed(result);
    return result;
  },
};
