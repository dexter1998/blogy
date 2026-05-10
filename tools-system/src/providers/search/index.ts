import { runWithFallback, type Provider } from "@/providers/types";
import { cache } from "@/lib/cache";
import { duckduckgoSearch } from "./duckduckgo";

export type { SearchPresence } from "./duckduckgo";
import type { SearchPresence } from "./duckduckgo";

const CHAIN: Provider<{ host: string }, SearchPresence>[] = [duckduckgoSearch];

const CACHE_TTL = 6 * 60 * 60;

export async function searchPresence(host: string) {
  const key = `provider:search:${host}`;
  const hit = await cache.get<{ source: string; data: SearchPresence; attempted: string[] }>(key);
  if (hit) return hit;
  const r = await runWithFallback(CHAIN, { host });
  if (r.data) {
    const value = { source: r.source, data: r.data, attempted: r.attempted };
    await cache.set(key, value, CACHE_TTL);
    return value;
  }
  return { source: r.source, data: null, attempted: r.attempted, error: r.error };
}
