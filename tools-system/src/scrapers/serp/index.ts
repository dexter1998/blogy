/**
 * Multi-engine SERP scraper.
 *
 * The actual fetch + parse logic lives in `_shared/search` so the same
 * code powers the PAA API. This file only:
 *   - resolves the request shape against the country/engine registry
 *   - merges the per-engine output for presentation
 *   - layers the intent classifier on top
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_ENGINE_IDS,
  runMultiEngine,
  type FeaturedSnippet,
} from "@/scrapers/_shared/search";
import type {
  DomainCount,
  SerpIntent,
  SerpScrapeInput,
  SerpScrapeResult,
} from "./types";

function classifyIntent(
  results: SerpScrapeResult["results"],
  query: string,
): { intent: SerpIntent; signals: { howTo: number; brand: number; commercial: number; comparison: number } } {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/);
  const isQuestion =
    /^(how|what|why|when|where|who|is|can|does|do|will|should)\b/.test(q) || q.endsWith("?");
  const commercialQuery = /\b(buy|price|cheap|deal|coupon|discount|order|shop)\b/.test(q);
  const comparisonQuery = /\b(vs|versus|best|top|review|alternative)\b/.test(q);

  let howTo = 0;
  let brand = 0;
  let commercial = 0;
  let comparison = 0;
  for (const r of results.slice(0, 10)) {
    const blob = `${r.title} ${r.snippet} ${r.url}`.toLowerCase();
    if (/\b(how to|tutorial|guide|step[- ]by[- ]step|wikipedia)\b/.test(blob)) howTo++;
    if (tokens.some((t) => t.length > 3 && r.url.toLowerCase().includes(t))) brand++;
    if (/\b(buy|shop|price|amazon|ebay|cart|sale)\b/.test(blob)) commercial++;
    if (/\b(vs|versus|best|top \d+|compare|review|alternative)\b/.test(blob)) comparison++;
  }

  let intent: SerpIntent = "mixed";
  if (commercialQuery || commercial >= 3) intent = "transactional";
  else if (comparisonQuery || comparison >= 3) intent = "commercial";
  else if (isQuestion || howTo >= 3) intent = "informational";
  else if (brand >= 3) intent = "navigational";

  return { intent, signals: { howTo, brand, commercial, comparison } };
}

export const serpScraper: Scraper<SerpScrapeInput, SerpScrapeResult> = {
  name: "serp",
  // SERPs change constantly — short cache so callers get something fresh,
  // but we don't hammer engines for the same query in a tight loop.
  cacheTtlSeconds: Math.min(env.cacheTtlSeconds, 600),

  cacheKey(input) {
    if (input.fresh) return null;
    const country = (input.country ?? DEFAULT_COUNTRY_CODE).toUpperCase();
    const engines = (input.engines && input.engines.length > 0
      ? [...input.engines]
      : DEFAULT_ENGINE_IDS
    )
      .slice()
      .sort()
      .join(",");
    return `${country}:${engines}:${input.query.trim().toLowerCase()}`;
  },

  async execute(input, ctx: ScrapeContext): Promise<SerpScrapeResult> {
    const result = await runMultiEngine({
      query: input.query,
      country: input.country,
      engines: input.engines,
      maxResults: input.maxResults,
      ...(ctx.signal ? { signal: ctx.signal } : {}),
    });

    const anyOk = result.engines.some((e) => e.ok);
    if (!anyOk && result.merged.length === 0) {
      const reasons = result.engines.map((e) => `${e.engine}:${e.error ?? "unknown"}`).join(", ");
      throw new ScrapeError("scrape_failed", `All engines failed (${reasons})`);
    }

    const featuredSnippets: FeaturedSnippet[] = result.perEngine
      .map((f) => f.featuredSnippet)
      .filter((x): x is FeaturedSnippet => x !== null);

    const counts = new Map<string, number>();
    for (const r of result.merged) {
      if (!r.domain) continue;
      counts.set(r.domain, (counts.get(r.domain) ?? 0) + 1);
    }
    const domains: DomainCount[] = Array.from(counts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    const blocks = result.perEngine.reduce(
      (acc, f) => ({
        ads: acc.ads + f.blocks.ads,
        videos: acc.videos + f.blocks.videos,
        images: acc.images + f.blocks.images,
        news: acc.news + f.blocks.news,
        hasFeaturedSnippet: acc.hasFeaturedSnippet || f.blocks.hasFeaturedSnippet,
        hasKnowledgePanel: acc.hasKnowledgePanel || f.blocks.hasKnowledgePanel,
        hasLocalPack: acc.hasLocalPack || f.blocks.hasLocalPack,
      }),
      {
        ads: 0,
        videos: 0,
        images: 0,
        news: 0,
        hasFeaturedSnippet: false,
        hasKnowledgePanel: false,
        hasLocalPack: false,
      },
    );

    const intent = classifyIntent(result.merged, input.query);

    return {
      query: input.query,
      country: result.country,
      language: result.language,
      fetchedAt: new Date().toISOString(),
      totalResults: result.merged.length,
      results: result.merged,
      perEngine: result.perEngine,
      engines: result.engines,
      featuredSnippets,
      paa: result.mergedPaa,
      related: result.mergedRelated,
      blocks,
      intent: intent.intent,
      intentSignals: intent.signals,
      domains,
      ok: true,
    };
  },
};
