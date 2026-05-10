export type CrawlSnapshot = {
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  robotsAllowsAll: boolean;
  sitemapUrlCount: number | null;
  sitemapsFromRobots: string[];
};
