/**
 * On-page metadata provider. Fetches the page once and extracts the full
 * shape we need for content + trust + spam scoring. Cached per URL.
 */

import * as cheerio from "cheerio";
import { httpGet } from "@/scrapers/_shared/http";
import { cache } from "@/lib/cache";
import { timed } from "@/providers/_shared/cached-fetch";
import type { PageMetadata } from "./types";

export type { PageMetadata } from "./types";

const SOCIAL_HOSTS = [
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "instagram.com",
  "youtube.com",
  "github.com",
  "tiktok.com",
];

const CACHE_TTL = 30 * 60;

function emptyMetadata(status: number | null): PageMetadata {
  return {
    reachable: false,
    statusCode: status,
    finalUrl: null,
    titleLength: null,
    metaDescriptionLength: null,
    h1Count: 0,
    internalLinks: 0,
    externalLinks: 0,
    externalHosts: [],
    socialProfiles: [],
    emptyAnchorRatio: 0,
    outboundLinkRatio: 0,
    wordCount: 0,
    hasFavicon: false,
    hasViewport: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    language: null,
    hasPrivacyPolicy: false,
    hasContactPage: false,
    hasAboutPage: false,
    brandConsistency: 0,
    rawHtmlSnippetLength: 0,
  };
}

export type MetadataReading = {
  source: string;
  data: PageMetadata;
  tookMs: number;
  rawHtml?: string;
};

export async function fetchPageMetadata(
  url: string,
  opts: { keepRaw?: boolean } = {},
): Promise<MetadataReading> {
  const key = `provider:metadata:${url}`;
  if (!opts.keepRaw) {
    const hit = await cache.get<MetadataReading>(key);
    if (hit) return hit;
  }

  const { value, tookMs } = await timed(async () => {
    const res = await httpGet(url, { maxRedirects: 5 });
    if (!res.ok) {
      return {
        data: emptyMetadata(res.status ?? null),
        rawHtml: undefined as string | undefined,
      };
    }
    const $ = cheerio.load(res.body);
    const origin = new URL(res.finalUrl).origin;
    // Treat same registrable-domain links (e.g. en.wikipedia.org from
    // wikipedia.org) as internal. Without this, sites that link out to
    // their own subdomains look like 100% outbound and trigger spam rules.
    const apexHost = new URL(res.finalUrl).hostname.replace(/^www\./, "");
    const apexBase = apexHost.split(".").slice(-2).join(".");
    const text = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = text ? text.split(" ").length : 0;

    const links = $("a[href]").toArray();
    let internal = 0;
    let external = 0;
    let emptyAnchor = 0;
    const externalHosts = new Set<string>();
    const social = new Set<string>();
    const internalPaths = new Set<string>();

    for (const el of links) {
      const href = ($(el).attr("href") ?? "").trim();
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) continue;
      const anchor = $(el).text().trim();
      if (!anchor) emptyAnchor += 1;
      let abs: URL;
      try {
        abs = new URL(href, origin);
      } catch {
        continue;
      }
      const linkHost = abs.hostname.replace(/^www\./, "");
      const linkApex = linkHost.split(".").slice(-2).join(".");
      const isInternal = abs.origin === origin || linkApex === apexBase;
      if (isInternal) {
        internal += 1;
        internalPaths.add(abs.pathname.toLowerCase());
      } else {
        external += 1;
        externalHosts.add(abs.hostname);
        if (SOCIAL_HOSTS.some((h) => linkHost === h || linkHost.endsWith(`.${h}`))) {
          social.add(linkHost);
        }
      }
    }

    const totalLinks = internal + external;
    const has = (...needles: string[]) =>
      Array.from(internalPaths).some((p) => needles.some((n) => p.includes(n)));

    const brand = new URL(res.finalUrl).hostname
      .replace(/^www\./, "")
      .split(".")[0]!
      .toLowerCase();
    const titleHasBrand = $("title").text().toLowerCase().includes(brand);
    const ogHasBrand = ($('meta[property="og:site_name"]').attr("content") ?? "")
      .toLowerCase()
      .includes(brand);
    const brandConsistency = (titleHasBrand ? 0.5 : 0) + (ogHasBrand ? 0.5 : 0);

    const data: PageMetadata = {
      reachable: true,
      statusCode: res.status,
      finalUrl: res.finalUrl,
      titleLength: ($("title").first().text() ?? "").trim().length || null,
      metaDescriptionLength:
        ($('meta[name="description"]').attr("content") ?? "").trim().length || null,
      h1Count: $("h1").length,
      internalLinks: internal,
      externalLinks: external,
      externalHosts: Array.from(externalHosts),
      socialProfiles: Array.from(social),
      emptyAnchorRatio: totalLinks ? Math.round((emptyAnchor / totalLinks) * 100) / 100 : 0,
      outboundLinkRatio: totalLinks ? Math.round((external / totalLinks) * 100) / 100 : 0,
      wordCount,
      hasFavicon:
        $('link[rel~="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0,
      hasViewport: $('meta[name="viewport"]').length > 0,
      hasOpenGraph: $('meta[property^="og:"]').length > 0,
      hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
      language: $("html").attr("lang") ?? null,
      hasPrivacyPolicy: has("privacy", "privacidad", "datenschutz"),
      hasContactPage: has("contact", "contacto", "kontakt"),
      hasAboutPage: has("about", "about-us", "company", "team"),
      brandConsistency,
      rawHtmlSnippetLength: res.body.length,
    };

    return { data, rawHtml: opts.keepRaw ? res.body : undefined };
  });

  const reading: MetadataReading = {
    source: "fetch+cheerio",
    data: value.data,
    tookMs,
    rawHtml: value.rawHtml,
  };
  if (!opts.keepRaw && reading.data.reachable) {
    await cache.set(key, { ...reading, rawHtml: undefined }, CACHE_TTL);
  }
  return reading;
}
