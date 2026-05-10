import * as cheerio from "cheerio";
import type { CountryEntry } from "../countries";
import type { SearchEngine, FetchOpts } from "../engine";
import { emptyFetch } from "../engine";
import { searchHttpGet } from "../http";
import { clean, safeDomain, unwrapRedirect, isHttpUrl } from "../parsing";
import type {
  EngineFetch,
  PaaItem,
  SearchResult,
} from "../types";

async function fetchYahoo(query: string, country: CountryEntry, opts: FetchOpts = {}): Promise<EngineFetch> {
  const host = country.yahooHost ? `${country.yahooHost}.search.yahoo.com` : "search.yahoo.com";
  const params = new URLSearchParams({ p: query, fr: "yfp-t", ei: "UTF-8" });
  const url = `https://${host}/search?${params.toString()}`;
  const res = await searchHttpGet(url, { signal: opts.signal });
  if (!res.ok) return emptyFetch("yahoo", query, country, res.error);

  const $ = cheerio.load(res.body);
  const results: SearchResult[] = [];

  // Yahoo organic results
  $("#web ol li.algo, #web ol li.dd, ol.searchCenterMiddle li.algo, ol.reg li").each((_, el) => {
    const $el = $(el);
    if ($el.hasClass("algo-spons") || $el.hasClass("ads")) return;
    const $a = $el.find("h3 a, .compTitle a").first();
    const rawHref = $a.attr("href") ?? "";
    if (!rawHref || rawHref.startsWith("javascript:")) return;
    const targetUrl = unwrapRedirect(rawHref, "yahoo.com");
    if (!isHttpUrl(targetUrl)) return;
    const title = clean($a.text());
    if (!title) return;
    const snippet = clean(
      $el.find(".compText p, .compText, .ac-21th, .fz-ms").first().text(),
    );
    const displayUrl = clean($el.find("span.fz-ms.fw-m, .compTitle span").first().text()) || targetUrl;

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

  let ads = 0;
  ads = $(".algo-spons, ol.searchTop li.ads, ol.searchBottom li.ads").length;

  const related: string[] = [];
  $(".searchBottom .compPagination a, .reg.searchBottom a, .also-try a, ul.also-try li a").each(
    (_, el) => {
      const t = clean($(el).text());
      if (t && !related.includes(t)) related.push(t);
    },
  );

  // Yahoo PAA equivalent ("People also ask" appears as compArticleList)
  const paa: PaaItem[] = [];
  $(".compArticleList li, .alsoAsk li, .also-asked li").each((_, el) => {
    const q = clean($(el).find("a, .title").first().text() || $(el).text());
    if (q && q.length > 6 && !paa.find((p) => p.question === q)) paa.push({ question: q });
  });

  return {
    engine: "yahoo",
    query,
    country: country.code,
    language: country.language,
    fetchedAt: new Date().toISOString(),
    ok: results.length > 0,
    error: results.length === 0 ? "no_results" : undefined,
    results: opts.maxResults ? results.slice(0, opts.maxResults) : results,
    paa,
    related,
    featuredSnippet: null,
    blocks: {
      ads,
      videos: 0,
      images: 0,
      news: 0,
      hasFeaturedSnippet: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
    },
  };
}

export const yahooEngine: SearchEngine = {
  id: "yahoo",
  displayName: "Yahoo",
  priority: 25,
  fetch: fetchYahoo,
};
