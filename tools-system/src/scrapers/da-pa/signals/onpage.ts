import * as cheerio from "cheerio";
import { httpGet } from "@/scrapers/_shared/http";
import type {
  AuthoritySignals,
  ContentSignals,
  SpamSignals,
  TrustSignals,
} from "@/scrapers/da-pa/types";

const SUSPICIOUS_KEYWORDS = [
  "viagra",
  "casino",
  "porn",
  "escort",
  "loan-now",
  "buy-followers",
  "free-iphone",
];

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

export type OnPageBundle = {
  content: ContentSignals;
  trust: TrustSignals;
  authority: AuthoritySignals;
  spam: SpamSignals;
  redirectChainLength: number;
};

export async function collectOnPageSignals(
  url: string,
): Promise<OnPageBundle> {
  const res = await httpGet(url, { maxRedirects: 5 });

  if (!res.ok) {
    return {
      content: emptyContent(res.status ?? null),
      trust: emptyTrust(),
      authority: emptyAuthority(),
      spam: emptySpam(),
      redirectChainLength: 0,
    };
  }

  const $ = cheerio.load(res.body);
  const origin = new URL(res.finalUrl).origin;
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").length : 0;

  const links = $("a[href]").toArray();
  let internal = 0;
  let external = 0;
  let emptyAnchor = 0;
  const externalHosts = new Set<string>();
  const social = new Set<string>();

  for (const el of links) {
    const href = ($(el).attr("href") ?? "").trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) continue;
    const anchor = $(el).text().trim();
    if (!anchor) emptyAnchor += 1;
    let absolute: URL;
    try {
      absolute = new URL(href, origin);
    } catch {
      continue;
    }
    if (absolute.origin === origin) {
      internal += 1;
    } else {
      external += 1;
      externalHosts.add(absolute.hostname);
      const stripped = absolute.hostname.replace(/^www\./, "");
      if (SOCIAL_HOSTS.some((h) => stripped === h || stripped.endsWith(`.${h}`))) {
        social.add(stripped);
      }
    }
  }

  const totalLinks = internal + external;
  const outboundLinkRatio = totalLinks ? external / totalLinks : 0;
  const emptyAnchorRatio = totalLinks ? emptyAnchor / totalLinks : 0;

  const lowerHtml = res.body.toLowerCase();
  const suspiciousKeywordHits = SUSPICIOUS_KEYWORDS.reduce(
    (acc, k) => acc + (lowerHtml.includes(k) ? 1 : 0),
    0,
  );

  const internalHrefs = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") ?? "").trim();
    if (!href) return;
    try {
      const u = new URL(href, origin);
      if (u.origin === origin) internalHrefs.add(u.pathname.toLowerCase());
    } catch {
      /* ignore */
    }
  });
  const has = (...needles: string[]) =>
    Array.from(internalHrefs).some((p) => needles.some((n) => p.includes(n)));

  const trust: TrustSignals = {
    hasPrivacyPolicy: has("privacy", "privacidad", "datenschutz"),
    hasContactPage: has("contact", "contacto", "kontakt"),
    hasAboutPage: has("about", "about-us", "company", "team"),
    hasSchemaOrg:
      $('script[type="application/ld+json"]').length > 0 ||
      /itemtype=["']https?:\/\/schema\.org/i.test(res.body),
    hasOpenGraph: $('meta[property^="og:"]').length > 0,
    socialProfiles: Array.from(social),
  };

  const content: ContentSignals = {
    reachable: true,
    statusCode: res.status,
    titleLength: ($("title").first().text() ?? "").trim().length || null,
    metaDescriptionLength:
      ($('meta[name="description"]').attr("content") ?? "").trim().length || null,
    h1Count: $("h1").length,
    internalLinks: internal,
    externalLinks: external,
    wordCount,
    hasFavicon:
      $('link[rel~="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0,
    hasViewport: $('meta[name="viewport"]').length > 0,
    language: $("html").attr("lang") ?? null,
  };

  const brandFromDomain = new URL(res.finalUrl).hostname
    .replace(/^www\./, "")
    .split(".")[0]!
    .toLowerCase();
  const titleHasBrand = $("title")
    .text()
    .toLowerCase()
    .includes(brandFromDomain);
  const ogHasBrand = ($('meta[property="og:site_name"]').attr("content") ?? "")
    .toLowerCase()
    .includes(brandFromDomain);
  const brandConsistency = (titleHasBrand ? 0.5 : 0) + (ogHasBrand ? 0.5 : 0);

  const authority: AuthoritySignals = {
    /**
     * Coarse referring-domain estimate: number of distinct *external* hosts the
     * homepage links *out* to is a proxy for how "connected" the site is to
     * the wider web. It correlates loosely with link-graph centrality without
     * requiring a paid backlink API. Banded so we don't pretend to be precise.
     */
    referringDomainsEstimate: bandify(externalHosts.size * 6),
    backlinkEstimate: bandify(externalHosts.size * 18),
    brandConsistency,
  };

  const spam: SpamSignals = {
    outboundLinkRatio: round(outboundLinkRatio, 2),
    emptyAnchorRatio: round(emptyAnchorRatio, 2),
    redirectChainLength: 0,
    suspiciousKeywordHits,
  };

  return { content, trust, authority, spam, redirectChainLength: 0 };
}

function bandify(raw: number): number | null {
  if (!Number.isFinite(raw) || raw < 0) return null;
  if (raw < 5) return Math.max(0, Math.round(raw));
  if (raw < 50) return Math.round(raw / 5) * 5;
  if (raw < 500) return Math.round(raw / 25) * 25;
  if (raw < 5_000) return Math.round(raw / 100) * 100;
  return Math.round(raw / 1000) * 1000;
}

function round(n: number, p: number): number {
  const f = 10 ** p;
  return Math.round(n * f) / f;
}

function emptyContent(status: number | null): ContentSignals {
  return {
    reachable: false,
    statusCode: status,
    titleLength: null,
    metaDescriptionLength: null,
    h1Count: 0,
    internalLinks: 0,
    externalLinks: 0,
    wordCount: 0,
    hasFavicon: false,
    hasViewport: false,
    language: null,
  };
}
function emptyTrust(): TrustSignals {
  return {
    hasPrivacyPolicy: false,
    hasContactPage: false,
    hasAboutPage: false,
    hasSchemaOrg: false,
    hasOpenGraph: false,
    socialProfiles: [],
  };
}
function emptyAuthority(): AuthoritySignals {
  return { referringDomainsEstimate: null, backlinkEstimate: null, brandConsistency: 0 };
}
function emptySpam(): SpamSignals {
  return {
    outboundLinkRatio: 0,
    emptyAnchorRatio: 0,
    redirectChainLength: 0,
    suspiciousKeywordHits: 0,
  };
}
