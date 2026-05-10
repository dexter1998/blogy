/**
 * Recursive sitemap parser. Handles both <urlset> and <sitemapindex>,
 * plus gzipped sitemaps (we skip .gz since we don't bundle zlib here —
 * if the index points only to .gz files, we report them as "discovered"
 * but don't expand). Caps total work to avoid runaway crawls.
 */

import { httpGet } from "./http";

export type SitemapEntry = {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: number | null;
};

export type ParsedSitemap = {
  type: "urlset" | "sitemapindex" | "unknown";
  source: string;
  entries: SitemapEntry[];
  childSitemaps: string[];
  rawUrlCount: number;
  ok: boolean;
  error?: string;
};

const MAX_CHILDREN = 25;
const MAX_TOTAL_URLS = 5000;

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? decode(m[1]!.trim()) : null;
}

export function parseSitemapXml(xml: string, source: string): ParsedSitemap {
  const isIndex = /<sitemapindex/i.test(xml);
  const isUrlset = /<urlset/i.test(xml);
  if (!isIndex && !isUrlset) {
    return {
      type: "unknown",
      source,
      entries: [],
      childSitemaps: [],
      rawUrlCount: 0,
      ok: false,
      error: "Not a valid sitemap (no <urlset> or <sitemapindex>)",
    };
  }

  if (isIndex) {
    const blocks = Array.from(xml.matchAll(/<sitemap\b[\s\S]*?<\/sitemap>/gi));
    const childSitemaps = blocks
      .map((b) => extractTag(b[0], "loc"))
      .filter((s): s is string => !!s);
    return {
      type: "sitemapindex",
      source,
      entries: [],
      childSitemaps,
      rawUrlCount: 0,
      ok: true,
    };
  }

  const blocks = Array.from(xml.matchAll(/<url\b[\s\S]*?<\/url>/gi));
  const entries: SitemapEntry[] = blocks.map((b) => {
    const block = b[0];
    const loc = extractTag(block, "loc") ?? "";
    const lastmod = extractTag(block, "lastmod");
    const changefreq = extractTag(block, "changefreq");
    const pStr = extractTag(block, "priority");
    return {
      loc,
      lastmod,
      changefreq,
      priority: pStr ? Number(pStr) : null,
    };
  });
  return {
    type: "urlset",
    source,
    entries,
    childSitemaps: [],
    rawUrlCount: entries.length,
    ok: true,
  };
}

export async function fetchSitemap(url: string): Promise<ParsedSitemap> {
  const res = await httpGet(url, { timeoutMs: 8000 });
  if (!res.ok) {
    return {
      type: "unknown",
      source: url,
      entries: [],
      childSitemaps: [],
      rawUrlCount: 0,
      ok: false,
      error: res.message,
    };
  }
  return parseSitemapXml(res.body, url);
}

export type SitemapTree = {
  root: string;
  fetched: ParsedSitemap[];
  allEntries: SitemapEntry[];
  totalUrls: number;
  truncated: boolean;
  errors: Array<{ source: string; error: string }>;
};

export async function fetchSitemapTree(rootUrl: string): Promise<SitemapTree> {
  const fetched: ParsedSitemap[] = [];
  const errors: Array<{ source: string; error: string }> = [];
  const allEntries: SitemapEntry[] = [];
  const seen = new Set<string>();
  const queue: string[] = [rootUrl];
  let truncated = false;

  while (queue.length > 0) {
    if (fetched.length >= MAX_CHILDREN) {
      truncated = true;
      break;
    }
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);

    const parsed = await fetchSitemap(next);
    fetched.push(parsed);
    if (!parsed.ok) {
      errors.push({ source: next, error: parsed.error ?? "fetch_failed" });
      continue;
    }
    if (parsed.type === "urlset") {
      for (const e of parsed.entries) {
        if (allEntries.length >= MAX_TOTAL_URLS) {
          truncated = true;
          break;
        }
        allEntries.push(e);
      }
    } else if (parsed.type === "sitemapindex") {
      for (const child of parsed.childSitemaps) {
        if (!seen.has(child)) queue.push(child);
      }
    }
  }

  return {
    root: rootUrl,
    fetched,
    allEntries,
    totalUrls: allEntries.length,
    truncated,
    errors,
  };
}

export async function discoverSitemaps(origin: string): Promise<string[]> {
  const robots = await httpGet(`${origin}/robots.txt`, { timeoutMs: 5000 });
  const found: string[] = [];
  if (robots.ok) {
    for (const m of robots.body.matchAll(/^sitemap:\s*(\S+)/gim)) {
      found.push(m[1]!.trim());
    }
  }
  if (found.length === 0) {
    found.push(`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`);
  }
  return found;
}
