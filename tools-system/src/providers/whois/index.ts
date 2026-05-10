/**
 * WHOIS provider — RDAP-first.
 *
 * Two public surfaces:
 *  - lookupWhois(domain): legacy compact WhoisRecord used by the DA-PA scorer.
 *    Cached 24h. Falls back to native port-43 whois if RDAP is empty.
 *  - lookupRdap(input):   full RdapRecord powering /api/v1/whois and the
 *    WHOIS Lookup tool. Cached 24h.
 */

import { runWithFallback, type Provider, type ProviderResult } from "@/providers/types";
import { cache } from "@/lib/cache";
import { fetchRdap, type RdapInput } from "./rdap";
import { nativeWhois } from "./native-whois";
import { normalizeDomain } from "@/lib/validation/domain";
import type { RdapRecord, WhoisRecord } from "./types";

export type { WhoisRecord, RdapRecord } from "./types";

const CACHE_TTL = 24 * 60 * 60;

// ─── Rich RDAP lookup ──────────────────────────────────────────────────────

export type LookupRdapResult = {
  source: "rdap" | "cache";
  data: RdapRecord | null;
  error?: string;
};

export async function lookupRdap(
  input: string | RdapInput,
): Promise<LookupRdapResult> {
  let resolved: RdapInput;
  if (typeof input === "string") {
    const norm = normalizeDomain(input);
    resolved = { domain: norm.registrable, tld: norm.tld };
  } else {
    resolved = input;
  }

  const key = `rdap:lookup:${resolved.domain}`;
  const hit = await cache.get<RdapRecord>(key);
  if (hit) return { source: "cache", data: hit };

  try {
    const rec = await fetchRdap(resolved);
    if (rec) {
      await cache.set(key, rec, CACHE_TTL);
      return { source: "rdap", data: rec };
    }
    return { source: "rdap", data: null, error: "no_record" };
  } catch (e) {
    return {
      source: "rdap",
      data: null,
      error: e instanceof Error ? e.message : "rdap_failed",
    };
  }
}

// ─── Legacy compact WHOIS (kept for DA-PA scorer) ──────────────────────────

const rdapProvider: Provider<{ domain: string }, WhoisRecord> = {
  name: "rdap",
  async fetch({ domain }): Promise<ProviderResult<WhoisRecord>> {
    const t0 = Date.now();
    let rec: RdapRecord | null = null;
    try {
      const norm = normalizeDomain(domain);
      rec = await fetchRdap({ domain: norm.registrable, tld: norm.tld });
    } catch {
      // fall through
    }
    if (!rec) {
      return { source: "rdap", data: null, tookMs: Date.now() - t0, error: "no_record" };
    }
    const compact: WhoisRecord = {
      domain,
      createdAt: rec.registrationDate,
      registrar: rec.registrar.name,
      ageDays: rec.ageDays,
      ageYears: rec.ageYears,
    };
    return { source: "rdap", data: compact, tookMs: Date.now() - t0 };
  },
};

const CHAIN: Provider<{ domain: string }, WhoisRecord>[] = [rdapProvider, nativeWhois];

export async function lookupWhois(domain: string) {
  const key = `provider:whois:${domain}`;
  const hit = await cache.get<{ source: string; data: WhoisRecord; attempted: string[] }>(key);
  if (hit) return hit;
  const r = await runWithFallback(CHAIN, { domain });
  if (r.data) {
    const value = { source: r.source, data: r.data, attempted: r.attempted };
    await cache.set(key, value, CACHE_TTL);
    return value;
  }
  return { source: r.source, data: null, attempted: r.attempted, error: r.error };
}
