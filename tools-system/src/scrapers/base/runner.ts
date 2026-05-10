/**
 * Generic runner that wraps a Scraper with caching + timing + abort.
 * API routes call runScraper(), not scraper.execute() directly,
 * so the cache + telemetry behaviour is uniform.
 */

import { cache } from "@/lib/cache";
import { env } from "@/lib/env";
import { Scraper, ScrapeContext } from "./scraper";

export type RunResult<T> = {
  data: T;
  cached: boolean;
  durationMs: number;
};

export async function runScraper<I, O>(
  scraper: Scraper<I, O>,
  input: I,
  ctx: ScrapeContext,
): Promise<RunResult<O>> {
  const started = Date.now();
  const key = scraper.cacheKey(input);
  const cacheable = key !== null && !ctx.bypassCache;

  if (cacheable) {
    const hit = await cache.get<O>(`${scraper.name}:${key}`);
    if (hit) {
      return { data: hit, cached: true, durationMs: Date.now() - started };
    }
  }

  const data = await scraper.execute(input, ctx);

  if (cacheable && key) {
    await cache.set(`${scraper.name}:${key}`, data, scraper.cacheTtlSeconds);
  }

  return { data, cached: false, durationMs: Date.now() - started };
}

export function newAbortSignal(timeoutMs = env.scrapeTimeoutMs): AbortSignal {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), timeoutMs).unref?.();
  return ctrl.signal;
}
