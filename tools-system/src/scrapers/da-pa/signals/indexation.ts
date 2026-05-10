import { httpGet } from "@/scrapers/_shared/http";
import type { IndexationSignals } from "@/scrapers/da-pa/types";

/**
 * Robots + sitemap inspection. Indexation count is a coarse public estimate
 * (sitemap URL count when available). We deliberately avoid scraping Google's
 * `site:` results because Google blocks automated queries — the resulting
 * number would be unreliable and could get the deployed function blocked.
 */
export async function collectIndexationSignals(
  origin: string,
): Promise<IndexationSignals> {
  const robotsRes = await httpGet(`${origin}/robots.txt`, { timeoutMs: 5000 });
  const hasRobotsTxt = robotsRes.ok && robotsRes.body.trim().length > 0;
  const robotsBody = robotsRes.ok ? robotsRes.body : "";

  const robotsAllowsAll = hasRobotsTxt
    ? !/disallow:\s*\/\s*$/im.test(robotsBody) || /allow:\s*\//i.test(robotsBody)
    : true;

  const sitemapsFromRobots = Array.from(
    robotsBody.matchAll(/^sitemap:\s*(\S+)/gim),
  ).map((m) => m[1]!.trim());
  const candidateSitemaps =
    sitemapsFromRobots.length > 0
      ? sitemapsFromRobots
      : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  let hasSitemap = false;
  let sitemapUrlCount: number | null = null;

  for (const sm of candidateSitemaps.slice(0, 2)) {
    const res = await httpGet(sm, { timeoutMs: 5000 });
    if (!res.ok) continue;
    if (!/<urlset|<sitemapindex/i.test(res.body)) continue;
    hasSitemap = true;
    const urlMatches = res.body.match(/<loc>/gi);
    sitemapUrlCount = urlMatches ? urlMatches.length : 0;
    break;
  }

  return {
    indexedPages: sitemapUrlCount,
    hasSitemap,
    hasRobotsTxt,
    sitemapUrlCount,
    robotsAllowsAll,
  };
}
