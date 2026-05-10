/**
 * Schema.org structured-data extractor + validator.
 * - JSON-LD: parse every <script type="application/ld+json">
 * - Microdata: walk itemtype/itemprop tree (basic capture, type only)
 * - RDFa: detect typeof="…schema.org…" presence
 *
 * Validation is intentionally pragmatic: we check the most common
 * required fields per type (Article, Product, Organization, etc.)
 * since exhausting schema.org would balloon this file.
 */

import * as cheerio from "cheerio";
import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { loadPage } from "@/scrapers/_shared/html";
import { scoreSchema } from "@/scoring/schema";
import type { SchemaInput, SchemaItem, SchemaResult } from "./types";

const SCHEMA_RULES: Record<string, { required: string[]; recommended: string[] }> = {
  Article: { required: ["headline", "author", "datePublished"], recommended: ["image", "publisher", "dateModified"] },
  NewsArticle: { required: ["headline", "author", "datePublished"], recommended: ["image", "publisher", "dateModified"] },
  BlogPosting: { required: ["headline", "author", "datePublished"], recommended: ["image", "publisher", "dateModified", "mainEntityOfPage"] },
  Product: { required: ["name"], recommended: ["image", "description", "offers", "aggregateRating", "brand"] },
  Organization: { required: ["name"], recommended: ["url", "logo", "sameAs", "contactPoint"] },
  LocalBusiness: { required: ["name", "address"], recommended: ["telephone", "openingHours", "geo", "image"] },
  Person: { required: ["name"], recommended: ["url", "image", "jobTitle", "sameAs"] },
  WebSite: { required: ["name", "url"], recommended: ["potentialAction"] },
  WebPage: { required: ["name"], recommended: ["url", "description"] },
  BreadcrumbList: { required: ["itemListElement"], recommended: [] },
  FAQPage: { required: ["mainEntity"], recommended: [] },
  HowTo: { required: ["name", "step"], recommended: ["image", "totalTime", "estimatedCost"] },
  Recipe: { required: ["name", "recipeIngredient", "recipeInstructions"], recommended: ["image", "author", "datePublished"] },
  Event: { required: ["name", "startDate", "location"], recommended: ["endDate", "image", "offers"] },
  VideoObject: { required: ["name", "uploadDate", "thumbnailUrl"], recommended: ["description", "duration"] },
  Review: { required: ["itemReviewed", "reviewRating", "author"], recommended: ["reviewBody", "datePublished"] },
  Course: { required: ["name", "provider"], recommended: ["description", "url"] },
  JobPosting: { required: ["title", "datePosted", "hiringOrganization"], recommended: ["description", "jobLocation", "baseSalary"] },
  SoftwareApplication: { required: ["name", "applicationCategory"], recommended: ["operatingSystem", "offers", "aggregateRating"] },
};

function getType(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const t = (node as Record<string, unknown>)["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && typeof t[0] === "string") return t[0];
  return null;
}

function validateNode(type: string, node: unknown): { errors: string[]; warnings: string[] } {
  const rules = SCHEMA_RULES[type];
  if (!rules) return { errors: [], warnings: [] };
  const obj = (node ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const f of rules.required) {
    if (!(f in obj) || obj[f] === null || obj[f] === "") {
      errors.push(`Missing required field "${f}"`);
    }
  }
  for (const f of rules.recommended) {
    if (!(f in obj) || obj[f] === null || obj[f] === "") {
      warnings.push(`Recommended field "${f}" missing`);
    }
  }
  return { errors, warnings };
}

function flattenJsonLd(node: unknown): unknown[] {
  if (!node || typeof node !== "object") return [];
  const arr: unknown[] = [];
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    arr.push(...obj["@graph"]);
  } else {
    arr.push(obj);
  }
  return arr;
}

export const schemaScraper: Scraper<SchemaInput, SchemaResult> = {
  name: "schema",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<SchemaResult> {
    const loaded = await loadPage(input.url);
    if (!loaded.ok) {
      throw new ScrapeError("scrape_failed", `Could not fetch URL: ${loaded.error}`);
    }
    const { $, finalUrl } = loaded.page;

    const items: SchemaItem[] = [];
    let jsonLd = 0;
    let microdata = 0;
    let rdfa = 0;

    $('script[type="application/ld+json"]').each((_, el) => {
      const txt = ($(el).contents().text() ?? "").trim();
      if (!txt) return;
      try {
        const parsed = JSON.parse(txt);
        const nodes = Array.isArray(parsed) ? parsed.flatMap(flattenJsonLd) : flattenJsonLd(parsed);
        for (const n of nodes) {
          const type = getType(n) ?? "Unknown";
          const v = validateNode(type, n);
          items.push({ format: "json-ld", type, raw: n, ...v });
          jsonLd += 1;
        }
      } catch (e) {
        items.push({
          format: "json-ld",
          type: "InvalidJSON",
          raw: txt.slice(0, 200),
          errors: [`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`],
          warnings: [],
        });
        jsonLd += 1;
      }
    });

    $("[itemtype]").each((_, el) => {
      const itemtype = ($(el).attr("itemtype") ?? "").trim();
      if (!/schema\.org/i.test(itemtype)) return;
      const type = itemtype.split("/").pop() ?? "Unknown";
      const props: Record<string, string> = {};
      $(el).find("[itemprop]").each((_, p) => {
        const name = $(p).attr("itemprop") ?? "";
        const v = $(p).attr("content") ?? $(p).attr("href") ?? $(p).text().trim();
        if (name && !(name in props)) props[name] = (v ?? "").slice(0, 200);
      });
      const v = validateNode(type, props);
      items.push({ format: "microdata", type, raw: props, ...v });
      microdata += 1;
    });

    $("[typeof]").each((_, el) => {
      const t = ($(el).attr("typeof") ?? "").trim();
      if (!t) return;
      rdfa += 1;
      items.push({ format: "rdfa", type: t, raw: { typeof: t }, errors: [], warnings: [] });
    });

    const detectedTypes = Array.from(new Set(items.map((i) => i.type).filter(Boolean)));
    const recommendedTypes = recommendForUrl(finalUrl, $, detectedTypes);

    const result: SchemaResult = {
      url: input.url,
      finalUrl,
      fetchedAt: new Date().toISOString(),
      totalItems: items.length,
      byFormat: { jsonLd, microdata, rdfa },
      detectedTypes,
      recommendedTypes,
      items,
      issues: [],
      scores: { overall: 0, coverage: 0, quality: 0 },
    };

    const scored = scoreSchema(result);
    result.scores = scored.scores;
    result.issues = scored.issues;
    return result;
  },
};

function recommendForUrl(url: string, $: cheerio.CheerioAPI, detected: string[]): string[] {
  const recs = new Set<string>();
  const path = new URL(url).pathname.toLowerCase();
  const detectedSet = new Set(detected);

  // Always recommend Organization + WebSite for any site
  if (!detectedSet.has("Organization") && !detectedSet.has("LocalBusiness"))
    recs.add("Organization");
  if (!detectedSet.has("WebSite")) recs.add("WebSite");

  if (/\/(blog|article|post|news)\//.test(path)) {
    if (!detectedSet.has("Article") && !detectedSet.has("BlogPosting") && !detectedSet.has("NewsArticle"))
      recs.add("BlogPosting");
  }
  if (/\/product/.test(path) || $('[itemprop="price"], [class*="price"]').length > 0) {
    if (!detectedSet.has("Product")) recs.add("Product");
  }
  // FAQ heuristic: many headings followed by paragraphs
  const faqLike = $("h2, h3").filter((_, el) => /\?\s*$/.test($(el).text())).length;
  if (faqLike >= 3 && !detectedSet.has("FAQPage")) recs.add("FAQPage");
  // Breadcrumb heuristic
  if ($('nav[aria-label*="breadcrumb" i], [class*="breadcrumb" i]').length > 0 && !detectedSet.has("BreadcrumbList"))
    recs.add("BreadcrumbList");

  return Array.from(recs);
}
