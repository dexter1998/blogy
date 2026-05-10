/**
 * Public input/output contracts for the DA/PA scraper.
 * The API route, tool UI, and docs page all import from here.
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
};

export type IndexationSignals = {
  /** Estimate from `site:` query — null when scrape fails. */
  indexedPages: number | null;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  sitemapUrlCount: number | null;
  robotsAllowsAll: boolean;
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
};

export type SpamSignals = {
  outboundLinkRatio: number;
  emptyAnchorRatio: number;
  redirectChainLength: number;
  suspiciousKeywordHits: number;
};

export type AuthoritySignals = {
  /** Coarse referring-domain estimate from outbound link diversity + presence. */
  referringDomainsEstimate: number | null;
  /** Coarse backlink estimate; intentionally a band, not a precise number. */
  backlinkEstimate: number | null;
  /** Branded presence proxy: does brand name appear in title, meta, OG. */
  brandConsistency: number;
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
    da: number;
    pa: number;
    spam: number;
    trust: number;
    confidence: number;
  };
  metrics: {
    domainAgeYears: number | null;
    indexedPages: number | null;
    referringDomainsEstimate: number | null;
    backlinkEstimate: number | null;
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
