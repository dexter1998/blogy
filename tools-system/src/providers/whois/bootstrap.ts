/**
 * IANA RDAP bootstrap: maps every TLD to its authoritative registry RDAP
 * endpoint (e.g. ".com → https://rdap.verisign.com/com/v1/", ".io → …).
 * Cached for 24h. When a TLD isn't in the registry, callers fall back to
 * https://rdap.org/domain/{domain}, which performs its own discovery.
 *
 * Spec: https://datatracker.ietf.org/doc/html/rfc7484
 */

import { fetchJson } from "@/providers/_shared/cached-fetch";
import { cache } from "@/lib/cache";

const IANA_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const CACHE_KEY = "rdap:bootstrap:dns";
const CACHE_TTL = 24 * 60 * 60;

type BootstrapDoc = {
  /** Each entry: [["tld1","tld2",…], ["https://rdap.example/", …]] */
  services: Array<[string[], string[]]>;
  publication?: string;
  version?: string;
};

type BootstrapMap = {
  /** lowercased tld → array of base RDAP URLs (without trailing slash). */
  tlds: Record<string, string[]>;
  publication: string | null;
};

let inflight: Promise<BootstrapMap | null> | null = null;

async function loadBootstrap(): Promise<BootstrapMap | null> {
  const hit = await cache.get<BootstrapMap>(CACHE_KEY);
  if (hit) return hit;
  if (inflight) return inflight;

  inflight = (async () => {
    const doc = await fetchJson<BootstrapDoc>(IANA_BOOTSTRAP_URL, {
      timeoutMs: 5000,
    });
    if (!doc || !Array.isArray(doc.services)) return null;
    const map: BootstrapMap = {
      tlds: {},
      publication: doc.publication ?? null,
    };
    for (const [tlds, urls] of doc.services) {
      const cleanUrls = urls
        .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u))
        .map((u) => u.replace(/\/+$/, ""));
      if (cleanUrls.length === 0) continue;
      for (const tld of tlds) {
        if (typeof tld !== "string") continue;
        map.tlds[tld.toLowerCase()] = cleanUrls;
      }
    }
    await cache.set(CACHE_KEY, map, CACHE_TTL);
    return map;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

/**
 * Returns the RDAP base URLs for a TLD (e.g. ["https://rdap.verisign.com/com/v1"]).
 * For multi-label TLDs (e.g. "co.uk") tries the full label first, then peels
 * back to the right-most label. Returns [] when nothing matches.
 */
export async function rdapBaseUrlsForTld(tld: string): Promise<string[]> {
  const map = await loadBootstrap();
  if (!map) return [];
  const candidates = [tld.toLowerCase()];
  const parts = tld.split(".");
  if (parts.length > 1) candidates.push(parts[parts.length - 1]!.toLowerCase());
  for (const c of candidates) {
    if (map.tlds[c]) return map.tlds[c];
  }
  return [];
}
