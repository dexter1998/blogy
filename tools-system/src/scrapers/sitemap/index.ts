import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { discoverSitemaps, fetchSitemap, fetchSitemapTree } from "@/scrapers/_shared/sitemap";
import { scoreSitemap } from "@/scoring/sitemap";
import type { SitemapInput, SitemapResult } from "./types";

function urlPath(loc: string): string {
  try {
    return new URL(loc).pathname;
  } catch {
    return "/";
  }
}

function pathDepth(p: string): number {
  return p.split("/").filter(Boolean).length;
}

function topLevelSegment(p: string): string {
  const seg = p.split("/").filter(Boolean)[0] ?? "/";
  return `/${seg}`;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : Math.round((s[mid - 1]! + s[mid]!) / 2);
}

export const sitemapScraper: Scraper<SitemapInput, SitemapResult> = {
  name: "sitemap",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<SitemapResult> {
    const isXml = /\.(xml|gz)$|sitemap/i.test(input.url);
    const u = new URL(input.url);
    const origin = `${u.protocol}//${u.host}`;

    let discovered: string[];
    if (isXml) {
      discovered = [input.url];
    } else {
      discovered = await discoverSitemaps(origin);
    }

    // Fetch each discovered sitemap as a tree (handles index → children)
    const trees = await Promise.all(discovered.map((d) => fetchSitemapTree(d)));

    const fetched = trees.flatMap((t) =>
      t.fetched.map((f) => ({
        source: f.source,
        type: f.type,
        ok: f.ok,
        rawUrlCount: f.rawUrlCount,
        childSitemaps: f.childSitemaps,
        error: f.error,
      })),
    );
    const truncated = trees.some((t) => t.truncated);
    const allEntries = trees.flatMap((t) => t.allEntries);

    // ── Stats ─────────────────────────────────────────
    const hosts = new Set<string>();
    const segCounts = new Map<string, number>();
    const depths: number[] = [];
    let withLastmod = 0;
    let withChangefreq = 0;
    let withPriority = 0;
    const cfMap: Record<string, number> = {};
    const ages: number[] = [];

    for (const e of allEntries) {
      try {
        hosts.add(new URL(e.loc).hostname);
      } catch {
        /* skip bad loc */
      }
      const path = urlPath(e.loc);
      depths.push(pathDepth(path));
      const seg = topLevelSegment(path);
      segCounts.set(seg, (segCounts.get(seg) ?? 0) + 1);
      if (e.lastmod) {
        withLastmod += 1;
        const d = new Date(e.lastmod);
        if (!Number.isNaN(d.getTime())) {
          ages.push(Math.floor((Date.now() - d.getTime()) / 86_400_000));
        }
      }
      if (e.changefreq) {
        withChangefreq += 1;
        cfMap[e.changefreq] = (cfMap[e.changefreq] ?? 0) + 1;
      }
      if (e.priority !== null) withPriority += 1;
    }

    const topPaths = Array.from(segCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    const result: SitemapResult = {
      url: input.url,
      fetchedAt: new Date().toISOString(),
      discovered,
      fetched,
      truncated,
      stats: {
        totalUrls: allEntries.length,
        withLastmod,
        withChangefreq,
        withPriority,
        uniqueHosts: hosts.size,
        avgPathDepth: depths.length
          ? Math.round((depths.reduce((a, b) => a + b, 0) / depths.length) * 10) / 10
          : 0,
        freshnessDays: {
          min: ages.length ? Math.min(...ages) : null,
          max: ages.length ? Math.max(...ages) : null,
          median: median(ages),
        },
        changefreqBreakdown: cfMap,
        topPaths,
      },
      issues: [],
      scores: { overall: 0, coverage: 0, freshness: 0, structure: 0 },
      sample: allEntries.slice(0, 25).map((e) => ({
        loc: e.loc,
        lastmod: e.lastmod,
        priority: e.priority,
      })),
    };

    const scored = scoreSitemap(result);
    result.scores = scored.scores;
    result.issues = scored.issues;
    return result;
  },
};

export { fetchSitemap };
