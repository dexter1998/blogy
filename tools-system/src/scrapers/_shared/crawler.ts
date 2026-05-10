/**
 * Bounded BFS site crawler. Used by Internal Link API and SEO Audit.
 * Stays on origin, respects a hard page cap and concurrency cap so
 * a single API call can never run away with the site's CPU.
 */

import * as cheerio from "cheerio";
import { httpGet } from "./http";

export type CrawledPage = {
  url: string;
  status: number | null;
  ok: boolean;
  title: string | null;
  h1: string | null;
  metaDescription: string | null;
  metaRobotsNoindex: boolean;
  internalLinks: string[];
  externalLinks: string[];
  wordCount: number;
  loadMs: number;
};

export type CrawlResult = {
  origin: string;
  startedFrom: string;
  pages: CrawledPage[];
  truncated: boolean;
};

export type CrawlOptions = {
  maxPages: number;
  concurrency: number;
  timeoutMs?: number;
};

function normaliseUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    // strip common tracking params for de-duplication
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

async function fetchOne(url: string, timeoutMs: number): Promise<CrawledPage> {
  const t0 = Date.now();
  const res = await httpGet(url, { timeoutMs });
  const loadMs = Date.now() - t0;
  if (!res.ok) {
    return {
      url,
      status: res.status,
      ok: false,
      title: null,
      h1: null,
      metaDescription: null,
      metaRobotsNoindex: false,
      internalLinks: [],
      externalLinks: [],
      wordCount: 0,
      loadMs,
    };
  }
  const $ = cheerio.load(res.body);
  const origin = new URL(res.finalUrl).origin;
  const internal: string[] = [];
  const external: string[] = [];
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").trim();
    if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const abs = normaliseUrl(href, res.finalUrl);
    if (!abs) return;
    if (new URL(abs).origin === origin) internal.push(abs);
    else external.push(abs);
  });
  const robots = ($('meta[name="robots"]').attr("content") ?? "").toLowerCase();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return {
    url: res.finalUrl,
    status: res.status,
    ok: true,
    title: ($("title").first().text() ?? "").trim() || null,
    h1: ($("h1").first().text() ?? "").trim() || null,
    metaDescription: ($('meta[name="description"]').attr("content") ?? "").trim() || null,
    metaRobotsNoindex: /\bnoindex\b/.test(robots),
    internalLinks: Array.from(new Set(internal)),
    externalLinks: Array.from(new Set(external)),
    wordCount: text ? text.split(/\s+/).length : 0,
    loadMs,
  };
}

export async function crawlSite(
  startUrl: string,
  opts: CrawlOptions,
): Promise<CrawlResult> {
  const origin = new URL(startUrl).origin;
  const queue: string[] = [startUrl];
  const seen = new Set<string>([startUrl]);
  const pages: CrawledPage[] = [];
  const concurrency = Math.max(1, Math.min(8, opts.concurrency));
  const timeoutMs = opts.timeoutMs ?? 7000;
  let truncated = false;

  while (queue.length > 0 && pages.length < opts.maxPages) {
    const batch = queue.splice(0, concurrency);
    const results = await Promise.all(
      batch.map((u) => fetchOne(u, timeoutMs).catch((): CrawledPage => ({
        url: u,
        status: null,
        ok: false,
        title: null,
        h1: null,
        metaDescription: null,
        metaRobotsNoindex: false,
        internalLinks: [],
        externalLinks: [],
        wordCount: 0,
        loadMs: 0,
      }))),
    );
    for (const p of results) {
      pages.push(p);
      if (pages.length >= opts.maxPages) {
        truncated = queue.length > 0;
        break;
      }
      for (const link of p.internalLinks) {
        if (seen.has(link)) continue;
        // ignore obvious binary endpoints
        if (/\.(pdf|zip|jpg|jpeg|png|gif|webp|svg|mp4|mp3|woff2?)(\?|$)/i.test(link)) continue;
        seen.add(link);
        queue.push(link);
      }
    }
  }
  if (queue.length > 0) truncated = true;

  return { origin, startedFrom: startUrl, pages, truncated };
}
