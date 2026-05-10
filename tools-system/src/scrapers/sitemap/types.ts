export type SitemapInput = { url: string; fresh?: boolean };

export type SitemapStats = {
  totalUrls: number;
  withLastmod: number;
  withChangefreq: number;
  withPriority: number;
  uniqueHosts: number;
  avgPathDepth: number;
  freshnessDays: { min: number | null; max: number | null; median: number | null };
  changefreqBreakdown: Record<string, number>;
  topPaths: Array<{ path: string; count: number }>;
  /** Counts of URLs with image / video / news / hreflang annotations. */
  withImages: number;
  withVideos: number;
  withNews: number;
  withHreflang: number;
};

export type SitemapFetchedEntry = {
  source: string;
  type: "urlset" | "sitemapindex" | "unknown";
  ok: boolean;
  rawUrlCount: number;
  childSitemaps: string[];
  status?: number | null;
  bytes?: number;
  durationMs?: number;
  error?: string;
};

export type SitemapUrl = {
  loc: string;
  lastmod: string | null;
  priority: number | null;
  changefreq: string | null;
  source: string;
  imageCount?: number;
  videoCount?: number;
  hasNews?: boolean;
  hreflangCount?: number;
};

export type SitemapResult = {
  url: string;
  fetchedAt: string;
  /** Sub-sitemaps initially discovered (from robots.txt or common paths). */
  discovered: string[];
  /** Every sitemap URL the engine attempted to fetch + outcome. */
  fetched: SitemapFetchedEntry[];
  truncated: boolean;
  stats: SitemapStats;
  issues: Array<{ severity: "error" | "warning" | "info"; message: string }>;
  scores: { overall: number; coverage: number; freshness: number; structure: number };
  /** Small preview retained for legacy consumers. */
  sample: Array<{ loc: string; lastmod: string | null; priority: number | null }>;
  /** All extracted URLs. Capped at engine MAX_TOTAL_URLS. */
  urls: SitemapUrl[];
};
