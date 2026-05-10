import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import {
  classifySitemapInput,
  discoverSitemaps,
  fetchSitemap,
} from "@/scrapers/_shared/sitemap";

export type DiscoverInput = { url: string; fresh?: boolean };

export type DiscoverSubSitemap = {
  loc: string;
  lastmod: string | null;
  /** True if this came from a sitemapindex; false if a single urlset was given. */
  fromIndex: boolean;
};

export type DiscoverResult = {
  url: string;
  fetchedAt: string;
  /** True when the input was a direct sitemap URL (we skip robots.txt). */
  directSitemap: boolean;
  /** Sitemaps declared in robots.txt (empty if direct input or robots had none). */
  fromRobotsTxt: string[];
  /** Sitemaps probed via /sitemap.xml fallback when robots had none. */
  fromCommonPaths: string[];
  /** Roots used for index expansion (de-duplicated union of the above). */
  roots: string[];
  /** Sub-sitemaps to be extracted (children of any sitemapindex roots, or the roots themselves if they are urlsets). */
  subSitemaps: DiscoverSubSitemap[];
  /** Roots that returned an error during discovery. */
  errors: Array<{ source: string; error: string; status: number | null }>;
};

export const sitemapDiscoverScraper: Scraper<DiscoverInput, DiscoverResult> = {
  name: "sitemap-discover",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return `discover:${new URL(input.url).toString()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<DiscoverResult> {
    const { direct, origin } = classifySitemapInput(input.url);

    let fromRobotsTxt: string[] = [];
    let fromCommonPaths: string[] = [];
    let roots: string[] = [];

    if (direct) {
      roots = [input.url];
    } else {
      const { robots, common } = await discoverSitemapsSplit(origin);
      fromRobotsTxt = robots;
      fromCommonPaths = common;
      const seen = new Set<string>();
      for (const u of [...robots, ...common]) {
        if (!seen.has(u)) {
          seen.add(u);
          roots.push(u);
        }
      }
      if (roots.length === 0) {
        roots = [`${origin}/sitemap.xml`];
      }
    }

    const subSitemaps: DiscoverSubSitemap[] = [];
    const errors: DiscoverResult["errors"] = [];
    const seenSub = new Set<string>();

    const parsedRoots = await Promise.all(roots.map((r) => fetchSitemap(r)));

    for (const parsed of parsedRoots) {
      if (!parsed.ok) {
        errors.push({
          source: parsed.source,
          error: parsed.error ?? "fetch_failed",
          status: parsed.status ?? null,
        });
        continue;
      }
      if (parsed.type === "sitemapindex") {
        for (const child of parsed.childSitemaps) {
          if (seenSub.has(child.loc)) continue;
          seenSub.add(child.loc);
          subSitemaps.push({
            loc: child.loc,
            lastmod: child.lastmod,
            fromIndex: true,
          });
        }
      } else if (parsed.type === "urlset") {
        if (!seenSub.has(parsed.source)) {
          seenSub.add(parsed.source);
          subSitemaps.push({
            loc: parsed.source,
            lastmod: null,
            fromIndex: false,
          });
        }
      }
    }

    return {
      url: input.url,
      fetchedAt: new Date().toISOString(),
      directSitemap: direct,
      fromRobotsTxt,
      fromCommonPaths,
      roots,
      subSitemaps,
      errors,
    };
  },
};

async function discoverSitemapsSplit(
  origin: string,
): Promise<{ robots: string[]; common: string[] }> {
  const all = await discoverSitemaps(origin);
  // discoverSitemaps returns robots-first, then common-path probes.
  // We need the split; cheapest way is to refetch robots.txt and partition.
  const robotsRes = await fetch(`${origin}/robots.txt`, {
    headers: { "User-Agent": env.scrapeUserAgent },
    signal: AbortSignal.timeout(6000),
  }).catch(() => null);

  const declared = new Set<string>();
  if (robotsRes && robotsRes.ok) {
    const body = await robotsRes.text();
    for (const m of body.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)) {
      declared.add(sanitizeForCompare(m[1]!, origin));
    }
  }

  const robots: string[] = [];
  const common: string[] = [];
  for (const u of all) {
    if (declared.has(sanitizeForCompare(u, origin))) robots.push(u);
    else common.push(u);
  }
  return { robots, common };
}

function sanitizeForCompare(raw: string, baseOrigin: string): string {
  let s = raw.trim();
  s = s.replace(/^(https?:\/\/)+(?=https?:\/\/)/i, "");
  if (s.startsWith("//")) s = `https:${s}`;
  if (s.startsWith("/")) s = `${baseOrigin}${s}`;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    return new URL(s).toString();
  } catch {
    return s;
  }
}
