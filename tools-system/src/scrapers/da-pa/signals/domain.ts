import dns from "node:dns/promises";
import whois from "whois-json";
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

function parseWhoisDate(value: unknown): Date | null {
  if (!value) return null;
  const s = Array.isArray(value) ? String(value[0]) : String(value);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() < 1985 || d > new Date()) return null;
  return d;
}

export async function collectDomainSignals(
  url: string,
): Promise<DomainSignals> {
  const u = new URL(url);
  const domain = u.hostname.replace(/^www\./, "");
  const tld = domain.split(".").pop() ?? "";
  const https = u.protocol === "https:";

  const [whoisResult, dnsResult] = await Promise.allSettled([
    whois(domain, { follow: 2, timeout: 6000 }) as Promise<Record<string, unknown>>,
    Promise.allSettled([
      dns.resolve4(domain).catch(() => []),
      dns.resolveMx(domain).catch(() => []),
      dns.resolveTxt(domain).catch(() => [] as string[][]),
    ]),
  ]);

  let createdAt: Date | null = null;
  let registrar: string | null = null;
  if (whoisResult.status === "fulfilled" && whoisResult.value) {
    const w = whoisResult.value;
    createdAt =
      parseWhoisDate(w.creationDate) ||
      parseWhoisDate(w.created) ||
      parseWhoisDate(w.createdOn) ||
      parseWhoisDate(w.registered) ||
      parseWhoisDate((w as Record<string, unknown>)["Creation Date"]);
    const r = w.registrar ?? (w as Record<string, unknown>)["Registrar"];
    registrar = typeof r === "string" ? r : null;
  }

  let dnsHealthy = false;
  let hasMx = false;
  let hasSpf = false;
  if (dnsResult.status === "fulfilled") {
    const [a, mx, txt] = dnsResult.value;
    dnsHealthy =
      a.status === "fulfilled" &&
      Array.isArray(a.value) &&
      (a.value as string[]).length > 0;
    hasMx =
      mx.status === "fulfilled" &&
      Array.isArray(mx.value) &&
      (mx.value as unknown[]).length > 0;
    if (txt.status === "fulfilled" && Array.isArray(txt.value)) {
      hasSpf = (txt.value as string[][]).some((rec) =>
        rec.join("").toLowerCase().includes("v=spf1"),
      );
    }
  }

  const ageDays = createdAt
    ? Math.floor((Date.now() - createdAt.getTime()) / 86_400_000)
    : null;
  const ageYears = ageDays !== null ? Math.round((ageDays / 365.25) * 10) / 10 : null;

  return {
    domain,
    tld,
    ageDays,
    ageYears,
    registrar,
    createdAt: createdAt ? createdAt.toISOString() : null,
    https,
    dnsHealthy,
    hasMx,
    hasSpf,
  };
}
