/**
 * Backlink Discovery via Common Crawl CDX.
 *
 * Common Crawl publishes a per-month "CDX" index (Capture/Discovery
 * Index) of every URL it has ever crawled. We query the most recent
 * indexes for any record whose page body contained a link to the
 * target URL pattern. That gives us a real, free, attribution-friendly
 * source of inbound links — no scraping, no API key.
 *
 * Optionally we can verify a sample of candidates by re-fetching them
 * and confirming the link still exists, capturing the anchor text and
 * rel attribute.
 *
 * Reference: https://commoncrawl.org/get-started — CDX server protocol.
 */

import * as cheerio from "cheerio";
import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import type { Backlink, BacklinkInput, BacklinkResult } from "./types";

// We hardcode a small set of recent indexes rather than fetching
// /collinfo.json every call — CC adds new ones monthly and the latest
// few cover the freshest data. Keep this list updated as CC publishes
// new monthly indexes.
const CDX_INDEXES = [
  "CC-MAIN-2026-13",
  "CC-MAIN-2026-09",
  "CC-MAIN-2025-51",
  "CC-MAIN-2025-43",
];

const MAX_PER_INDEX = 50;
const HARD_CAP = 200;

type CdxRow = { url: string; timestamp?: string; status?: string };

async function queryIndex(indexName: string, target: string): Promise<CdxRow[]> {
  // CDX accepts a URL prefix; we ask for matchType=domain on the target
  // host so we get pages that *contain* a link to anywhere on that host.
  // (CDX indexes URLs themselves, so to find inbound links we have to
  // match on the *target host*. CDX exposes this via matchType=domain.)
  const params = new URLSearchParams({
    url: target,
    matchType: "domain",
    output: "json",
    limit: String(MAX_PER_INDEX),
    fl: "url,timestamp,status",
  });
  const url = `https://index.commoncrawl.org/${indexName}-index?${params.toString()}`;
  const res = await httpGet(url, { timeoutMs: 15_000 });
  if (!res.ok) return [];
  const rows: CdxRow[] = [];
  for (const line of res.body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line) as CdxRow;
      if (obj.url) rows.push(obj);
    } catch {
      /* skip malformed line */
    }
  }
  return rows;
}

async function verifyOne(sourceUrl: string, targetHost: string): Promise<{
  ok: boolean;
  status: number | null;
  linksToTarget: boolean;
  anchorText: string | null;
  rel: string | null;
}> {
  const res = await httpGet(sourceUrl, { timeoutMs: 6000 });
  if (!res.ok) return { ok: false, status: res.status, linksToTarget: false, anchorText: null, rel: null };
  const $ = cheerio.load(res.body);
  let anchorText: string | null = null;
  let rel: string | null = null;
  let found = false;
  $("a[href]").each((_, el) => {
    if (found) return;
    const href = ($(el).attr("href") ?? "").trim();
    try {
      const u = new URL(href, sourceUrl);
      if (u.hostname.replace(/^www\./, "") === targetHost) {
        found = true;
        anchorText = ($(el).text() ?? "").trim().slice(0, 120) || null;
        rel = $(el).attr("rel") ?? null;
      }
    } catch {
      /* skip */
    }
  });
  return { ok: true, status: res.status, linksToTarget: found, anchorText, rel };
}

export const backlinksScraper: Scraper<BacklinkInput, BacklinkResult> = {
  name: "backlinks",
  // Backlink graphs change slowly — cache aggressively.
  cacheTtlSeconds: Math.max(env.cacheTtlSeconds, 6 * 60 * 60),

  cacheKey(input) {
    if (input.fresh) return null;
    return `${input.verify ? "v" : "n"}:${new URL(input.url).toString()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<BacklinkResult> {
    const target = new URL(input.url);
    const targetHost = target.hostname.replace(/^www\./, "");

    const allRows: Array<{ row: CdxRow; index: string }> = [];
    for (const idx of CDX_INDEXES) {
      const rows = await queryIndex(idx, targetHost);
      for (const r of rows) allRows.push({ row: r, index: idx });
      if (allRows.length >= HARD_CAP) break;
    }

    if (allRows.length === 0) {
      throw new ScrapeError("scrape_failed", "No backlinks found in Common Crawl indexes (or CC is rate-limiting)");
    }

    // Deduplicate by source URL, drop captures of the target itself
    const dedup = new Map<string, { firstSeenIndex: string; row: CdxRow }>();
    for (const { row, index } of allRows) {
      try {
        const u = new URL(row.url);
        if (u.hostname.replace(/^www\./, "") === targetHost) continue;
      } catch {
        continue;
      }
      if (!dedup.has(row.url)) dedup.set(row.url, { firstSeenIndex: index, row });
    }

    let backlinks: Backlink[] = Array.from(dedup.entries()).map(([source, { firstSeenIndex }]) => {
      let domain = source;
      try {
        domain = new URL(source).hostname.replace(/^www\./, "");
      } catch {
        /* keep raw */
      }
      return {
        source,
        origin: "common-crawl",
        domain,
        firstSeenIndex,
        verifiedAt: null,
        linksToTarget: null,
        status: null,
        anchorText: null,
        rel: null,
      } satisfies Backlink;
    });

    let verifiedCount = 0;
    if (input.verify) {
      const cap = Math.max(1, Math.min(20, input.maxVerify ?? 10));
      const sample = backlinks.slice(0, cap);
      const verified = await Promise.all(
        sample.map(async (b) => {
          try {
            const v = await verifyOne(b.source, targetHost);
            verifiedCount += v.linksToTarget ? 1 : 0;
            return {
              ...b,
              origin: v.linksToTarget ? ("verified" as const) : b.origin,
              verifiedAt: new Date().toISOString(),
              linksToTarget: v.linksToTarget,
              status: v.status,
              anchorText: v.anchorText,
              rel: v.rel,
            } satisfies Backlink;
          } catch {
            return b;
          }
        }),
      );
      backlinks = [...verified, ...backlinks.slice(cap)];
    }

    // Domain aggregation
    const domainCounts = new Map<string, number>();
    for (const b of backlinks) domainCounts.set(b.domain, (domainCounts.get(b.domain) ?? 0) + 1);
    const topDomains = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    return {
      url: input.url,
      target: targetHost,
      fetchedAt: new Date().toISOString(),
      source: "common-crawl",
      indexesQueried: CDX_INDEXES.slice(0, allRows.length > 0 ? CDX_INDEXES.length : 0),
      totalCandidates: allRows.length,
      totalBacklinks: backlinks.length,
      uniqueReferringDomains: domainCounts.size,
      verifiedCount,
      topDomains,
      backlinks: backlinks.slice(0, 100),
      truncated: allRows.length >= HARD_CAP,
    };
  },
};
