/**
 * Google adapter.
 *
 * Caveat: Google aggressively gates HTML scraping with reCAPTCHA. We try
 * the lightweight HTML endpoint anyway because there are queries / regions
 * where it works, and the `searchHttpGet` helper detects the consent /
 * /sorry page and returns `error: blocked` rather than poisoning callers
 * with garbage. When blocked, this engine returns a normalized empty fetch
 * — the runner downgrades the call gracefully.
 */

import * as cheerio from "cheerio";
import type { CountryEntry } from "../countries";
import type { SearchEngine, FetchOpts } from "../engine";
import { emptyFetch } from "../engine";
import { searchHttpGet } from "../http";
import { clean, safeDomain, unwrapRedirect, isHttpUrl } from "../parsing";
import type {
  EngineFetch,
  FeaturedSnippet,
  PaaItem,
  SearchResult,
} from "../types";

async function fetchGoogle(query: string, country: CountryEntry, opts: FetchOpts = {}): Promise<EngineFetch> {
  const params = new URLSearchParams({
    q: query,
    gl: country.gl,
    hl: country.hl,
    pws: "0",
    num: String(Math.min(opts.maxResults ?? 25, 30)),
    ie: "UTF-8",
  });
  const url = `https://www.google.com/search?${params.toString()}`;
  const res = await searchHttpGet(url, {
    signal: opts.signal,
    headers: {
      // CONSENT cookie skips the EU consent interstitial that otherwise
      // hides the SERP behind a wall.
      Cookie: `CONSENT=YES+; SOCS=CAESHAgBEhJnd3NfMjAyNDA1MTUtMF9SQzMaAmVuIAEaBgiA_LyYBg`,
      Referer: "https://www.google.com/",
    },
  });
  if (!res.ok) return emptyFetch("google", query, country, res.error);

  const $ = cheerio.load(res.body);
  const results: SearchResult[] = [];
  let ads = 0;
  let videos = 0;
  let news = 0;
  let images = 0;

  // Ads cluster
  ads += $("[data-text-ad], .uEierd, #tads .ads-fr, #bottomads .ads-fr").length;

  // Organic results — multiple Google layouts exist; we try a few selectors.
  // Modern desktop layout uses `div.g` with anchors, recent variants use
  // `div.MjjYud` / `div.tF2Cxc` / `div.yuRUbf`.
  const seen = new Set<string>();
  $("div.g, div.MjjYud, div.tF2Cxc").each((_, el) => {
    const $el = $(el);
    const $a = $el.find("a[href]").first();
    const rawHref = $a.attr("href") ?? "";
    if (!rawHref) return;
    const targetUrl = unwrapRedirect(rawHref, "google.com");
    if (!isHttpUrl(targetUrl)) return;
    if (seen.has(targetUrl)) return;
    seen.add(targetUrl);
    const title = clean($el.find("h3").first().text());
    if (!title) return;
    const snippet = clean(
      $el
        .find('.VwiC3b, .lEBKkf, [data-content-feature="1"] span, .yXK7lf, .IsZvec')
        .first()
        .text(),
    );
    const displayUrl = clean($el.find("cite").first().text()) || targetUrl;

    results.push({
      position: results.length + 1,
      title,
      url: targetUrl,
      displayUrl,
      domain: safeDomain(targetUrl),
      snippet,
      kind: "organic",
    });
  });

  // Featured snippet (answer box)
  let featuredSnippet: FeaturedSnippet | null = null;
  const $fs = $(".kp-blk, .xpdopen .ifM9O, .c2xzTb, .V3FYCf").first();
  if ($fs.length) {
    const $aLink = $fs.find("a[href]").first();
    const tHref = unwrapRedirect($aLink.attr("href") ?? "", "google.com");
    const text = clean($fs.find(".hgKElc, .v9i61e, .di3YZe").text() || $fs.text()).slice(0, 600);
    if (text) {
      featuredSnippet = {
        title: clean($fs.find("h3, .DKV0Md").first().text()) || query,
        url: isHttpUrl(tHref) ? tHref : "",
        domain: isHttpUrl(tHref) ? safeDomain(tHref) : "",
        snippet: text,
        source: "google",
      };
    }
  }

  // PAA: "People also ask" expandable cards
  const paa: PaaItem[] = [];
  $('div[jsname="N760b"], .related-question-pair, .rc, div[jsname="Cpkphb"]').each((_, el) => {
    const $el = $(el);
    const q =
      clean($el.find('span[jsname="oe2qhf"], div.JlqpRe, div.iDjcJe').first().text()) ||
      clean($el.find("div").first().text());
    if (q && q.length > 6 && !paa.find((p) => p.question === q)) {
      paa.push({ question: q });
    }
  });

  // Rich blocks
  videos = $('g-scrolling-carousel a[href*="youtube.com"], .video-voyager, .Z0LcW.t2b5Cf').length;
  news = $(".WlydOe, .SoaBEf, g-section-with-header[data-attrid*='news']").length;
  images = $('.eA0Zlc, [data-ved] img[src*="encrypted-tbn"]').length;
  const hasKnowledgePanel = $(".kno-rdesc, .kp-wholepage, .knowledge-panel").length > 0;
  const hasLocalPack = $(".rllt__details, .uMdZh, .VkpGBb").length > 0;

  // Related searches
  const related: string[] = [];
  $(".s75CSd, .EIaa9b a, .AJLUJb a, #brs a, .k8XOCe").each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length > 1 && !related.includes(t)) related.push(t);
  });

  return {
    engine: "google",
    query,
    country: country.code,
    language: country.language,
    fetchedAt: new Date().toISOString(),
    ok: results.length > 0,
    error: results.length === 0 ? "no_results" : undefined,
    results: opts.maxResults ? results.slice(0, opts.maxResults) : results,
    paa,
    related,
    featuredSnippet,
    blocks: {
      ads,
      videos,
      images,
      news,
      hasFeaturedSnippet: !!featuredSnippet,
      hasKnowledgePanel,
      hasLocalPack,
    },
  };
}

export const googleEngine: SearchEngine = {
  id: "google",
  displayName: "Google",
  priority: 10,
  fetch: fetchGoogle,
};
