import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { MetadataSignals } from "../types";

function absUrl(base: string, href: string | undefined | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export function extractMetadata(ctx: IntelligenceContext): MetadataSignals {
  const page = homePage(ctx);
  const $ = page.$;
  const finalUrl = page.finalUrl;

  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const k = ($(el).attr("property") ?? "").trim();
    const v = ($(el).attr("content") ?? "").trim();
    if (k && v) og[k] = v;
  });
  const tw: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const k = ($(el).attr("name") ?? "").trim();
    const v = ($(el).attr("content") ?? "").trim();
    if (k && v) tw[k] = v;
  });

  const hreflang: MetadataSignals["hreflang"] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr("hreflang");
    const href = $(el).attr("href");
    const abs = absUrl(finalUrl, href);
    if (lang && abs) hreflang.push({ hreflang: lang, href: abs });
  });

  const title = ($("title").first().text() ?? "").trim() || null;

  return {
    title,
    metaTitle: title,
    metaDescription: $('meta[name="description"]').attr("content")?.trim() || null,
    canonical: absUrl(finalUrl, $('link[rel="canonical"]').attr("href")),
    robots: $('meta[name="robots"]').attr("content")?.trim() || null,
    viewport: $('meta[name="viewport"]').attr("content")?.trim() || null,
    charset:
      $("meta[charset]").attr("charset") ||
      ($('meta[http-equiv="Content-Type"]').attr("content") ?? "")
        .match(/charset=([\w-]+)/i)?.[1] ||
      null,
    themeColor: $('meta[name="theme-color"]').attr("content")?.trim() || null,
    language: $("html").attr("lang")?.trim() || null,
    publisher:
      $('meta[property="article:publisher"]').attr("content")?.trim() ||
      $('meta[name="publisher"]').attr("content")?.trim() ||
      null,
    author:
      $('meta[name="author"]').attr("content")?.trim() ||
      $('meta[property="article:author"]').attr("content")?.trim() ||
      null,
    openGraph: og,
    twitter: tw,
    hreflang,
  };
}
