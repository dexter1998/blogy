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
};

export type SitemapResult = {
  url: string;
  fetchedAt: string;
  discovered: string[];
  fetched: Array<{
    source: string;
    type: "urlset" | "sitemapindex" | "unknown";
    ok: boolean;
    rawUrlCount: number;
    childSitemaps: string[];
    error?: string;
  }>;
  truncated: boolean;
  stats: SitemapStats;
  issues: Array<{ severity: "error" | "warning" | "info"; message: string }>;
  scores: { overall: number; coverage: number; freshness: number; structure: number };
  sample: Array<{ loc: string; lastmod: string | null; priority: number | null }>;
};
