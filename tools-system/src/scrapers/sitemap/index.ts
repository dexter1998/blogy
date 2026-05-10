import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import {
  classifySitemapInput,
  discoverSitemaps,
  fetchSitemap,
  fetchSitemapTree,
  type SitemapEntry,
  type SitemapTree,
} from "@/scrapers/_shared/sitemap";
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
    const { direct, origin } = classifySitemapInput(input.url);

    let discovered: string[];
    if (direct) {
      discovered = [input.url];
    } else {
      discovered = await discoverSitemaps(origin);
    }

    // Run trees in parallel — the tree itself uses bounded concurrency.
    const trees: SitemapTree[] = await Promise.all(discovered.map((d) => fetchSitemapTree(d)));

    const fetched = trees.flatMap((t) =>
      t.fetched.map((f) => ({
        source: f.source,
        type: f.type,
        ok: f.ok,
        rawUrlCount: f.rawUrlCount,
        childSitemaps: f.childSitemaps.map((c) => c.loc),
        status: f.status ?? null,
        bytes: f.bytes,
        durationMs: f.durationMs,
        error: f.error,
      })),
    );
    const truncated = trees.some((t) => t.truncated);

    // Dedup entries by loc (some sitemaps double-list URLs).
    const seenLoc = new Set<string>();
    const allEntries: SitemapEntry[] = [];
    for (const t of trees) {
      for (const e of t.allEntries) {
        if (seenLoc.has(e.loc)) continue;
        seenLoc.add(e.loc);
        allEntries.push(e);
      }
    }

    // ── Stats ─────────────────────────────────────────
    const hosts = new Set<string>();
    const segCounts = new Map<string, number>();
    const depths: number[] = [];
    let withLastmod = 0;
    let withChangefreq = 0;
    let withPriority = 0;
    let withImages = 0;
    let withVideos = 0;
    let withNews = 0;
    let withHreflang = 0;
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
      if (e.images?.length) withImages += 1;
      if (e.videos?.length) withVideos += 1;
      if (e.news) withNews += 1;
      if (e.alternates?.length) withHreflang += 1;
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
        withImages,
        withVideos,
        withNews,
        withHreflang,
      },
      issues: [],
      scores: { overall: 0, coverage: 0, freshness: 0, structure: 0 },
      sample: allEntries.slice(0, 25).map((e) => ({
        loc: e.loc,
        lastmod: e.lastmod,
        priority: e.priority,
      })),
      urls: allEntries.map((e) => ({
        loc: e.loc,
        lastmod: e.lastmod,
        priority: e.priority,
        changefreq: e.changefreq,
        source: e.source,
        imageCount: e.images?.length,
        videoCount: e.videos?.length,
        hasNews: e.news ? true : undefined,
        hreflangCount: e.alternates?.length,
      })),
    };

    const scored = scoreSitemap(result);
    result.scores = scored.scores;
    result.issues = scored.issues;
    return result;
  },
};

export { fetchSitemap };
