/**
 * SEO Audit composite scraper. Reuses Metadata, Schema, and Sitemap
 * scrapers in parallel, plus an own on-page content + link assessment.
 * Each category is scored 0-100 with a weight, then combined into a
 * single overall score and letter grade.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { loadPage, originOf, visibleText, wordCount } from "@/scrapers/_shared/html";
import { metadataScraper } from "@/scrapers/metadata";
import { schemaScraper } from "@/scrapers/schema";
import { sitemapScraper } from "@/scrapers/sitemap";
import type { SeoAuditCategory, SeoAuditInput, SeoAuditResult } from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function gradeOf(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export const seoAuditScraper: Scraper<SeoAuditInput, SeoAuditResult> = {
  name: "seo-audit",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, ctx: ScrapeContext): Promise<SeoAuditResult> {
    const u = new URL(input.url);
    const origin = originOf(input.url);

    // We call each module's scraper through their own caches — that way a
    // standalone /api/v1/metadata?url=… call shares the cached result.
    const [metaRun, schemaRun, sitemapRun, page] = await Promise.all([
      metadataScraper.execute({ url: input.url, fresh: input.fresh }, ctx).catch((e) => ({ _err: e })),
      schemaScraper.execute({ url: input.url, fresh: input.fresh }, ctx).catch((e) => ({ _err: e })),
      sitemapScraper.execute({ url: origin, fresh: input.fresh }, ctx).catch((e) => ({ _err: e })),
      loadPage(input.url),
    ]);

    if ("_err" in metaRun) {
      throw new ScrapeError("scrape_failed", `Audit failed: ${(metaRun._err as Error).message}`);
    }
    const meta = metaRun;
    const schema = "_err" in schemaRun ? null : schemaRun;
    const sitemap = "_err" in sitemapRun ? null : sitemapRun;

    if (!page.ok) {
      throw new ScrapeError("scrape_failed", `Could not fetch URL: ${page.error}`);
    }
    const $ = page.page.$;
    const text = visibleText($);
    const wc = wordCount(text);

    // ── Content category ──
    const contentIssues: SeoAuditCategory["issues"] = [];
    let contentScore = 30;
    if (wc >= 600) contentScore += 30;
    else if (wc >= 300) contentScore += 15;
    else contentIssues.push({ severity: "warning", message: `Thin content: ${wc} words` });
    const h2 = $("h2").length;
    const h3 = $("h3").length;
    if (h2 + h3 >= 3) contentScore += 15;
    else contentIssues.push({ severity: "info", message: "Few subheadings — content structure could improve" });
    if ($("img").length > 0) {
      const imgs = $("img").toArray();
      const missing = imgs.filter((el) => !($(el).attr("alt") ?? "").trim()).length;
      if (missing === 0) contentScore += 15;
      else contentIssues.push({ severity: "warning", message: `${missing}/${imgs.length} images missing alt text` });
    }
    if ($('a[rel*="nofollow"]').length / Math.max(1, $("a[href]").length) > 0.5) {
      contentIssues.push({ severity: "warning", message: "More than half of links are nofollow" });
    }

    // ── Links category ──
    const linksIssues: SeoAuditCategory["issues"] = [];
    let linksScore = 40;
    const allLinks = $("a[href]").toArray();
    const internal = allLinks.filter((el) => {
      const href = ($(el).attr("href") ?? "").trim();
      try {
        return new URL(href, page.page.finalUrl).origin === origin;
      } catch {
        return false;
      }
    }).length;
    const external = allLinks.length - internal;
    if (internal >= 5) linksScore += 25;
    else linksIssues.push({ severity: "warning", message: `Only ${internal} internal links — page may be orphan-like` });
    if (external >= 1) linksScore += 15;
    else linksIssues.push({ severity: "info", message: "No external citations" });
    const emptyAnchors = allLinks.filter((el) => !($(el).text() ?? "").trim()).length;
    if (emptyAnchors === 0) linksScore += 20;
    else linksIssues.push({ severity: "warning", message: `${emptyAnchors} link(s) have empty anchor text` });

    // ── Indexability category ──
    const idxIssues: SeoAuditCategory["issues"] = [];
    let idxScore = 50;
    const robotsMeta = ($('meta[name="robots"]').attr("content") ?? "").toLowerCase();
    if (/noindex/.test(robotsMeta)) {
      idxScore -= 50;
      idxIssues.push({ severity: "error", message: "Page is marked noindex" });
    } else idxScore += 15;
    if (!u.protocol.startsWith("https")) {
      idxScore -= 30;
      idxIssues.push({ severity: "error", message: "Site not served over HTTPS" });
    } else idxScore += 10;
    if (sitemap && sitemap.fetched.some((f) => f.ok)) idxScore += 15;
    else idxIssues.push({ severity: "warning", message: "No reachable sitemap" });
    if (meta.basic.canonical) idxScore += 10;

    // ── Build categories ──
    const categories: SeoAuditCategory[] = [
      {
        name: "metadata",
        score: meta.scores.overall,
        weight: 0.2,
        summary: `${meta.issues.filter((i) => i.severity === "error").length} errors · ${meta.issues.filter((i) => i.severity === "warning").length} warnings`,
        issues: meta.issues.map((i) => ({ severity: i.severity, message: `[${i.field}] ${i.message}` })),
      },
      {
        name: "schema",
        score: schema?.scores.overall ?? 0,
        weight: 0.15,
        summary: schema
          ? `${schema.totalItems} item(s), types: ${schema.detectedTypes.slice(0, 5).join(", ") || "none"}`
          : "Schema scan failed",
        issues: schema ? schema.issues.slice(0, 10).map((i) => ({ severity: i.severity, message: i.message })) : [],
      },
      {
        name: "sitemap",
        score: sitemap?.scores.overall ?? 0,
        weight: 0.1,
        summary: sitemap ? `${sitemap.stats.totalUrls.toLocaleString()} URLs across ${sitemap.fetched.length} sitemap(s)` : "Sitemap scan failed",
        issues: sitemap ? sitemap.issues.slice(0, 10) : [],
      },
      {
        name: "content",
        score: clamp(contentScore),
        weight: 0.2,
        summary: `${wc.toLocaleString()} words, ${h2 + h3} subheadings`,
        issues: contentIssues,
      },
      {
        name: "links",
        score: clamp(linksScore),
        weight: 0.15,
        summary: `${internal} internal · ${external} external`,
        issues: linksIssues,
      },
      {
        name: "indexability",
        score: clamp(idxScore),
        weight: 0.2,
        summary: u.protocol.startsWith("https") ? "HTTPS · canonical present" : "Indexability blocked",
        issues: idxIssues,
      },
    ];

    const overall = clamp(
      categories.reduce((acc, c) => acc + c.score * c.weight, 0),
    );

    const totals = categories.reduce(
      (acc, c) => {
        for (const i of c.issues) {
          if (i.severity === "error") acc.errors += 1;
          else if (i.severity === "warning") acc.warnings += 1;
          else acc.infos += 1;
        }
        return acc;
      },
      { errors: 0, warnings: 0, infos: 0 },
    );

    return {
      url: input.url,
      finalUrl: page.page.finalUrl,
      fetchedAt: new Date().toISOString(),
      scores: { overall, grade: gradeOf(overall) },
      categories,
      totals,
      references: {
        metadata: { scores: meta.scores, issues: meta.issues.length },
        schema: schema
          ? { scores: schema.scores, detectedTypes: schema.detectedTypes, recommendedTypes: schema.recommendedTypes }
          : { scores: { overall: 0, coverage: 0, quality: 0 }, detectedTypes: [], recommendedTypes: [] },
        sitemap: sitemap
          ? { scores: sitemap.scores, totalUrls: sitemap.stats.totalUrls, truncated: sitemap.truncated }
          : { scores: { overall: 0, coverage: 0, freshness: 0, structure: 0 }, totalUrls: 0, truncated: false },
      },
    };
  },
};
