import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { fetchSitemap } from "@/scrapers/_shared/sitemap";
import type { SitemapUrl } from "./types";

export type ExtractInput = { url: string; fresh?: boolean };

export type ExtractResult = {
  source: string;
  fetchedAt: string;
  type: "urlset" | "sitemapindex" | "unknown";
  ok: boolean;
  status: number | null;
  bytes: number;
  durationMs: number;
  /** When the source is a sitemapindex, we surface child links instead of urls. */
  childSitemaps: Array<{ loc: string; lastmod: string | null }>;
  urls: SitemapUrl[];
  error: string | null;
};

export const sitemapExtractScraper: Scraper<ExtractInput, ExtractResult> = {
  name: "sitemap-extract",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return `extract:${new URL(input.url).toString()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<ExtractResult> {
    const parsed = await fetchSitemap(input.url);
    return {
      source: parsed.source,
      fetchedAt: new Date().toISOString(),
      type: parsed.type,
      ok: parsed.ok,
      status: parsed.status ?? null,
      bytes: parsed.bytes ?? 0,
      durationMs: parsed.durationMs ?? 0,
      childSitemaps: parsed.childSitemaps,
      urls: parsed.entries.map((e) => ({
        loc: e.loc,
        lastmod: e.lastmod,
        priority: e.priority,
        changefreq: e.changefreq,
        source: e.source,
        imageCount: e.images?.length,
        videoCount: e.videos?.length,
        hasNews: e.news ? true : undefined,
        hreflangCount: e.alternates?.length,
      })),
      error: parsed.error ?? null,
    };
  },
};
