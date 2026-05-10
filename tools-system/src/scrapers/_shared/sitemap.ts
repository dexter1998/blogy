/**
 * Production-grade sitemap discovery + extraction engine.
 *
 * Capabilities:
 * - robots.txt sitemap discovery + common-path fallback
 * - sitemap index recursion (BFS, dedup, circular-ref safe)
 * - gzipped sitemaps (.xml.gz) via gunzip
 * - fast-xml-parser based parsing with namespace support
 *   (image:image, video:video, news:news, xhtml:link for hreflang)
 * - concurrent fetching with bounded pool
 * - graceful malformed-XML recovery
 * - per-source error reporting
 *
 * Used by:
 * - sitemap scraper (full extraction)
 * - sitemap-robots provider (lightweight crawl signal)
 */

import axios from "axios";
import { gunzipSync, inflateSync, brotliDecompressSync } from "node:zlib";
import { XMLParser } from "fast-xml-parser";
import { env } from "@/lib/env";

// ── Types ──────────────────────────────────────────────────────────────────

export type HreflangAlt = { hreflang: string; href: string };

export type SitemapEntry = {
  loc: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: number | null;
  /** Sitemap source URL this entry came from. */
  source: string;
  images?: string[];
  videos?: string[];
  news?: { title: string; publicationDate: string | null } | null;
  alternates?: HreflangAlt[];
};

export type ParsedSitemap = {
  type: "urlset" | "sitemapindex" | "unknown";
  source: string;
  /** Last-modified (from index entries) for the sitemap itself. */
  lastmod?: string | null;
  entries: SitemapEntry[];
  childSitemaps: Array<{ loc: string; lastmod: string | null }>;
  rawUrlCount: number;
  ok: boolean;
  status?: number | null;
  bytes?: number;
  contentType?: string | null;
  error?: string;
  durationMs?: number;
};

export type SitemapTree = {
  root: string;
  fetched: ParsedSitemap[];
  allEntries: SitemapEntry[];
  totalUrls: number;
  truncated: boolean;
  errors: Array<{ source: string; error: string }>;
};

// ── Limits ─────────────────────────────────────────────────────────────────

const MAX_SITEMAPS = 500; // sub-sitemaps fetched per tree
const MAX_TOTAL_URLS = 200_000;
const FETCH_CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 15_000;

// ── Fetcher (binary, gzip-aware) ───────────────────────────────────────────

type RawFetchResult =
  | {
      ok: true;
      status: number;
      body: string;
      bytes: number;
      contentType: string | null;
      finalUrl: string;
    }
  | {
      ok: false;
      status: number | null;
      error: string;
    };

async function fetchRaw(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<RawFetchResult> {
  try {
    const res = await axios.get<ArrayBuffer>(url, {
      timeout: timeoutMs,
      responseType: "arraybuffer",
      maxRedirects: 5,
      validateStatus: () => true,
      decompress: true, // axios will decode gzip/deflate/br when Content-Encoding is set
      headers: {
        "User-Agent": env.scrapeUserAgent,
        Accept: "application/xml,text/xml,application/rss+xml,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (res.status < 200 || res.status >= 400) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }

    let buf = Buffer.from(res.data as ArrayBuffer);
    const contentType = (res.headers["content-type"] as string | undefined) ?? null;
    const finalUrl = (res.request?.res?.responseUrl as string | undefined) ?? url;

    // If axios didn't auto-decompress (some servers omit Content-Encoding for .gz),
    // detect magic bytes and decompress manually.
    if (buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
      try {
        buf = gunzipSync(buf);
      } catch {
        /* fall through, parser will fail and we report it */
      }
    } else if (
      url.toLowerCase().endsWith(".gz") &&
      buf.length >= 2 &&
      buf[0] === 0x78 // zlib magic
    ) {
      try {
        buf = inflateSync(buf);
      } catch {
        /* ignore */
      }
    } else if (contentType?.includes("br")) {
      try {
        buf = brotliDecompressSync(buf);
      } catch {
        /* ignore */
      }
    }

    const body = buf.toString("utf-8");
    return {
      ok: true,
      status: res.status,
      body,
      bytes: buf.length,
      contentType,
      finalUrl,
    };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "ECONNABORTED") {
      return { ok: false, status: null, error: "timeout" };
    }
    return { ok: false, status: null, error: err.message ?? "network_error" };
  }
}

// ── XML parsing ────────────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
  isArray: (name) => {
    // Always treat these as arrays even if there's only one.
    return [
      "url",
      "sitemap",
      "image:image",
      "video:video",
      "xhtml:link",
    ].includes(name);
  },
});

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>)) {
    const t = (v as { "#text": unknown })["#text"];
    return typeof t === "string" ? t.trim() || null : null;
  }
  return null;
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function parsePriority(s: string | null): number | null {
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseSitemapXml(xml: string, source: string): ParsedSitemap {
  // Strip BOM
  if (xml.charCodeAt(0) === 0xfeff) xml = xml.slice(1);

  let doc: Record<string, unknown>;
  try {
    doc = xmlParser.parse(xml) as Record<string, unknown>;
  } catch (e) {
    return {
      type: "unknown",
      source,
      entries: [],
      childSitemaps: [],
      rawUrlCount: 0,
      ok: false,
      error: `xml_parse_failed: ${(e as Error).message}`,
    };
  }

  const urlset = (doc.urlset ?? doc["ns2:urlset"]) as Record<string, unknown> | undefined;
  const sitemapindex = (doc.sitemapindex ?? doc["ns2:sitemapindex"]) as
    | Record<string, unknown>
    | undefined;

  if (sitemapindex) {
    const items = asArray(sitemapindex.sitemap as unknown);
    const childSitemaps = items
      .map((item) => {
        const it = item as Record<string, unknown>;
        const loc = asString(it.loc);
        const lastmod = asString(it.lastmod);
        return loc ? { loc, lastmod } : null;
      })
      .filter((x): x is { loc: string; lastmod: string | null } => !!x);
    return {
      type: "sitemapindex",
      source,
      entries: [],
      childSitemaps,
      rawUrlCount: 0,
      ok: true,
    };
  }

  if (urlset) {
    const items = asArray(urlset.url as unknown);
    const entries: SitemapEntry[] = [];
    for (const item of items) {
      const it = item as Record<string, unknown>;
      const loc = asString(it.loc);
      if (!loc) continue;

      // images
      const images = asArray(it["image:image"] as unknown)
        .map((img) => asString((img as Record<string, unknown>)["image:loc"]))
        .filter((s): s is string => !!s);

      // videos
      const videos = asArray(it["video:video"] as unknown)
        .map((vid) => {
          const v = vid as Record<string, unknown>;
          return (
            asString(v["video:content_loc"]) ??
            asString(v["video:player_loc"]) ??
            asString(v["video:title"])
          );
        })
        .filter((s): s is string => !!s);

      // news
      let news: SitemapEntry["news"] = null;
      const newsBlock = it["news:news"] as Record<string, unknown> | undefined;
      if (newsBlock) {
        const title = asString(newsBlock["news:title"]);
        if (title) {
          news = {
            title,
            publicationDate: asString(newsBlock["news:publication_date"]),
          };
        }
      }

      // hreflang alternates
      const alternates: HreflangAlt[] = [];
      for (const link of asArray(it["xhtml:link"] as unknown)) {
        const l = link as Record<string, unknown>;
        const rel = asString(l["@_rel"]);
        if (rel !== "alternate") continue;
        const hreflang = asString(l["@_hreflang"]);
        const href = asString(l["@_href"]);
        if (hreflang && href) alternates.push({ hreflang, href });
      }

      entries.push({
        loc,
        lastmod: asString(it.lastmod),
        changefreq: asString(it.changefreq),
        priority: parsePriority(asString(it.priority)),
        source,
        images: images.length ? images : undefined,
        videos: videos.length ? videos : undefined,
        news,
        alternates: alternates.length ? alternates : undefined,
      });
    }
    return {
      type: "urlset",
      source,
      entries,
      childSitemaps: [],
      rawUrlCount: entries.length,
      ok: true,
    };
  }

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

// ── Single-sitemap fetch + parse ───────────────────────────────────────────

export async function fetchSitemap(url: string): Promise<ParsedSitemap> {
  const t0 = Date.now();
  const res = await fetchRaw(url);
  if (!res.ok) {
    return {
      type: "unknown",
      source: url,
      entries: [],
      childSitemaps: [],
      rawUrlCount: 0,
      ok: false,
      status: res.status,
      error: res.error,
      durationMs: Date.now() - t0,
    };
  }
  const parsed = parseSitemapXml(res.body, url);
  parsed.status = res.status;
  parsed.bytes = res.bytes;
  parsed.contentType = res.contentType;
  parsed.durationMs = Date.now() - t0;
  return parsed;
}

// ── Concurrent BFS tree extraction ─────────────────────────────────────────

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = new Array(Math.min(limit, items.length || 1)).fill(0).map(async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]!);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function fetchSitemapTree(rootUrl: string): Promise<SitemapTree> {
  const fetched: ParsedSitemap[] = [];
  const errors: Array<{ source: string; error: string }> = [];
  const allEntries: SitemapEntry[] = [];
  const seen = new Set<string>();
  let truncated = false;

  // BFS with concurrent layers. Each layer: fetch all sitemaps in parallel,
  // collect children, push next layer.
  let frontier: string[] = [rootUrl];
  seen.add(rootUrl);

  while (frontier.length > 0) {
    if (fetched.length >= MAX_SITEMAPS) {
      truncated = true;
      break;
    }
    const remaining = MAX_SITEMAPS - fetched.length;
    const batch = frontier.slice(0, remaining);
    if (batch.length < frontier.length) truncated = true;

    const parsedLayer = await runWithConcurrency(batch, FETCH_CONCURRENCY, fetchSitemap);

    const nextFrontier: string[] = [];
    for (const parsed of parsedLayer) {
      fetched.push(parsed);
      if (!parsed.ok) {
        errors.push({ source: parsed.source, error: parsed.error ?? "fetch_failed" });
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
          if (!seen.has(child.loc)) {
            seen.add(child.loc);
            nextFrontier.push(child.loc);
          }
        }
      }
    }
    frontier = nextFrontier;
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

// ── Discovery ──────────────────────────────────────────────────────────────

/**
 * Repair malformed sitemap URLs (e.g. `https://https://example.com/sitemap.xml`,
 * protocol-relative `//example.com/sitemap.xml`, or root-relative `/sitemap.xml`).
 * Returns null if unrecoverable.
 */
function sanitizeSitemapUrl(raw: string, baseOrigin: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  // Strip duplicated protocol prefix(es) like https://https://...
  s = s.replace(/^(https?:\/\/)+(?=https?:\/\/)/i, "");
  if (s.startsWith("//")) s = `https:${s}`;
  if (s.startsWith("/")) s = `${baseOrigin}${s}`;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    return u.toString();
  } catch {
    return null;
  }
}

const COMMON_SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/sitemap-index.xml",
  "/sitemap.xml.gz",
  "/sitemap1.xml",
  "/post-sitemap.xml",
  "/page-sitemap.xml",
  "/category-sitemap.xml",
  "/wp-sitemap.xml",
];

export async function discoverSitemaps(origin: string): Promise<string[]> {
  const found: string[] = [];
  const seen = new Set<string>();

  // 1. robots.txt
  const robots = await fetchRaw(`${origin}/robots.txt`, 6000);
  if (robots.ok) {
    for (const m of robots.body.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)) {
      const sanitized = sanitizeSitemapUrl(m[1]!, origin);
      if (sanitized && !seen.has(sanitized)) {
        seen.add(sanitized);
        found.push(sanitized);
      }
    }
  }

  // 2. Probe common paths (always — even if robots gave us entries, common
  // paths are cheap to check and protect against malformed robots.txt).
  for (const path of COMMON_SITEMAP_PATHS) {
    const candidate = `${origin}${path}`;
    if (seen.has(candidate)) continue;
    const probe = await fetchRaw(candidate, 6000);
    if (probe.ok && /<(urlset|sitemapindex)/i.test(probe.body)) {
      seen.add(candidate);
      found.push(candidate);
      if (found.length >= 3) break; // enough for discovery — tree handles rest
    }
  }

  // 3. Last-resort: blind list (parser handles 404s gracefully)
  if (found.length === 0) {
    found.push(`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`);
  }

  return found;
}

// ── Input normalization ────────────────────────────────────────────────────

/**
 * Decide whether the user gave us a sitemap URL directly, or we need to
 * discover. Returns `{ direct: true, url }` for direct sitemap input,
 * `{ direct: false, origin }` for domain/page input.
 */
export function classifySitemapInput(input: string): { direct: boolean; origin: string; url: string } {
  const u = new URL(input);
  const origin = `${u.protocol}//${u.host}`;
  const path = u.pathname.toLowerCase();
  const direct =
    path.endsWith(".xml") ||
    path.endsWith(".xml.gz") ||
    path.includes("sitemap") ||
    path.endsWith("/robots.txt");
  // robots.txt is technically not a sitemap, but treat as discovery hint
  return { direct: direct && !path.endsWith("/robots.txt"), origin, url: input };
}
