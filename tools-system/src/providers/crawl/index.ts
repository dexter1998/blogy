import { runWithFallback, type Provider } from "@/providers/types";
import { cache } from "@/lib/cache";
import { sitemapRobots } from "./sitemap-robots";
import type { CrawlSnapshot } from "./types";

export type { CrawlSnapshot } from "./types";

const CHAIN: Provider<{ origin: string }, CrawlSnapshot>[] = [sitemapRobots];

const CACHE_TTL = 60 * 60; // sitemaps change daily-ish; an hour is fine

export async function crawlSnapshot(origin: string) {
  const key = `provider:crawl:${origin}`;
  const hit = await cache.get<{ source: string; data: CrawlSnapshot; attempted: string[] }>(key);
  if (hit) return hit;
  const r = await runWithFallback(CHAIN, { origin });
  if (r.data) {
    const value = { source: r.source, data: r.data, attempted: r.attempted };
    await cache.set(key, value, CACHE_TTL);
    return value;
  }
  return { source: r.source, data: null, attempted: r.attempted, error: r.error };
}
