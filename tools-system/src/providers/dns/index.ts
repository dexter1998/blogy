import { runWithFallback, type Provider } from "@/providers/types";
import { cache } from "@/lib/cache";
import { googleDoh } from "./google-doh";
import { cloudflareDoh } from "./cloudflare-doh";
import { nativeDns } from "./native-dns";
import type { DnsRecord } from "./types";

export type { DnsRecord } from "./types";

const CHAIN: Provider<{ domain: string }, DnsRecord>[] = [
  googleDoh,
  cloudflareDoh,
  nativeDns,
];

const CACHE_TTL = 6 * 60 * 60; // DNS rarely changes meaningfully within hours

export async function resolveDns(domain: string) {
  const key = `provider:dns:${domain}`;
  const hit = await cache.get<{ source: string; data: DnsRecord; attempted: string[] }>(key);
  if (hit) return hit;
  const r = await runWithFallback(CHAIN, { domain });
  if (r.data) {
    const value = { source: r.source, data: r.data, attempted: r.attempted };
    await cache.set(key, value, CACHE_TTL);
    return value;
  }
  return { source: r.source, data: null, attempted: r.attempted, error: r.error };
}
