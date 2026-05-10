import { crawlSnapshot, searchPresence } from "@/providers";
import type { IndexationSignals } from "@/scrapers/da-pa/types";

/**
 * Indexation snapshot built from two providers:
 *   - crawl: robots.txt + sitemap.xml — gives the publishable URL count
 *   - search: a public SERP probe — corroborates that the site is actually
 *     indexed somewhere (DuckDuckGo Lite, no anti-bot gate)
 *
 * Both providers run in parallel; we don't fail if either one is empty.
 */
export async function collectIndexationSignals(origin: string): Promise<IndexationSignals> {
  const host = new URL(origin).hostname.replace(/^www\./, "");
  const [crawlR, searchR] = await Promise.all([crawlSnapshot(origin), searchPresence(host)]);

  const c = crawlR.data;
  const s = searchR.data;

  return {
    indexedPages: c?.sitemapUrlCount ?? null,
    hasSitemap: !!c?.hasSitemap,
    hasRobotsTxt: !!c?.hasRobotsTxt,
    sitemapUrlCount: c?.sitemapUrlCount ?? null,
    robotsAllowsAll: c?.robotsAllowsAll ?? true,
    searchResultsObserved: s?.approximateRowsObserved ?? null,
  };
}
