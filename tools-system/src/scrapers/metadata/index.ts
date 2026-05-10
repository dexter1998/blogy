import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { absoluteUrl, loadPage, metaContent } from "@/scrapers/_shared/html";
import { scoreMetadata } from "@/scoring/metadata";
import type { Hreflang, MetadataInput, MetadataResult } from "./types";

export const metadataScraper: Scraper<MetadataInput, MetadataResult> = {
  name: "metadata",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<MetadataResult> {
    const loaded = await loadPage(input.url);
    if (!loaded.ok) {
      throw new ScrapeError("scrape_failed", `Could not fetch URL: ${loaded.error}`);
    }
    const { $, finalUrl, status } = loaded.page;

    const title = ($("title").first().text() ?? "").trim() || null;
    const description = metaContent($, 'meta[name="description"]');
    const canonical = $('link[rel="canonical"]').attr("href")?.trim()
      ? absoluteUrl(finalUrl, $('link[rel="canonical"]').attr("href")!.trim())
      : null;
    const robots = metaContent($, 'meta[name="robots"]');
    const viewport = metaContent($, 'meta[name="viewport"]');
    const themeColor = metaContent($, 'meta[name="theme-color"]');
    const charset =
      $("meta[charset]").attr("charset") ??
      (metaContent($, 'meta[http-equiv="Content-Type"]') ?? "")
        .match(/charset=([\w-]+)/i)?.[1] ??
      null;
    const language = $("html").attr("lang")?.trim() || null;
    const favicon = (() => {
      const cand =
        $('link[rel~="icon"]').attr("href") ??
        $('link[rel="shortcut icon"]').attr("href") ??
        null;
      return cand ? absoluteUrl(finalUrl, cand) : null;
    })();

    const ogImage = metaContent($, 'meta[property="og:image"]');
    const twitterImage = metaContent($, 'meta[name="twitter:image"]');

    const hreflang: Hreflang[] = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const $el = $(el);
      const lang = $el.attr("hreflang");
      const href = $el.attr("href");
      if (lang && href) {
        const abs = absoluteUrl(finalUrl, href);
        if (abs) hreflang.push({ hreflang: lang, href: abs });
      }
    });

    const h1 = $("h1")
      .map((_, el) => ($(el).text() ?? "").trim())
      .get()
      .filter(Boolean);

    const result: MetadataResult = {
      url: input.url,
      finalUrl,
      status,
      fetchedAt: new Date().toISOString(),
      basic: {
        title,
        titleLength: title ? title.length : null,
        description,
        descriptionLength: description ? description.length : null,
        canonical,
        robots,
        viewport,
        charset,
        language,
        favicon,
        themeColor,
      },
      openGraph: {
        title: metaContent($, 'meta[property="og:title"]'),
        description: metaContent($, 'meta[property="og:description"]'),
        image: ogImage ? absoluteUrl(finalUrl, ogImage) : null,
        url: metaContent($, 'meta[property="og:url"]'),
        siteName: metaContent($, 'meta[property="og:site_name"]'),
        type: metaContent($, 'meta[property="og:type"]'),
        locale: metaContent($, 'meta[property="og:locale"]'),
      },
      twitter: {
        card: metaContent($, 'meta[name="twitter:card"]'),
        title: metaContent($, 'meta[name="twitter:title"]'),
        description: metaContent($, 'meta[name="twitter:description"]'),
        image: twitterImage ? absoluteUrl(finalUrl, twitterImage) : null,
        site: metaContent($, 'meta[name="twitter:site"]'),
        creator: metaContent($, 'meta[name="twitter:creator"]'),
      },
      hreflang,
      headings: {
        h1,
        h2Count: $("h2").length,
        h3Count: $("h3").length,
      },
      scores: { overall: 0, basic: 0, social: 0, international: 0 },
      issues: [],
    };

    const scored = scoreMetadata(result);
    result.scores = scored.scores;
    result.issues = scored.issues;
    return result;
  },
};
