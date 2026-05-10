export type BacklinkInput = {
  url: string;
  /** Whether to include verification by re-fetching candidates. Slower. */
  verify?: boolean;
  /** Max referring URLs to verify (cap to keep response time bounded). */
  maxVerify?: number;
  fresh?: boolean;
};

export type Backlink = {
  source: string;
  /** "common-crawl" = found in CC index, "verified" = also confirmed live. */
  origin: "common-crawl" | "verified";
  domain: string;
  firstSeenIndex: string | null;
  /** Set when verify=true and we successfully fetched the source. */
  verifiedAt: string | null;
  /** Whether the live page still contains a link to the target. */
  linksToTarget: boolean | null;
  status: number | null;
  /** Anchor text — only set when verified. */
  anchorText: string | null;
  /** rel attribute — only set when verified. */
  rel: string | null;
};

export type BacklinkResult = {
  url: string;
  target: string;
  fetchedAt: string;
  source: "common-crawl";
  indexesQueried: string[];
  totalCandidates: number;
  uniqueReferringDomains: number;
  totalBacklinks: number;
  verifiedCount: number;
  topDomains: Array<{ domain: string; count: number }>;
  backlinks: Backlink[];
  truncated: boolean;
};
