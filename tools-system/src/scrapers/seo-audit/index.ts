/**
 * SEO Audit v2 — composite orchestrator.
 *
 * Pulls signals from every existing extractor in parallel, runs ~50
 * checks, scores them into 8 categories, and assembles an explainable
 * `AuditReport`. Heavy paths (pagespeed × 2, website-intelligence,
 * image HEAD) all run concurrently so the worst-case latency is bounded
 * by the slowest single call (~25–35 s on a cold cache).
 *
 * Legacy `SeoAuditResult` fields are preserved for backwards
 * compatibility, but the full v2 payload lives under `result.report`.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { originOf } from "@/scrapers/_shared/html";
import { metadataScraper } from "@/scrapers/metadata";
import { schemaScraper } from "@/scrapers/schema";
import { sitemapScraper } from "@/scrapers/sitemap";
import { pagespeedScraper } from "@/scrapers/pagespeed";
import { geoScraper } from "@/scrapers/geo";
import { backlinksScraper } from "@/scrapers/backlinks";
import { websiteIntelligenceScraper } from "@/scrapers/website-intelligence";
import type { SeoAuditCategory, SeoAuditInput, SeoAuditResult } from "./types";
import type { AuditReport, Signals } from "./report-types";
import { gradeOf } from "./report-types";
import { runChecks } from "./checks";
import { overallScore, prioritise, scoreCategories } from "./scoring";
import { runImageAudit } from "./image-audit";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function legacyGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

async function safe<T>(p: Promise<T>, label: string, failures: string[]): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    failures.push(`${label}: ${e instanceof Error ? e.message : "unknown"}`);
    return null;
  }
}

export const seoAuditScraper: Scraper<SeoAuditInput, SeoAuditResult> = {
  name: "seo-audit",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, ctx: ScrapeContext): Promise<SeoAuditResult> {
    const t0 = Date.now();
    const origin = originOf(input.url);
    const failures: string[] = [];

    const [meta, schema, sitemap, psMobile, psDesktop, geo, backlinks, intel, images] =
      await Promise.all([
        safe(metadataScraper.execute({ url: input.url, fresh: input.fresh }, ctx), "metadata", failures),
        safe(schemaScraper.execute({ url: input.url, fresh: input.fresh }, ctx), "schema", failures),
        safe(sitemapScraper.execute({ url: origin, fresh: input.fresh }, ctx), "sitemap", failures),
        safe(pagespeedScraper.execute({ url: input.url, strategy: "mobile", fresh: input.fresh }, ctx), "pagespeed-mobile", failures),
        safe(pagespeedScraper.execute({ url: input.url, strategy: "desktop", fresh: input.fresh }, ctx), "pagespeed-desktop", failures),
        safe(geoScraper.execute({ url: input.url, fresh: input.fresh }, ctx), "geo", failures),
        safe(backlinksScraper.execute({ url: input.url, fresh: input.fresh }, ctx), "backlinks", failures),
        safe(websiteIntelligenceScraper.execute({ url: input.url, fresh: input.fresh }, ctx), "website-intelligence", failures),
        safe(runImageAudit(input.url), "image-audit", failures),
      ]);

    if (!meta) {
      throw new ScrapeError("scrape_failed", "Audit failed: could not fetch the page.");
    }

    const signals: Signals = {
      url: input.url,
      finalUrl: meta.finalUrl,
      origin,
      fetchedAt: new Date().toISOString(),
      metadata: meta,
      schema,
      sitemap,
      pagespeedMobile: psMobile,
      pagespeedDesktop: psDesktop,
      geo,
      backlinks,
      intelligence: intel,
      images,
    };

    const checks = runChecks(signals);
    const categories = scoreCategories(checks);
    const overall = overallScore(categories);
    const prioritised = prioritise(checks);

    const report: AuditReport = {
      url: input.url,
      finalUrl: meta.finalUrl,
      fetchedAt: signals.fetchedAt,
      durationMs: Date.now() - t0,
      overall: { score: overall, grade: gradeOf(overall) },
      categories,
      checks,
      prioritised,
      signals,
      fetchFailures: failures,
    };

    // ── Legacy compact shape (preserved) ─────────────────────────────
    const errors = checks.filter((c) => c.severity === "critical").length;
    const warnings = checks.filter((c) => c.severity === "warning").length;
    const infos = checks.filter((c) => c.severity === "info").length;

    const legacyCategories: SeoAuditCategory[] = [
      { name: "metadata", score: meta.scores.overall, weight: 0.2, summary: `${meta.issues.length} issues`, issues: [] },
      {
        name: "schema",
        score: schema?.scores.overall ?? 0,
        weight: 0.15,
        summary: schema ? `${schema.totalItems} item(s)` : "Schema scan failed",
        issues: [],
      },
      {
        name: "sitemap",
        score: sitemap?.scores.overall ?? 0,
        weight: 0.1,
        summary: sitemap ? `${sitemap.stats.totalUrls.toLocaleString()} URLs` : "Sitemap scan failed",
        issues: [],
      },
      { name: "content", score: clamp(report.categories.find((c) => c.category === "content")?.score ?? 0), weight: 0.2, summary: "", issues: [] },
      { name: "links", score: clamp(report.categories.find((c) => c.category === "indexability")?.score ?? 0), weight: 0.15, summary: "", issues: [] },
      { name: "indexability", score: clamp(report.categories.find((c) => c.category === "indexability")?.score ?? 0), weight: 0.2, summary: "", issues: [] },
    ];

    return {
      url: input.url,
      finalUrl: meta.finalUrl,
      fetchedAt: signals.fetchedAt,
      scores: { overall, grade: legacyGrade(overall) },
      categories: legacyCategories,
      totals: { errors, warnings, infos },
      references: {
        metadata: { scores: meta.scores, issues: meta.issues.length },
        schema: schema
          ? { scores: schema.scores, detectedTypes: schema.detectedTypes, recommendedTypes: schema.recommendedTypes }
          : { scores: { overall: 0, coverage: 0, quality: 0 }, detectedTypes: [], recommendedTypes: [] },
        sitemap: sitemap
          ? { scores: sitemap.scores, totalUrls: sitemap.stats.totalUrls, truncated: sitemap.truncated }
          : { scores: { overall: 0, coverage: 0, freshness: 0, structure: 0 }, totalUrls: 0, truncated: false },
      },
      report,
    };
  },
};
