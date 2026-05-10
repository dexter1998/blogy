import * as cheerio from "cheerio";
import type { CountryEntry } from "../countries";
import type { SearchEngine, FetchOpts } from "../engine";
import { emptyFetch } from "../engine";
import { searchHttpGet } from "../http";
import { clean, safeDomain, unwrapRedirect } from "../parsing";
import type {
  EngineFetch,
  FeaturedSnippet,
  PaaItem,
  SearchResult,
} from "../types";

async function fetchDdg(query: string, country: CountryEntry, opts: FetchOpts = {}): Promise<EngineFetch> {
  const params = new URLSearchParams({ q: query, kl: country.ddg });
  const url = `https://html.duckduckgo.com/html/?${params.toString()}`;
  const res = await searchHttpGet(url, { signal: opts.signal });
  if (!res.ok) return emptyFetch("duckduckgo", query, country, res.error);

  const $ = cheerio.load(res.body);
  const results: SearchResult[] = [];
  let ads = 0;

  $("div.result, div.web-result").each((_, el) => {
    const $el = $(el);
    const isAd = $el.hasClass("result--ad") || $el.hasClass("result--ad-light");
    const $a = $el.find("a.result__a, a.eVNpHGjtxRBq_gLOfGDr").first();
    const rawHref = $a.attr("href") ?? "";
    if (!rawHref || rawHref.startsWith("javascript:")) return;
    const targetUrl = unwrapRedirect(
      rawHref.startsWith("//") ? `https:${rawHref}` : rawHref,
      "duckduckgo.com",
    );
    if (!targetUrl) return;

    const title = clean($a.text());
    const snippet = clean($el.find(".result__snippet, .OgdwYG6KE2qthn9XQWFC").text());
    const displayUrl = clean($el.find(".result__url, .uXOPnMxOWjnkQDzQjDjN").text()) || targetUrl;
    if (!title) return;

    if (isAd) {
      ads++;
      return;
    }

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

  const related: string[] = [];
  $("div.related-searches a, .zci__related-searches a").each((_, el) => {
    const t = clean($(el).text());
    if (t && !related.includes(t)) related.push(t);
  });

  // DDG occasionally renders a top "instant answer" card. We treat it as a
  // featured snippet when present.
  let featuredSnippet: FeaturedSnippet | null = null;
  const $zci = $(".zci__main, .zci__body, #zero_click_wrapper").first();
  if ($zci.length) {
    const text = clean($zci.text()).slice(0, 600);
    const ahref = $zci.find("a").first().attr("href");
    const target = ahref ? unwrapRedirect(ahref.startsWith("//") ? `https:${ahref}` : ahref, "duckduckgo.com") : "";
    if (text) {
      featuredSnippet = {
        title: clean($zci.find("h2, .zci__heading").first().text()) || query,
        url: target || "",
        domain: target ? safeDomain(target) : "",
        snippet: text,
        source: "duckduckgo",
      };
    }
  }

  const paa: PaaItem[] = [];

  return {
    engine: "duckduckgo",
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
      videos: 0,
      images: 0,
      news: 0,
      hasFeaturedSnippet: !!featuredSnippet,
      hasKnowledgePanel: false,
      hasLocalPack: false,
    },
  };
}

export const duckduckgoEngine: SearchEngine = {
  id: "duckduckgo",
  displayName: "DuckDuckGo",
  priority: 30,
  fetch: fetchDdg,
};
