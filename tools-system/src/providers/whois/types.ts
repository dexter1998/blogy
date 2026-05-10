/**
 * Legacy compact record consumed by the DA-PA scorer. Kept stable.
 */
export type WhoisRecord = {
  domain: string;
  createdAt: string | null; // ISO
  registrar: string | null;
  ageDays: number | null;
  ageYears: number | null;
};

/**
 * Full RDAP-derived registration record. Powers /api/v1/whois and the
 * WHOIS Lookup tool. All optional fields default to null when the registry
 * doesn't publish them (some ccTLDs strip everything but createdAt).
 */
export type RdapRecord = {
  /** Punycode (ASCII) registrable root. */
  domain: string;
  /** Original input, normalized but not punycoded — useful for display. */
  normalizedDomain: string;
  /** TLD / effective TLD (co.uk, com, io, …). */
  tld: string;

  /** RDAP server that ultimately answered (after any redirects). */
  rdapServer: string | null;
  /** Direct registry endpoint we attempted before falling back. */
  bootstrappedFrom: string | null;

  /** Registry's own domain ID. */
  registryDomainId: string | null;

  /** Event dates. ISO 8601. */
  registrationDate: string | null;
  updatedDate: string | null;
  expiryDate: string | null;
  lastChangedDate: string | null;

  /** Computed from registrationDate. */
  ageDays: number | null;
  ageYears: number | null;
  daysUntilExpiry: number | null;

  registrar: {
    name: string | null;
    ianaId: string | null;
    url: string | null;
    abuseEmail: string | null;
    abusePhone: string | null;
  };

  /** Uppercase nameserver hostnames. */
  nameservers: string[];
  /** RDAP statuses (e.g. "client transfer prohibited"). */
  status: string[];
  /** True when registry asserts DNSSEC delegation signing. */
  dnssec: boolean | null;

  entities: Array<{
    handle: string | null;
    roles: string[];
    name: string | null;
    email: string | null;
  }>;

  /** Raw RDAP JSON (kept so the API/UI can show the verbatim payload). */
  raw: unknown;

  /** Per-step timings in ms. */
  timings: {
    bootstrap: number | null;
    fetch: number;
    total: number;
  };
};
