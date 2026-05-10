/**
 * Google adapter.
 *
 * Path A — Serper.dev API (when SERPER_API_KEY is set): Google's HTML SERP is
 * captcha-gated for almost every datacenter IP, so the primary path is the
 * Serper.dev /search endpoint. It returns clean structured JSON for organic
 * results, "People also ask", related searches, the answer box, ads, and
 * rich blocks (videos, news, images, knowledge panel, local pack).
 *
 * Path B — HTML scrape: When no API key is configured we still attempt the
 * lightweight HTML endpoint for queries / regions where it works. Blocked
 * pages return `error: blocked` instead of poisoning callers with garbage.
 */

import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { env } from "@/lib/env";
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

type SerperOrganic = {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
  date?: string;
  sitelinks?: { title?: string; link?: string }[];
};

type SerperPaa = {
  question?: string;
  snippet?: string;
  title?: string;
  link?: string;
};

type SerperAnswerBox = {
  title?: string;
  answer?: string;
  snippet?: string;
  link?: string;
};

type SerperKnowledgeGraph = { title?: string };

type SerperResponse = {
  organic?: SerperOrganic[];
  peopleAlsoAsk?: SerperPaa[];
  relatedSearches?: ({ query?: string } | string)[];
  answerBox?: SerperAnswerBox;
  knowledgeGraph?: SerperKnowledgeGraph;
  videos?: unknown[];
  images?: unknown[];
  news?: unknown[];
  topStories?: unknown[];
  shopping?: unknown[];
  ads?: unknown[];
  places?: unknown[];
  localResults?: unknown[];
};

async function fetchGoogleViaSerper(
  query: string,
  country: CountryEntry,
  opts: FetchOpts,
  apiKey: string,
): Promise<EngineFetch> {
  const num = Math.min(Math.max(opts.maxResults ?? 25, 5), 100);
  try {
    const res = await axios.post<SerperResponse>(
      "https://google.serper.dev/search",
      {
        q: query,
        gl: country.gl,
        hl: country.hl,
        num,
      },
      {
        timeout: env.scrapeTimeoutMs,
        signal: opts.signal,
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    if (res.status < 200 || res.status >= 300 || !res.data) {
      const reason = res.status === 401 || res.status === 403
        ? "auth"
        : res.status === 429
          ? "blocked"
          : `http_${res.status}`;
      return emptyFetch("google", query, country, reason);
    }

    const data = res.data;

    const results: SearchResult[] = [];
    for (const o of data.organic ?? []) {
      const url = o.link ?? "";
      if (!isHttpUrl(url)) continue;
      const title = clean(o.title ?? "");
      if (!title) continue;
      const sitelinks = (o.sitelinks ?? [])
        .map((s) => ({ title: clean(s.title ?? ""), url: s.link ?? "" }))
        .filter((s) => s.title && isHttpUrl(s.url))
        .slice(0, 6);
      results.push({
        position: results.length + 1,
        title,
        url,
        displayUrl: url,
        domain: safeDomain(url),
        snippet: clean(o.snippet ?? ""),
        kind: "organic",
        ...(sitelinks.length ? { sitelinks } : {}),
      });
    }

    const paa: PaaItem[] = [];
    for (const p of data.peopleAlsoAsk ?? []) {
      const question = clean(p.question ?? "");
      if (!question || paa.find((x) => x.question === question)) continue;
      const item: PaaItem = { question };
      if (p.snippet) item.answer = clean(p.snippet);
      if (p.link && isHttpUrl(p.link)) {
        item.sourceUrl = p.link;
        item.sourceDomain = safeDomain(p.link);
      }
      paa.push(item);
    }

    const related: string[] = [];
    for (const r of data.relatedSearches ?? []) {
      const text = clean(typeof r === "string" ? r : r.query ?? "");
      if (text && !related.includes(text)) related.push(text);
    }

    let featuredSnippet: FeaturedSnippet | null = null;
    if (data.answerBox) {
      const ab = data.answerBox;
      const text = clean(ab.answer ?? ab.snippet ?? "").slice(0, 600);
      if (text) {
        const link = ab.link ?? "";
        featuredSnippet = {
          title: clean(ab.title ?? "") || query,
          url: isHttpUrl(link) ? link : "",
          domain: isHttpUrl(link) ? safeDomain(link) : "",
          snippet: text,
          source: "google",
        };
      }
    }

    const blocks = {
      ads: Array.isArray(data.ads) ? data.ads.length : 0,
      videos: Array.isArray(data.videos) ? data.videos.length : 0,
      images: Array.isArray(data.images) ? data.images.length : 0,
      news:
        (Array.isArray(data.news) ? data.news.length : 0) +
        (Array.isArray(data.topStories) ? data.topStories.length : 0),
      hasFeaturedSnippet: !!featuredSnippet,
      hasKnowledgePanel: !!data.knowledgeGraph,
      hasLocalPack:
        (Array.isArray(data.places) && data.places.length > 0) ||
        (Array.isArray(data.localResults) && data.localResults.length > 0),
    };

    const sliced = opts.maxResults ? results.slice(0, opts.maxResults) : results;

    return {
      engine: "google",
      query,
      country: country.code,
      language: country.language,
      fetchedAt: new Date().toISOString(),
      ok: sliced.length > 0,
      ...(sliced.length === 0 ? { error: "no_results" } : {}),
      results: sliced,
      paa,
      related,
      featuredSnippet,
      blocks,
    };
  } catch (e) {
    const ax = e as AxiosError;
    const reason =
      ax.code === "ECONNABORTED" || /aborted/i.test(ax.message ?? "")
        ? "timeout"
        : ax.code === "ERR_CANCELED"
          ? "canceled"
          : "network";
    return emptyFetch("google", query, country, reason);
  }
}

async function fetchGoogleViaHtml(
  query: string,
  country: CountryEntry,
  opts: FetchOpts,
): Promise<EngineFetch> {
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
    ...(results.length === 0 ? { error: "no_results" } : {}),
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

async function fetchGoogle(query: string, country: CountryEntry, opts: FetchOpts = {}): Promise<EngineFetch> {
  const apiKey = env.serperApiKey;
  if (apiKey) {
    const fetched = await fetchGoogleViaSerper(query, country, opts, apiKey);
    // If Serper returns auth error, fall through to HTML so a misconfigured
    // key doesn't fully blank the engine; for any other failure mode the
    // empty fetch is the right answer.
    if (fetched.ok || fetched.error !== "auth") return fetched;
  }
  return fetchGoogleViaHtml(query, country, opts);
}

export const googleEngine: SearchEngine = {
  id: "google",
  displayName: "Google",
  priority: 10,
  fetch: fetchGoogle,
};
