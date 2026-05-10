import type { Provider } from "@/providers/types";
import { fetchText, timed } from "@/providers/_shared/cached-fetch";
import type { CrawlSnapshot } from "./types";

/**
 * Implements sitemaps.org / robots.txt parsing as a provider. We deliberately
 * read at most 2 sitemap candidates and don't recurse into sitemap indexes —
 * the goal is a stable size *signal*, not a full crawl.
 */
export const sitemapRobots: Provider<{ origin: string }, CrawlSnapshot> = {
  name: "sitemap+robots",
  async fetch({ origin }) {
    const { value, tookMs } = await timed(async () => {
      const robotsRes = await fetchText(`${origin}/robots.txt`, { timeoutMs: 5000 });
      const hasRobotsTxt = robotsRes.ok && robotsRes.body.trim().length > 0;
      const robotsBody = robotsRes.ok ? robotsRes.body : "";

      const robotsAllowsAll = hasRobotsTxt
        ? !/disallow:\s*\/\s*$/im.test(robotsBody) || /allow:\s*\//i.test(robotsBody)
        : true;

      const sitemapsFromRobots = Array.from(
        robotsBody.matchAll(/^sitemap:\s*(\S+)/gim),
      ).map((m) => m[1]!.trim());

      const candidates =
        sitemapsFromRobots.length > 0
          ? sitemapsFromRobots
          : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

      let hasSitemap = false;
      let sitemapUrlCount: number | null = null;
      for (const sm of candidates.slice(0, 2)) {
        const res = await fetchText(sm, { timeoutMs: 5000 });
        if (!res.ok) continue;
        if (!/<urlset|<sitemapindex/i.test(res.body)) continue;
        hasSitemap = true;
        const urlMatches = res.body.match(/<loc>/gi);
        sitemapUrlCount = urlMatches ? urlMatches.length : 0;
        break;
      }

      return {
        hasRobotsTxt,
        hasSitemap,
        robotsAllowsAll,
        sitemapUrlCount,
        sitemapsFromRobots,
      } satisfies CrawlSnapshot;
    });
    return { source: "sitemap+robots", data: value, tookMs };
  },
};
