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

async function fetchBing(query: string, country: CountryEntry, opts: FetchOpts = {}): Promise<EngineFetch> {
  const params = new URLSearchParams({
    q: query,
    cc: country.bingCc,
    setlang: country.bingLang,
    form: "QBLH",
    count: String(opts.maxResults ?? 25),
  });
  const url = `https://www.bing.com/search?${params.toString()}`;
  const res = await searchHttpGet(url, {
    signal: opts.signal,
    headers: { Cookie: `_EDGE_CD=m=${country.bingCc.toLowerCase()}; ` },
  });
  if (!res.ok) return emptyFetch("bing", query, country, res.error);

  const $ = cheerio.load(res.body);
  const results: SearchResult[] = [];
  let ads = 0;
  let videos = 0;
  let news = 0;
  let images = 0;
  let hasKnowledgePanel = false;

  // Ads (top + bottom rails)
  ads += $("li.b_ad, ol#b_results > li.b_adTop, ol#b_results > li.b_adBottom").length;

  // Organic
  $("li.b_algo").each((_, el) => {
    const $el = $(el);
    const $a = $el.find("h2 a").first();
    const rawHref = $a.attr("href") ?? "";
    if (!rawHref || rawHref.startsWith("javascript:")) return;
    const targetUrl = unwrapRedirect(rawHref, "bing.com");
    if (!isHttpUrl(targetUrl)) return;

    const title = clean($a.text());
    if (!title) return;
    const snippet = clean(
      $el
        .find(".b_caption p, .b_lineclamp4, .b_lineclamp3, .b_lineclamp2, .b_richcard p")
        .first()
        .text(),
    );
    const displayUrl = clean($el.find("cite").first().text()) || targetUrl;

    const sitelinks: { title: string; url: string }[] = [];
    $el.find(".b_vlist2col a, .b_factrow a").each((_i, a) => {
      const slUrl = unwrapRedirect($(a).attr("href") ?? "", "bing.com");
      const slTitle = clean($(a).text());
      if (slTitle && isHttpUrl(slUrl) && sitelinks.length < 6) {
        sitelinks.push({ title: slTitle, url: slUrl });
      }
    });

    results.push({
      position: results.length + 1,
      title,
      url: targetUrl,
      displayUrl,
      domain: safeDomain(targetUrl),
      snippet,
      kind: "organic",
      ...(sitelinks.length ? { sitelinks } : {}),
    });
  });

  // Featured snippet (Bing "answer" / b_ans)
  let featuredSnippet: FeaturedSnippet | null = null;
  const $ans = $("li.b_ans .b_richcard, li.b_ans .b_focusTextLarge, li.b_ans .b_factrow").first();
  if ($ans.length) {
    const text = clean($ans.text()).slice(0, 600);
    const $aLink = $("li.b_ans a").first();
    const tHref = unwrapRedirect($aLink.attr("href") ?? "", "bing.com");
    if (text) {
      featuredSnippet = {
        title: clean($("li.b_ans h2, li.b_ans .b_focusLabel").first().text()) || query,
        url: isHttpUrl(tHref) ? tHref : "",
        domain: isHttpUrl(tHref) ? safeDomain(tHref) : "",
        snippet: text,
        source: "bing",
      };
    }
  }

  // Rich blocks
  videos = $("li.b_ans.b_mop video, .b_videoCard, .videoCarousel li").length;
  news = $(".b_nwsCarousel li, .b_news .b_algo").length;
  images = $(".b_image_card, .img_cont, .imgpt").length;
  hasKnowledgePanel = $(".b_entityTP, .b_factrow").length > 0;

  // PAA-equivalent on Bing: "People also ask" / "Related questions"
  const paa: PaaItem[] = [];
  $(".b_ans:has(.b_expandable), .b_ans.df_pc, .df_qntext").each((_, el) => {
    const $el = $(el);
    $el.find(".df_qntext, .b_expandable .b_focusLabel").each((_i, q) => {
      const question = clean($(q).text());
      if (question && question.length > 6 && !paa.find((p) => p.question === question)) {
        paa.push({ question });
      }
    });
  });

  // Related searches
  const related: string[] = [];
  $("#brsv3 li a, .b_rs li a, ol#b_context .b_rs li a").each((_, el) => {
    const t = clean($(el).text());
    if (t && !related.includes(t)) related.push(t);
  });

  return {
    engine: "bing",
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
      hasLocalPack: false,
    },
  };
}

export const bingEngine: SearchEngine = {
  id: "bing",
  displayName: "Bing",
  priority: 20,
  fetch: fetchBing,
};
