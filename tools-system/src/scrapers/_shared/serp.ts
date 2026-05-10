/**
 * Search-engine result page client. We use DuckDuckGo's HTML endpoint as
 * primary because it is publicly accessible, returns server-rendered HTML
 * (no JavaScript required), and does not aggressively block well-behaved
 * bots. Bing HTML is the fallback. Google scraping is intentionally
 * avoided: it gates with reCAPTCHA and the resulting data would be
 * unreliable in production.
 *
 * The point of this client is *transparency*: we return what the engine
 * actually showed for the query, with the source labeled.
 */

import * as cheerio from "cheerio";
import { httpGet } from "./http";

export type SerpResult = {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
};

export type SerpFetch = {
  query: string;
  source: "duckduckgo" | "bing";
  results: SerpResult[];
  related: string[];
  fetchedAt: string;
  ok: boolean;
  error?: string;
};

const UA = "BlogyToolsBot/1.0 (+https://blogy.in/tools)";

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function unwrapDuckHref(href: string): string {
  try {
    if (href.startsWith("//duckduckgo.com/l/?")) {
      const u = new URL(`https:${href}`);
      const target = u.searchParams.get("uddg");
      return target ? decodeURIComponent(target) : href;
    }
    if (href.startsWith("/l/?")) {
      const u = new URL(`https://duckduckgo.com${href}`);
      const target = u.searchParams.get("uddg");
      return target ? decodeURIComponent(target) : href;
    }
    return href;
  } catch {
    return href;
  }
}

async function fetchDuckDuckGo(query: string, region: string): Promise<SerpFetch> {
  const params = new URLSearchParams({ q: query, kl: region });
  const url = `https://html.duckduckgo.com/html/?${params.toString()}`;
  const res = await httpGet(url, { timeoutMs: 9000 });
  const fetchedAt = new Date().toISOString();
  if (!res.ok) {
    return { query, source: "duckduckgo", results: [], related: [], fetchedAt, ok: false, error: res.message };
  }
  const $ = cheerio.load(res.body);
  const results: SerpResult[] = [];
  $("div.result").each((_, el) => {
    const $el = $(el);
    if ($el.hasClass("result--ad") || $el.hasClass("result--ad-light")) return;
    const $a = $el.find("a.result__a").first();
    const href = $a.attr("href") ?? "";
    const url = unwrapDuckHref(href);
    if (!url || url.startsWith("javascript:")) return;
    const title = clean($a.text());
    const snippet = clean($el.find(".result__snippet").text());
    const displayUrl = clean($el.find(".result__url").text()) || url;
    if (title && url) {
      results.push({ position: results.length + 1, title, url, displayUrl, snippet });
    }
  });
  const related: string[] = [];
  $("div.related-searches a, .zci__related-searches a").each((_, el) => {
    const t = clean($(el).text());
    if (t) related.push(t);
  });
  return { query, source: "duckduckgo", results, related, fetchedAt, ok: results.length > 0, error: results.length === 0 ? "no_results" : undefined };
}

async function fetchBing(query: string): Promise<SerpFetch> {
  const url = `https://www.bing.com/search?${new URLSearchParams({ q: query, setlang: "en", form: "QBLH" }).toString()}`;
  const res = await httpGet(url, { timeoutMs: 9000 });
  const fetchedAt = new Date().toISOString();
  if (!res.ok) {
    return { query, source: "bing", results: [], related: [], fetchedAt, ok: false, error: res.message };
  }
  const $ = cheerio.load(res.body);
  const results: SerpResult[] = [];
  $("li.b_algo").each((_, el) => {
    const $el = $(el);
    const $a = $el.find("h2 a").first();
    const href = $a.attr("href") ?? "";
    if (!href || href.startsWith("javascript:")) return;
    const title = clean($a.text());
    const snippet = clean($el.find(".b_caption p, .b_lineclamp4, .b_lineclamp3, .b_lineclamp2").first().text());
    const displayUrl = clean($el.find("cite").first().text()) || href;
    if (title) results.push({ position: results.length + 1, title, url: href, displayUrl, snippet });
  });
  const related: string[] = [];
  $("#brsv3 li a, .b_rs li a").each((_, el) => {
    const t = clean($(el).text());
    if (t) related.push(t);
  });
  return { query, source: "bing", results, related, fetchedAt, ok: results.length > 0, error: results.length === 0 ? "no_results" : undefined };
}

void UA; // referenced only via shared httpGet's UA, kept for documentation

export async function fetchSerp(
  query: string,
  region: string = "us-en",
): Promise<SerpFetch> {
  const ddg = await fetchDuckDuckGo(query, region);
  if (ddg.ok) return ddg;
  return await fetchBing(query);
}

/**
 * Result-mix based intent classifier. We don't have query semantics here,
 * but the *shape* of the SERP (forums vs videos vs shopping vs official)
 * is a strong proxy for intent.
 */
export type SerpIntent = "informational" | "navigational" | "transactional" | "commercial" | "mixed";

export function classifyIntent(fetch: SerpFetch, query: string): {
  intent: SerpIntent;
  signals: { howTo: number; brand: number; commercial: number; comparison: number };
} {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/);
  const isQuestion = /^(how|what|why|when|where|who|is|can|does|do|will|should)\b/.test(q) || q.endsWith("?");
  const commercialIntent = /\b(buy|price|cheap|deal|coupon|discount|order|shop)\b/.test(q);
  const comparisonIntent = /\b(vs|versus|best|top|review|alternative)\b/.test(q);

  let howTo = 0, brand = 0, commercial = 0, comparison = 0;
  for (const r of fetch.results.slice(0, 10)) {
    const blob = `${r.title} ${r.snippet} ${r.url}`.toLowerCase();
    if (/\b(how to|tutorial|guide|step[- ]by[- ]step|wikipedia)\b/.test(blob)) howTo++;
    if (tokens.some((t) => t.length > 3 && r.url.toLowerCase().includes(t))) brand++;
    if (/\b(buy|shop|price|amazon|ebay|cart|sale)\b/.test(blob)) commercial++;
    if (/\b(vs|versus|best|top \d+|compare|review|alternative)\b/.test(blob)) comparison++;
  }

  let intent: SerpIntent = "mixed";
  if (commercialIntent || commercial >= 3) intent = "transactional";
  else if (comparisonIntent || comparison >= 3) intent = "commercial";
  else if (isQuestion || howTo >= 3) intent = "informational";
  else if (brand >= 3) intent = "navigational";

  return { intent, signals: { howTo, brand, commercial, comparison } };
}
