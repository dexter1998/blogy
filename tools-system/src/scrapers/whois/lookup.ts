import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { lookupRdap } from "@/providers/whois";
import { normalizeDomain } from "@/lib/validation/domain";
import type { RdapRecord } from "@/providers/whois";

export type WhoisInput = { domain: string; fresh?: boolean };

export type WhoisLookupResult = {
  success: boolean;
  /** Raw user input (after trim). */
  input: string;
  /** Hostname extracted from the input (no protocol/path). */
  host: string;
  /** Registrable root used for the RDAP query. */
  domain: string;
  /** Same as domain, alias for the API contract. */
  normalizedDomain: string;
  /** Effective TLD. */
  tld: string;

  fetchedAt: string;
  /** Where the answer came from on this call. */
  source: "rdap" | "whoisxml" | "cache" | null;
  /** Provider chain attempted in order, useful for debugging. */
  attempted: string[];
  cached: boolean;

  rdapServer: string | null;
  registrationDate: string | null;
  updatedDate: string | null;
  expiryDate: string | null;
  age: { days: number | null; years: number | null; daysUntilExpiry: number | null };

  registrar: RdapRecord["registrar"] | null;
  nameservers: string[];
  status: string[];
  dnssec: boolean | null;
  registryDomainId: string | null;
  entities: RdapRecord["entities"];

  raw: unknown;
  timings: RdapRecord["timings"] | null;

  error: string | null;
};

export const whoisLookupScraper: Scraper<WhoisInput, WhoisLookupResult> = {
  name: "whois-lookup",
  cacheTtlSeconds: 24 * 60 * 60,

  cacheKey(input) {
    if (input.fresh) return null;
    try {
      const norm = normalizeDomain(input.domain);
      return `whois-lookup:${norm.registrable}`;
    } catch {
      return null;
    }
  },

  async execute(input, _ctx: ScrapeContext): Promise<WhoisLookupResult> {
    let norm;
    try {
      norm = normalizeDomain(input.domain);
    } catch (e) {
      throw new ScrapeError(
        "invalid_domain",
        e instanceof Error ? e.message : "Invalid domain",
      );
    }

    const result = await lookupRdap({ domain: norm.registrable, tld: norm.tld });
    const fetchedAt = new Date().toISOString();

    if (!result.data) {
      return {
        success: false,
        input: input.domain.trim(),
        host: norm.host,
        domain: norm.registrable,
        normalizedDomain: norm.registrable,
        tld: norm.tld,
        fetchedAt,
        source: null,
        attempted: result.attempted,
        cached: false,
        rdapServer: null,
        registrationDate: null,
        updatedDate: null,
        expiryDate: null,
        age: { days: null, years: null, daysUntilExpiry: null },
        registrar: null,
        nameservers: [],
        status: [],
        dnssec: null,
        registryDomainId: null,
        entities: [],
        raw: null,
        timings: null,
        error: result.error ?? "rdap_no_record",
      };
    }

    const r = result.data;
    return {
      success: true,
      input: input.domain.trim(),
      host: norm.host,
      domain: r.domain,
      normalizedDomain: r.normalizedDomain,
      tld: r.tld,
      fetchedAt,
      source: result.source,
      attempted: result.attempted,
      cached: result.source === "cache",
      rdapServer: r.rdapServer,
      registrationDate: r.registrationDate,
      updatedDate: r.updatedDate,
      expiryDate: r.expiryDate,
      age: {
        days: r.ageDays,
        years: r.ageYears,
        daysUntilExpiry: r.daysUntilExpiry,
      },
      registrar: r.registrar,
      nameservers: r.nameservers,
      status: r.status,
      dnssec: r.dnssec,
      registryDomainId: r.registryDomainId,
      entities: r.entities,
      raw: r.raw,
      timings: r.timings,
      error: null,
    };
  },
};

