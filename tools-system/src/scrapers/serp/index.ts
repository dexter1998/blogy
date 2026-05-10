import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { classifyIntent, fetchSerp } from "@/scrapers/_shared/serp";
import type { SerpScrapeInput, SerpScrapeResult } from "./types";

export const serpScraper: Scraper<SerpScrapeInput, SerpScrapeResult> = {
  name: "serp",
  // SERPs change constantly — short cache so callers get something fresh,
  // but we don't hammer DDG/Bing for the same query in a tight loop.
  cacheTtlSeconds: Math.min(env.cacheTtlSeconds, 600),

  cacheKey(input) {
    if (input.fresh) return null;
    return `${(input.region ?? "us-en").toLowerCase()}:${input.query.trim().toLowerCase()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<SerpScrapeResult> {
    const region = input.region ?? "us-en";
    const fetched = await fetchSerp(input.query, region);
    if (!fetched.ok && fetched.results.length === 0) {
      throw new ScrapeError("scrape_failed", `No SERP results: ${fetched.error ?? "unknown"}`);
    }
    const intent = classifyIntent(fetched, input.query);
    const counts = new Map<string, number>();
    for (const r of fetched.results) {
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, "");
        counts.set(host, (counts.get(host) ?? 0) + 1);
      } catch {
        /* skip malformed url */
      }
    }
    const domains = Array.from(counts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);

    return {
      query: input.query,
      region,
      source: fetched.source,
      fetchedAt: fetched.fetchedAt,
      totalResults: fetched.results.length,
      results: fetched.results,
      related: fetched.related,
      intent: intent.intent,
      intentSignals: intent.signals,
      domains,
      ok: true,
    };
  },
};
