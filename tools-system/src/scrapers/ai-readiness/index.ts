/**
 * AI Readiness scraper. Scores how likely a page is to be picked up,
 * understood, and cited by Google AI Overviews, ChatGPT search, and
 * Perplexity. Combines:
 * - E-E-A-T proxies (author byline + bio, publish/modified dates,
 *   organisation/article schema, external citations)
 * - Structural readability (heading hierarchy, paragraph length,
 *   FAQ/HowTo/Breadcrumb schema)
 * - Machine readability (canonical, OG, Twitter, JSON-LD, llms.txt,
 *   robots allow)
 * - Freshness (modified-date age band)
 */

import * as cheerio from "cheerio";
import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import { loadPage, originOf, visibleText } from "@/scrapers/_shared/html";
import type { AiReadinessInput, AiReadinessResult, EeatSignals, StructureSignals } from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function collectJsonLd($: cheerio.CheerioAPI): unknown[] {
  const out: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = ($(el).contents().text() ?? "").trim();
    if (!txt) return;
    try {
      const p = JSON.parse(txt);
      if (Array.isArray(p)) out.push(...p);
      else if (p && typeof p === "object" && Array.isArray((p as Record<string, unknown>)["@graph"])) {
        out.push(...((p as Record<string, unknown>)["@graph"] as unknown[]));
      } else out.push(p);
    } catch {
      /* skip */
    }
  });
  return out;
}

function hasType(nodes: unknown[], type: string): boolean {
  return nodes.some((n) => {
    if (!n || typeof n !== "object") return false;
    const t = (n as Record<string, unknown>)["@type"];
    return t === type || (Array.isArray(t) && t.includes(type));
  });
}

function findArticleNode(nodes: unknown[]): Record<string, unknown> | null {
  return (
    (nodes.find((n) => {
      if (!n || typeof n !== "object") return false;
      const t = (n as Record<string, unknown>)["@type"];
      return ["Article", "NewsArticle", "BlogPosting"].includes(typeof t === "string" ? t : Array.isArray(t) ? (t[0] as string) : "");
    }) as Record<string, unknown> | undefined) ?? null
  );
}

export const aiReadinessScraper: Scraper<AiReadinessInput, AiReadinessResult> = {
  name: "ai-readiness",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<AiReadinessResult> {
    const loaded = await loadPage(input.url);
    if (!loaded.ok) {
      throw new ScrapeError("scrape_failed", `Could not fetch URL: ${loaded.error}`);
    }
    const { $, finalUrl } = loaded.page;
    const origin = originOf(finalUrl);

    const nodes = collectJsonLd($);
    const article = findArticleNode(nodes);

    const datePublished = parseDate(
      ($('meta[property="article:published_time"]').attr("content") ??
        $('time[itemprop="datePublished"]').attr("datetime") ??
        $("time[pubdate]").attr("datetime") ??
        (article?.["datePublished"] as string | undefined)) ?? null,
    );
    const dateModified = parseDate(
      ($('meta[property="article:modified_time"]').attr("content") ??
        $('time[itemprop="dateModified"]').attr("datetime") ??
        (article?.["dateModified"] as string | undefined)) ?? null,
    );
    const newest = dateModified ?? datePublished;
    const ageDays = newest ? Math.floor((Date.now() - newest.getTime()) / 86_400_000) : null;

    // Author signals
    const hasAuthorByline =
      $('[rel="author"], [itemprop="author"], .author, .byline, [class*="author-name"]').length > 0 ||
      !!article?.["author"] ||
      !!$('meta[name="author"]').attr("content");
    const hasAuthorBio =
      $('[class*="author-bio"], .about-author, [data-bio], [itemprop="author"] [itemprop="description"]').length > 0;

    const externalCitations = $("a[href]").toArray().filter((el) => {
      const href = ($(el).attr("href") ?? "").trim();
      try {
        return new URL(href, finalUrl).origin !== origin;
      } catch {
        return false;
      }
    }).length;

    const eeat: EeatSignals = {
      hasAuthorByline,
      hasAuthorBio,
      hasPublishedDate: datePublished !== null,
      hasModifiedDate: dateModified !== null,
      ageDays,
      hasOrganizationSchema: hasType(nodes, "Organization") || hasType(nodes, "LocalBusiness"),
      hasArticleSchema: !!article,
      hasReviewSchema: hasType(nodes, "Review") || hasType(nodes, "AggregateRating"),
      externalCitations,
    };

    // Structure signals
    const paras = $("p").toArray();
    const text = visibleText($);
    const wc = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const paragraphCount = paras.length;
    const avgParagraphWords =
      paragraphCount > 0
        ? Math.round(
            paras.reduce((acc, p) => acc + ($(p).text().trim().split(/\s+/).filter(Boolean).length), 0) /
              paragraphCount,
          )
        : 0;

    const structure: StructureSignals = {
      hasH1: $("h1").length > 0,
      h2Count: $("h2").length,
      paragraphCount,
      avgParagraphWords,
      hasFaqSchema: hasType(nodes, "FAQPage"),
      hasHowToSchema: hasType(nodes, "HowTo"),
      hasBreadcrumbSchema: hasType(nodes, "BreadcrumbList"),
    };

    // Machine readability
    const llmsRes = await httpGet(`${origin}/llms.txt`, { timeoutMs: 5000 });
    const robotsRes = await httpGet(`${origin}/robots.txt`, { timeoutMs: 5000 });
    const robotsBody = robotsRes.ok ? robotsRes.body.toLowerCase() : "";
    const hasRobotsAllow = !robotsRes.ok || (!/disallow:\s*\/\s*$/m.test(robotsBody) || /allow:\s*\//.test(robotsBody));

    const machineReadability = {
      canonical: $('link[rel="canonical"]').attr("href")?.trim() || null,
      hasMetaDescription: ($('meta[name="description"]').attr("content")?.trim() ?? "").length > 0,
      hasOpenGraph: $('meta[property^="og:"]').length > 0,
      hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
      hasJsonLd: nodes.length > 0,
      hasLlmsTxt: llmsRes.ok && llmsRes.body.trim().length > 0,
      hasRobotsAllow,
    };

    // ── Scores ──
    let eeatScore = 0;
    if (eeat.hasAuthorByline) eeatScore += 18;
    if (eeat.hasAuthorBio) eeatScore += 12;
    if (eeat.hasPublishedDate) eeatScore += 12;
    if (eeat.hasModifiedDate) eeatScore += 8;
    if (eeat.hasOrganizationSchema) eeatScore += 15;
    if (eeat.hasArticleSchema) eeatScore += 15;
    if (eeat.hasReviewSchema) eeatScore += 5;
    eeatScore += Math.min(15, externalCitations / 2);

    let structureScore = 0;
    if (structure.hasH1) structureScore += 15;
    structureScore += Math.min(20, structure.h2Count * 4);
    if (structure.paragraphCount >= 5) structureScore += 15;
    if (structure.avgParagraphWords >= 30 && structure.avgParagraphWords <= 80) structureScore += 15;
    else if (structure.avgParagraphWords > 0) structureScore += 5;
    if (structure.hasFaqSchema) structureScore += 15;
    if (structure.hasHowToSchema) structureScore += 10;
    if (structure.hasBreadcrumbSchema) structureScore += 10;

    let machine = 0;
    if (machineReadability.canonical) machine += 15;
    if (machineReadability.hasMetaDescription) machine += 15;
    if (machineReadability.hasOpenGraph) machine += 15;
    if (machineReadability.hasTwitterCard) machine += 10;
    if (machineReadability.hasJsonLd) machine += 25;
    if (machineReadability.hasLlmsTxt) machine += 10;
    if (machineReadability.hasRobotsAllow) machine += 10;

    let freshness = 50;
    if (ageDays === null) freshness = 30;
    else if (ageDays < 90) freshness = 95;
    else if (ageDays < 365) freshness = 75;
    else if (ageDays < 730) freshness = 55;
    else freshness = 30;

    const scores = {
      eeat: clamp(eeatScore),
      structure: clamp(structureScore),
      machineReadability: clamp(machine),
      freshness: clamp(freshness),
      overall: 0,
    };
    scores.overall = clamp(
      scores.eeat * 0.35 + scores.structure * 0.25 + scores.machineReadability * 0.25 + scores.freshness * 0.15,
    );

    // ── Recommendations ──
    const recs: AiReadinessResult["recommendations"] = [];
    if (!eeat.hasAuthorByline) recs.push({ priority: "high", message: "Add a visible author byline" });
    if (!eeat.hasAuthorBio) recs.push({ priority: "medium", message: "Add an author bio block (E-E-A-T)" });
    if (!eeat.hasPublishedDate) recs.push({ priority: "high", message: "Mark the published date with <time> or article:published_time" });
    if (!eeat.hasArticleSchema) recs.push({ priority: "high", message: "Add Article / BlogPosting JSON-LD" });
    if (!eeat.hasOrganizationSchema) recs.push({ priority: "medium", message: "Add Organization JSON-LD with logo + sameAs" });
    if (!structure.hasFaqSchema && structure.h2Count >= 5)
      recs.push({ priority: "medium", message: "FAQPage schema would expose passages to AI Overviews" });
    if (structure.avgParagraphWords > 90)
      recs.push({ priority: "medium", message: `Paragraphs average ${structure.avgParagraphWords} words — shorter passages cite better` });
    if (!machineReadability.hasJsonLd) recs.push({ priority: "high", message: "Add at least one JSON-LD block" });
    if (!machineReadability.hasLlmsTxt) recs.push({ priority: "low", message: "Add /llms.txt to guide AI crawlers" });
    if (ageDays !== null && ageDays > 365)
      recs.push({ priority: "medium", message: `Content last updated ${Math.round(ageDays / 365)}y ago — refresh for AI freshness signals` });
    void wc;

    return {
      url: input.url,
      finalUrl,
      fetchedAt: new Date().toISOString(),
      scores,
      eeat,
      structure,
      machineReadability,
      recommendations: recs,
    };
  },
};
