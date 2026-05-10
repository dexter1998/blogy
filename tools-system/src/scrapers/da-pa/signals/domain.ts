import { lookupWhois, resolveDns } from "@/providers";
import type { DomainSignals } from "@/scrapers/da-pa/types";

const KNOWN_TLD_QUALITY: Record<string, number> = {
  com: 1.0,
  org: 0.95,
  net: 0.9,
  edu: 1.0,
  gov: 1.0,
  io: 0.9,
  co: 0.85,
  ai: 0.85,
  in: 0.85,
  app: 0.85,
  dev: 0.85,
};

export function tldQuality(tld: string): number {
  const t = tld.toLowerCase();
  return KNOWN_TLD_QUALITY[t] ?? 0.7;
}

/**
 * Combine the WHOIS provider chain (RDAP → port-43 whois) with the DNS
 * provider chain (Google DoH → Cloudflare DoH → node:dns). All real-time
 * lookups, all cached at the provider layer.
 */
export async function collectDomainSignals(url: string): Promise<DomainSignals> {
  const u = new URL(url);
  const domain = u.hostname.replace(/^www\./, "");
  const tld = domain.split(".").pop() ?? "";
  const https = u.protocol === "https:";

  const [whoisR, dnsR] = await Promise.all([lookupWhois(domain), resolveDns(domain)]);

  const w = whoisR.data;
  const d = dnsR.data;

  return {
    domain,
    tld,
    ageDays: w?.ageDays ?? null,
    ageYears: w?.ageYears ?? null,
    registrar: w?.registrar ?? null,
    createdAt: w?.createdAt ?? null,
    https,
    dnsHealthy: !!d && d.a.length + d.aaaa.length > 0,
    hasMx: !!d && d.mx.length > 0,
    hasSpf: !!d && d.hasSpf,
    hasDmarc: !!d && d.hasDmarc,
    provenance: {
      whois: w ? whoisR.source : null,
      dns: d ? dnsR.source : null,
    },
  };
}
