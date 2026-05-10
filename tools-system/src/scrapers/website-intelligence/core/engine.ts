/**
 * Website Intelligence Engine — core crawl + render pipeline.
 *
 * Crawls the home page + a small bounded set of internal pages with a
 * shared concurrency pool. The output is a single `IntelligenceContext`
 * that every extractor consumes — so we render once, extract many.
 *
 * No third-party APIs. All inputs are HTML / headers / robots.txt /
 * sitemap.xml fetched from the target site itself.
 */

import * as cheerio from "cheerio";
import { httpGet } from "@/scrapers/_shared/http";
import { discoverSitemaps, fetchSitemapTree } from "@/scrapers/_shared/sitemap";

export type FetchedPage = {
  url: string;
  finalUrl: string;
  status: number | null;
  ok: boolean;
  html: string;
  headers: Record<string, string>;
  $: cheerio.CheerioAPI;
  /** All <script> tag attrs/inline-content captured for fingerprinting. */
  scripts: Array<{ src: string | null; inline: string | null }>;
  /** All <link rel> tags for stylesheet/preconnect/preload fingerprinting. */
  links: Array<{ rel: string; href: string }>;
  /** Internal anchors discovered on this page (kept absolute, normalised). */
  internalLinks: Array<{ text: string; href: string }>;
  externalLinks: Array<{ text: string; href: string }>;
  loadMs: number;
};

export type RobotsInfo = {
  found: boolean;
  url: string | null;
  raw: string | null;
  userAgents: string[];
  disallows: string[];
  sitemaps: string[];
};

export type SitemapInfo = {
  declared: string[];
  discovered: string[];
  totalUrls: number;
  truncated: boolean;
  sample: string[];
};

export type IntelligenceContext = {
  input: string;
  finalUrl: string;
  origin: string;
  rootDomain: string;
  /** First page is always the home / entry URL. */
  pages: FetchedPage[];
  robots: RobotsInfo;
  sitemap: SitemapInfo;
  /** Aggregated raw script src/inline blob across all pages — used for
   * fingerprint matching. Capped to keep memory bounded. */
  allScriptSrcs: string[];
  allScriptInline: string;
  /** Aggregated raw HTML across all pages — capped. */
  combinedHtml: string;
};

const MAX_PAGES = 25;
const DEFAULT_PAGES = 8;
const PAGE_FETCH_CONCURRENCY = 4;
const PAGE_TIMEOUT_MS = 9000;
const MAX_INLINE_PER_PAGE = 200_000; // cap inline script aggregation

function rootDomainOf(host: string): string {
  // very pragmatic: drop "www.", keep the rest. Public-suffix-list-aware
  // logic isn't needed for any of the signals we extract.
  return host.replace(/^www\./i, "").toLowerCase();
}

function normaliseHref(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ].forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return null;
  }
}

async function fetchOne(url: string): Promise<FetchedPage | null> {
  const t0 = Date.now();
  const res = await httpGet(url, { timeoutMs: PAGE_TIMEOUT_MS });
  const loadMs = Date.now() - t0;
  if (!res.ok) {
    return {
      url,
      finalUrl: url,
      status: res.status,
      ok: false,
      html: "",
      headers: {},
      $: cheerio.load("<html></html>"),
      scripts: [],
      links: [],
      internalLinks: [],
      externalLinks: [],
      loadMs,
    };
  }

  const $ = cheerio.load(res.body);
  const finalUrl = res.finalUrl;
  let origin: string;
  try {
    origin = new URL(finalUrl).origin;
  } catch {
    origin = "";
  }

  const scripts: FetchedPage["scripts"] = [];
  $("script").each((_, el) => {
    const src = ($(el).attr("src") ?? "").trim() || null;
    let inline: string | null = null;
    if (!src) {
      const t = $(el).contents().text();
      if (t && t.trim()) inline = t.slice(0, MAX_INLINE_PER_PAGE);
    }
    scripts.push({ src, inline });
  });

  const links: FetchedPage["links"] = [];
  $("link").each((_, el) => {
    const rel = ($(el).attr("rel") ?? "").trim();
    const href = ($(el).attr("href") ?? "").trim();
    if (rel && href) links.push({ rel, href });
  });

  const internalLinks: FetchedPage["internalLinks"] = [];
  const externalLinks: FetchedPage["externalLinks"] = [];
  $("a[href]").each((_, el) => {
    const raw = ($(el).attr("href") ?? "").trim();
    if (!raw || raw.startsWith("javascript:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
    const abs = normaliseHref(raw, finalUrl);
    if (!abs) return;
    let abH = "";
    try {
      abH = new URL(abs).origin;
    } catch {
      return;
    }
    const text = ($(el).text() ?? "").replace(/\s+/g, " ").trim();
    const entry = { text: text || abs, href: abs };
    if (abH === origin) internalLinks.push(entry);
    else externalLinks.push(entry);
  });

  return {
    url,
    finalUrl,
    status: res.status,
    ok: true,
    html: res.body,
    headers: res.headers,
    $,
    scripts,
    links,
    internalLinks,
    externalLinks,
    loadMs,
  };
}

async function fetchRobots(origin: string): Promise<RobotsInfo> {
  const url = `${origin}/robots.txt`;
  const res = await httpGet(url, { timeoutMs: 5000 });
  if (!res.ok) {
    return { found: false, url: null, raw: null, userAgents: [], disallows: [], sitemaps: [] };
  }
  const raw = res.body ?? "";
  const userAgents = Array.from(
    new Set(
      Array.from(raw.matchAll(/^\s*user-agent\s*:\s*(.+)$/gim)).map((m) =>
        (m[1] ?? "").trim(),
      ),
    ),
  );
  const disallows = Array.from(
    new Set(
      Array.from(raw.matchAll(/^\s*disallow\s*:\s*(.+)$/gim))
        .map((m) => (m[1] ?? "").trim())
        .filter(Boolean),
    ),
  );
  const sitemaps = Array.from(
    new Set(
      Array.from(raw.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)).map((m) =>
        (m[1] ?? "").trim(),
      ),
    ),
  );
  return { found: true, url, raw, userAgents, disallows, sitemaps };
}

async function fetchSitemapInfo(origin: string, declared: string[]): Promise<SitemapInfo> {
  // discoverSitemaps probes robots + common paths; merge with declared set.
  const discovered = await discoverSitemaps(origin);
  const merged = Array.from(new Set([...declared, ...discovered]));
  if (merged.length === 0) {
    return { declared, discovered, totalUrls: 0, truncated: false, sample: [] };
  }
  // Run trees in parallel — bounded internally.
  const trees = await Promise.all(merged.slice(0, 6).map((u) => fetchSitemapTree(u)));
  const seen = new Set<string>();
  const sample: string[] = [];
  let total = 0;
  let truncated = false;
  for (const t of trees) {
    truncated = truncated || t.truncated;
    for (const e of t.allEntries) {
      if (seen.has(e.loc)) continue;
      seen.add(e.loc);
      total += 1;
      if (sample.length < 100) sample.push(e.loc);
    }
  }
  return { declared, discovered: merged, totalUrls: total, truncated, sample };
}

function pickInternalCandidates(seed: FetchedPage, max: number): string[] {
  const seen = new Set<string>([seed.finalUrl]);
  const picks: string[] = [];
  // Prioritise nav + footer links, fall back to first-seen.
  const $ = seed.$;
  const navHrefs: string[] = [];
  $("header a[href], nav a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").trim();
    if (href) navHrefs.push(href);
  });
  $("footer a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").trim();
    if (href) navHrefs.push(href);
  });

  let origin = "";
  try {
    origin = new URL(seed.finalUrl).origin;
  } catch {
    return picks;
  }

  const enqueue = (href: string) => {
    const abs = normaliseHref(href, seed.finalUrl);
    if (!abs) return;
    let h = "";
    try {
      h = new URL(abs).origin;
    } catch {
      return;
    }
    if (h !== origin) return;
    if (/\.(pdf|zip|jpg|jpeg|png|gif|webp|svg|mp4|mp3|woff2?|css|js|ico|xml)(\?|$)/i.test(abs))
      return;
    if (seen.has(abs)) return;
    seen.add(abs);
    picks.push(abs);
  };

  for (const h of navHrefs) {
    if (picks.length >= max) break;
    enqueue(h);
  }
  if (picks.length < max) {
    for (const l of seed.internalLinks) {
      if (picks.length >= max) break;
      enqueue(l.href);
    }
  }
  return picks.slice(0, max);
}

async function runConcurrently<T>(
  items: string[],
  limit: number,
  worker: (s: string) => Promise<T>,
): Promise<T[]> {
  const out: T[] = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length || 1) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx]!);
    }
  });
  await Promise.all(runners);
  return out;
}

export async function buildContext(
  input: string,
  opts: { depth?: number } = {},
): Promise<IntelligenceContext> {
  const seed = await fetchOne(input);
  if (!seed || !seed.ok) {
    throw new Error(
      `Could not fetch URL: ${seed?.status ? `HTTP ${seed.status}` : "network error"}`,
    );
  }
  const finalUrl = seed.finalUrl;
  const origin = new URL(finalUrl).origin;
  const rootDomain = rootDomainOf(new URL(finalUrl).hostname);

  const depth = Math.min(MAX_PAGES, Math.max(0, opts.depth ?? DEFAULT_PAGES));
  const candidates = pickInternalCandidates(seed, depth);
  const extras = (await runConcurrently(candidates, PAGE_FETCH_CONCURRENCY, async (u) => {
    const p = await fetchOne(u);
    return p;
  })).filter((p): p is FetchedPage => p !== null);

  const pages = [seed, ...extras];

  // Robots + sitemap (parallel).
  const [robots, sitemap] = await Promise.all([
    fetchRobots(origin),
    (async () => {
      const declared = (await fetchRobots(origin)).sitemaps;
      return fetchSitemapInfo(origin, declared);
    })(),
  ]);

  // Aggregate scripts + html for fingerprinting (capped).
  const allScriptSrcs: string[] = [];
  const inlinePieces: string[] = [];
  const htmlPieces: string[] = [];
  const MAX_AGG = 1_500_000;
  let aggSize = 0;
  for (const p of pages) {
    for (const s of p.scripts) {
      if (s.src) allScriptSrcs.push(s.src);
      if (s.inline && aggSize < MAX_AGG) {
        inlinePieces.push(s.inline);
        aggSize += s.inline.length;
      }
    }
    if (htmlPieces.join("").length < MAX_AGG) htmlPieces.push(p.html);
  }

  return {
    input,
    finalUrl,
    origin,
    rootDomain,
    pages,
    robots,
    sitemap,
    allScriptSrcs,
    allScriptInline: inlinePieces.join("\n"),
    combinedHtml: htmlPieces.join("\n"),
  };
}
