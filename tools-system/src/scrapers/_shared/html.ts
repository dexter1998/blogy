/**
 * Shared HTML loading + extraction helpers used by every HTML-based scraper.
 *
 * Centralised so Cheerio quirks (default decode, attr fallbacks) are handled
 * once, and so individual scrapers stay focused on their own scoring logic.
 */

import * as cheerio from "cheerio";
import { httpGet, type HttpResult } from "./http";

export type LoadedPage = {
  url: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  html: string;
  $: cheerio.CheerioAPI;
};

export type LoadResult =
  | { ok: true; page: LoadedPage }
  | { ok: false; status: number | null; error: string };

export async function loadPage(
  url: string,
  opts: { timeoutMs?: number } = {},
): Promise<LoadResult> {
  const res = await httpGet(url, opts);
  return wrapHttpResult(url, res);
}

export function wrapHttpResult(url: string, res: HttpResult): LoadResult {
  if (!res.ok) {
    return { ok: false, status: res.status, error: res.message };
  }
  return {
    ok: true,
    page: {
      url,
      finalUrl: res.finalUrl,
      status: res.status,
      headers: res.headers,
      html: res.body,
      $: cheerio.load(res.body),
    },
  };
}

export function attr($: cheerio.CheerioAPI, sel: string, name = "content"): string | null {
  const v = $(sel).first().attr(name);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function metaContent(
  $: cheerio.CheerioAPI,
  selector: string,
): string | null {
  return attr($, selector, "content");
}

export function absoluteUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export function visibleText($: cheerio.CheerioAPI): string {
  $("script,style,noscript,template").remove();
  return ($("body").text() ?? "").replace(/\s+/g, " ").trim();
}

export function wordCount(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function originOf(url: string): string {
  const u = new URL(url);
  return `${u.protocol}//${u.host}`;
}
