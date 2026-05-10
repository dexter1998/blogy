/**
 * Provider-aware fetch helper. Wraps shared httpGet with optional JSON parse,
 * stamps a `source` label, and times the call. Cache is *external* — providers
 * cache via lib/cache when they want to.
 */

import { httpGet, type HttpResult } from "@/scrapers/_shared/http";
import { cache } from "@/lib/cache";

export type FetchOpts = {
  timeoutMs?: number;
  cacheKey?: string;
  cacheTtlSeconds?: number;
  headers?: Record<string, string>;
};

export async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; tookMs: number }> {
  const t0 = Date.now();
  const value = await fn();
  return { value, tookMs: Date.now() - t0 };
}

export async function getCached<T>(
  key: string | undefined,
  ttlSeconds: number,
  fn: () => Promise<T | null>,
): Promise<T | null> {
  if (!key) return fn();
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;
  const fresh = await fn();
  if (fresh !== null) await cache.set(key, fresh, ttlSeconds);
  return fresh;
}

export async function fetchText(
  url: string,
  opts: FetchOpts = {},
): Promise<HttpResult> {
  return httpGet(url, { timeoutMs: opts.timeoutMs });
}

export async function fetchJson<T>(
  url: string,
  opts: FetchOpts = {},
): Promise<T | null> {
  const res = await httpGet(url, { timeoutMs: opts.timeoutMs });
  if (!res.ok) return null;
  try {
    return JSON.parse(res.body) as T;
  } catch {
    return null;
  }
}
