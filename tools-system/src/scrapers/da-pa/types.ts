/**
 * Public input/output contracts for the DA/PA scraper.
 * The API route, tool UI, and docs page all import from here.
 *
 * Field names use Blogy-native vocabulary. We retain a small block of
 * legacy short codes (da/pa/dr/ur/ss/st) on the API response object as a
 * temporary compatibility surface — these are deprecated and will be
 * removed in a future version. UI consumers should rely only on the
 * Blogy-native fields (authorityScore / pageStrength / ...).
 */

export type DaPaInput = {
  url: string;
  /** When true, skip cache for this run. */
  fresh?: boolean;
  /** When true, include the raw signal breakdown in output. */
  debug?: boolean;
};

export type DomainSignals = {
  domain: string;
  tld: string;
  ageDays: number | null;
  ageYears: number | null;
  registrar: string | null;
  createdAt: string | null;
  https: boolean;
  dnsHealthy: boolean;
  hasMx: boolean;
  hasSpf: boolean;
  hasDmarc: boolean;
  /** Which provider supplied each lookup, useful for debugging. */
  provenance: { whois: string | null; dns: string | null };
};

export type IndexationSignals = {
  /** From sitemap URL count. Null when no sitemap could be parsed. */
  indexedPages: number | null;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  sitemapUrlCount: number | null;
  robotsAllowsAll: boolean;
  /** Approximate organic-search row count from a public SERP query. */
  searchResultsObserved: number | null;
};

export type ContentSignals = {
  reachable: boolean;
  statusCode: number | null;
  titleLength: number | null;
  metaDescriptionLength: number | null;
  h1Count: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  hasFavicon: boolean;
  hasViewport: boolean;
  language: string | null;
};

export type TrustSignals = {
  hasPrivacyPolicy: boolean;
  hasContactPage: boolean;
  hasAboutPage: boolean;
  hasSchemaOrg: boolean;
  hasOpenGraph: boolean;
  socialProfiles: string[];
  /** How many distinct schema.org types were found on the page. */
  schemaTypes: number;
  hasOrganizationSchema: boolean;
};

export type SpamSignals = {
  outboundLinkRatio: number;
  emptyAnchorRatio: number;
  redirectChainLength: number;
  suspiciousKeywordHits: number;
};

export type AuthoritySignals = {
  /** OpenPageRank value normalized to 0..1 — null when API key not configured. */
  pageRank01: number | null;
  /** Distinct referring captures observed in Common Crawl. */
  refDomainsObserved: number | null;
  /** Total link-record samples across consulted CC indexes. */
  linkSamplesObserved: number | null;
  /** Distinct external hosts the page links out to (weak proxy). */
  outboundHostDiversity: number | null;
  /** 0..1 — does brand name appear consistently in title + og:site_name. */
  brandConsistency: number;
  /** Which providers contributed to this reading. */
  providers: string[];
};

export type ScoreBreakdown = {
  domain: number;
  indexation: number;
  content: number;
  trust: number;
  authority: number;
  spam: number;
};

export type DaPaResult = {
  url: string;
  domain: string;
  fetchedAt: string;
  scores: {
    /** Whole-domain authority composite (0–100). */
    authorityScore: number;
    /** Single-page authority composite (0–100). */
    pageStrength: number;
    /** Backlink-weighted domain reading (0–100). */
    domainStrength: number;
    /** Backlink-weighted page reading (0–100). */
    urlStrength: number;
    /** Spam pattern score (0–100, higher = spammier). */
    spamScore: number;
    /** Trust + cleanliness + maturity composite (0–100). */
    stabilityScore: number;
    /** Composite trust signal (0–100). */
    trust: number;
    /** Share of sub-signals that contributed (0–100%). */
    confidence: number;

    /**
     * @deprecated Use the Blogy-native fields above. Legacy short codes are
     * retained for one-version backward compatibility and will be removed.
     */
    da: number;
    /** @deprecated use pageStrength */
    pa: number;
    /** @deprecated use domainStrength */
    dr: number;
    /** @deprecated use urlStrength */
    ur: number;
    /** @deprecated use spamScore */
    ss: number;
    /** @deprecated use stabilityScore */
    st: number;
  };
  metrics: {
    domainAgeYears: number | null;
    indexedPages: number | null;
    pageRank01: number | null;
    referringCaptures: number | null;
    https: boolean;
  };
  signals: {
    domain: DomainSignals;
    indexation: IndexationSignals;
    content: ContentSignals;
    trust: TrustSignals;
    authority: AuthoritySignals;
    spam: SpamSignals;
  };
  /** Only present when debug=true */
  breakdown?: ScoreBreakdown;
  /** Human-readable explanations of why scores are what they are */
  explanations: string[];
};
