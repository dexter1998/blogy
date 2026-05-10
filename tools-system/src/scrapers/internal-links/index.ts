/**
 * Internal Link scraper. BFS-crawls a site (capped) and builds the
 * inbound/outbound graph: hubs, orphans, deep pages, broken links,
 * noindexed pages. Scores distribution and health.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { crawlSite, type CrawledPage } from "@/scrapers/_shared/crawler";
import type { InternalLinkInput, InternalLinkResult, LinkNode } from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function bfsDepths(
  start: string,
  pages: Map<string, CrawledPage>,
): Map<string, number> {
  const depth = new Map<string, number>();
  depth.set(start, 0);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const u = queue.shift()!;
    const d = depth.get(u)!;
    const page = pages.get(u);
    if (!page) continue;
    for (const next of page.internalLinks) {
      if (!pages.has(next)) continue;
      if (!depth.has(next)) {
        depth.set(next, d + 1);
        queue.push(next);
      }
    }
  }
  return depth;
}

export const internalLinksScraper: Scraper<InternalLinkInput, InternalLinkResult> = {
  name: "internal-links",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return `${input.maxPages ?? 30}:${new URL(input.url).toString()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<InternalLinkResult> {
    const maxPages = Math.max(5, Math.min(50, input.maxPages ?? 30));
    const crawl = await crawlSite(input.url, { maxPages, concurrency: 4 });
    if (crawl.pages.length === 0) {
      throw new ScrapeError("scrape_failed", "Crawl returned no pages");
    }

    const pageMap = new Map(crawl.pages.map((p) => [p.url, p] as const));
    const depths = bfsDepths(crawl.startedFrom, pageMap);
    const inbound = new Map<string, number>();
    let edgeCount = 0;

    for (const p of crawl.pages) {
      for (const link of p.internalLinks) {
        if (!pageMap.has(link)) continue;
        edgeCount += 1;
        inbound.set(link, (inbound.get(link) ?? 0) + 1);
      }
    }

    const nodes: LinkNode[] = crawl.pages.map((p) => ({
      url: p.url,
      inboundCount: inbound.get(p.url) ?? 0,
      outboundCount: p.internalLinks.filter((l) => pageMap.has(l)).length,
      depth: depths.get(p.url) ?? -1,
      isOrphan: (inbound.get(p.url) ?? 0) === 0 && p.url !== crawl.startedFrom,
      noindex: p.metaRobotsNoindex,
      status: p.status,
      title: p.title,
    }));

    const hubs = [...nodes]
      .sort((a, b) => b.inboundCount - a.inboundCount)
      .slice(0, 10)
      .map((n) => ({ url: n.url, inboundCount: n.inboundCount }));
    const orphans = nodes.filter((n) => n.isOrphan).map((n) => n.url);
    const deepPages = nodes
      .filter((n) => n.depth >= 4)
      .sort((a, b) => b.depth - a.depth)
      .slice(0, 20)
      .map((n) => ({ url: n.url, depth: n.depth }));
    const noindexed = nodes.filter((n) => n.noindex).map((n) => n.url);
    const brokenLinks = nodes
      .filter((n) => !n.status || n.status >= 400)
      .map((n) => ({ url: n.url, status: n.status }));

    // ── Scoring ──
    const reachable = nodes.filter((n) => n.depth >= 0).length;
    const coverage = clamp((reachable / nodes.length) * 100);

    // Distribution score: penalise both orphans and over-concentration
    const orphanRatio = orphans.length / nodes.length;
    const inboundCounts = nodes.map((n) => n.inboundCount);
    const max = Math.max(1, ...inboundCounts);
    const top1Ratio = max / Math.max(1, edgeCount);
    let distribution = 100;
    distribution -= orphanRatio * 60;
    distribution -= Math.max(0, top1Ratio - 0.4) * 80;
    distribution = clamp(distribution);

    let health = 100;
    health -= Math.min(50, brokenLinks.length * 10);
    health -= Math.min(20, noindexed.length * 5);
    health -= deepPages.length > 5 ? 20 : 0;
    health = clamp(health);

    const overall = clamp(coverage * 0.35 + distribution * 0.4 + health * 0.25);

    // ── Recommendations ──
    const recs: InternalLinkResult["recommendations"] = [];
    if (orphans.length > 0)
      recs.push({ priority: "high", message: `${orphans.length} orphan page(s) — link to them from a hub` });
    if (top1Ratio > 0.5)
      recs.push({ priority: "medium", message: "Inbound links are over-concentrated on a single page" });
    if (deepPages.length > 5)
      recs.push({ priority: "medium", message: `${deepPages.length} pages at depth ≥4 — flatten the tree` });
    if (brokenLinks.length > 0)
      recs.push({ priority: "high", message: `${brokenLinks.length} broken page(s) discovered` });
    if (noindexed.length > 0)
      recs.push({ priority: "low", message: `${noindexed.length} noindexed page(s) — verify intentional` });
    if (crawl.truncated)
      recs.push({ priority: "low", message: "Crawl truncated — increase maxPages for full graph (max 50)" });

    return {
      origin: crawl.origin,
      startedFrom: crawl.startedFrom,
      fetchedAt: new Date().toISOString(),
      pagesCrawled: crawl.pages.length,
      truncated: crawl.truncated,
      graph: { nodes, edgeCount },
      hubs,
      orphans,
      deepPages,
      noindexed,
      brokenLinks,
      scores: { overall, coverage, distribution, health },
      recommendations: recs,
    };
  },
};
