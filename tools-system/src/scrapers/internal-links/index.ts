/**
 * Internal Link extractor (single page).
 *
 * Fetches one URL, walks every <a href>, and categorises each link by:
 *   - section: navbar / footer / body (based on ancestor <header>/<nav>/<footer>)
 *   - scope:   internal (same registrable host or a subdomain) vs external
 *
 * Then HEAD-pings every unique destination to flag broken links. Results
 * are cached by URL; the API layer slices the link list with offset/limit
 * so the UI can do "load next 500" without a re-fetch.
 */

import * as cheerio from "cheerio";
import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import type {
  ExtractedLink,
  InternalLinkInput,
  InternalLinkResult,
  LinkSection,
  SectionCounts,
} from "./types";

const HARD_LINK_CAP = 5000;
const BROKEN_CHECK_CONCURRENCY = 12;
const BROKEN_CHECK_TIMEOUT = 8000;

function emptyCounts(): SectionCounts {
  return { total: 0, internal: 0, external: 0, broken: 0 };
}

/**
 * Best-effort registrable host. We don't ship a public-suffix list, so we
 * keep the last two labels (e.g. blogy.in, example.co.uk-style cases will
 * over-match, but for internal vs external bucketing it's acceptable —
 * the user wants "same domain or subdomain" to count as internal).
 */
function registrableHost(hostname: string): string {
  const h = hostname.toLowerCase();
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  return parts.slice(-2).join(".");
}

type CheerioWrap = ReturnType<cheerio.CheerioAPI>;

// Use the closest <footer>/<nav>/<header> ancestor to bucket. Footer wins
// over navbar when nested (rare). Falls back to role / class / id hints so
// sites that build their own chrome with <div class="footer"> still bucket.
function sectionFor($el: CheerioWrap): LinkSection {
  if ($el.closest("footer").length) return "footer";
  if ($el.closest("nav, header").length) return "navbar";
  if ($el.closest('[role="contentinfo"]').length) return "footer";
  if ($el.closest('[role="navigation"], [role="banner"]').length) return "navbar";
  if ($el.closest('[class*="footer" i], [id*="footer" i]').length) return "footer";
  if (
    $el.closest(
      '[class*="navbar" i], [class*="header" i], [id*="navbar" i], [id*="header" i]',
    ).length
  )
    return "navbar";
  return "body";
}

function normaliseHref(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function bumpCounts(c: SectionCounts, link: ExtractedLink) {
  c.total += 1;
  if (link.scope === "internal") c.internal += 1;
  else c.external += 1;
  if (link.broken) c.broken += 1;
}

async function checkStatus(url: string): Promise<number | null> {
  // Use HEAD first via httpGet's fallback? httpGet only supports GET, so use
  // a lightweight GET with a short timeout. Many servers return non-200 on HEAD.
  const res = await httpGet(url, { timeoutMs: BROKEN_CHECK_TIMEOUT, maxRedirects: 5 });
  return res.ok ? res.status : res.status;
}

async function checkAll(urls: string[]): Promise<Map<string, number | null>> {
  const out = new Map<string, number | null>();
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      const u = urls[i];
      if (!u) continue;
      try {
        out.set(u, await checkStatus(u));
      } catch {
        out.set(u, null);
      }
    }
  }
  const n = Math.min(BROKEN_CHECK_CONCURRENCY, Math.max(1, urls.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

export const internalLinksScraper: Scraper<InternalLinkInput, InternalLinkResult> = {
  name: "internal-links",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    // Cache the full extraction by URL only — offset/limit are applied
    // post-cache in the route layer so pagination doesn't refetch.
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<InternalLinkResult> {
    const res = await httpGet(input.url, { timeoutMs: env.scrapeTimeoutMs });
    if (!res.ok) {
      throw new ScrapeError(
        "scrape_failed",
        `Could not fetch page (${res.error}: ${res.message})`,
      );
    }

    const $ = cheerio.load(res.body);
    const finalUrl = res.finalUrl;
    const origin = new URL(finalUrl).origin;
    const baseHost = registrableHost(new URL(finalUrl).hostname);

    // First pass: parse every <a href>. We dedupe by (url + section) so a
    // link appearing in both navbar and footer is reported twice (which is
    // accurate — but a duplicate within the same section is collapsed).
    const seen = new Set<string>();
    const links: ExtractedLink[] = [];

    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") ?? "").trim();
      if (!href) return;
      if (
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      )
        return;
      const abs = normaliseHref(href, finalUrl);
      if (!abs) return;
      const $el = $(el);
      const section = sectionFor($el);
      const key = `${section}|${abs}`;
      if (seen.has(key)) return;
      seen.add(key);

      let host: string;
      try {
        host = new URL(abs).hostname.toLowerCase();
      } catch {
        return;
      }
      const scope =
        host === new URL(finalUrl).hostname.toLowerCase() ||
        registrableHost(host) === baseHost
          ? "internal"
          : "external";

      const text = ($(el).text() ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
      const rel = $(el).attr("rel")?.trim() || null;

      links.push({
        url: abs,
        href,
        text,
        section,
        scope,
        rel,
        status: null,
        broken: false,
      });

      if (links.length >= HARD_LINK_CAP) return false;
    });

    // Live status check, parallel-bounded. We only ping each unique URL
    // once and reuse the status across sections.
    const uniqueUrls = Array.from(new Set(links.map((l) => l.url)));
    const statuses = await checkAll(uniqueUrls);
    for (const l of links) {
      const s = statuses.get(l.url) ?? null;
      l.status = s;
      l.broken = s === null || s >= 400;
    }

    // Section/total counts
    const totals = {
      all: emptyCounts(),
      navbar: emptyCounts(),
      footer: emptyCounts(),
      body: emptyCounts(),
    };
    for (const l of links) {
      bumpCounts(totals.all, l);
      bumpCounts(totals[l.section], l);
    }

    return {
      pageUrl: finalUrl,
      origin,
      baseHost,
      pageStatus: res.status,
      pageTitle: ($("title").first().text() ?? "").trim() || null,
      fetchedAt: new Date().toISOString(),
      totals,
      page: {
        // The runner caches this whole object; the route layer slices
        // `links` based on the request's offset/limit before responding.
        offset: 0,
        limit: links.length,
        total: links.length,
        links,
      },
    };
  },
};
