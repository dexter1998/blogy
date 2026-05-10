/**
 * Single-page on-page bundle. Pulls page metadata once via the
 * /providers/metadata module, layers in schema-extraction from the same
 * HTML, and combines with the backlink-footprint reading (OpenPageRank +
 * Common Crawl) to populate the AuthoritySignals.
 */

import { fetchPageMetadata, extractSchema, fetchBacklinkFootprint } from "@/providers";
import type {
  AuthoritySignals,
  ContentSignals,
  SpamSignals,
  TrustSignals,
} from "@/scrapers/da-pa/types";

const SUSPICIOUS_KEYWORDS = [
  "viagra",
  "cialis",
  "casino",
  "online-casino",
  "porn",
  "escort",
  "loan-now",
  "payday-loan",
  "buy-followers",
  "buy-backlinks",
  "free-iphone",
  "click-here-to-win",
  "replica-watch",
  "essay-writing-service",
  "guest-post-service",
];

export type OnPageBundle = {
  content: ContentSignals;
  trust: TrustSignals;
  authority: AuthoritySignals;
  spam: SpamSignals;
  redirectChainLength: number;
};

export async function collectOnPageSignals(url: string): Promise<OnPageBundle> {
  const meta = await fetchPageMetadata(url, { keepRaw: true });
  const m = meta.data;
  // Fall back to the requested URL's hostname when the page itself was
  // unreachable — many sites (justdial, etc.) block bot UAs entirely yet
  // still appear in OPR / Common Crawl. We must still fetch backlink
  // signals so authority isn't wrongly zeroed for those domains.
  const host = (
    m.finalUrl ? new URL(m.finalUrl).hostname : new URL(url).hostname
  ).replace(/^www\./, "");

  if (!m.reachable) {
    // Backlink-footprint providers don't need our HTML — fetch them anyway.
    const footprint = await fetchBacklinkFootprint(host);
    return {
      content: emptyContent(m.statusCode),
      trust: emptyTrust(),
      authority: {
        pageRank01: footprint.data.pageRank01,
        refDomainsObserved: footprint.data.refDomainsObserved,
        linkSamplesObserved: footprint.data.linkSamplesObserved,
        outboundHostDiversity: null,
        brandConsistency: 0,
        providers: footprint.sources,
      },
      spam: emptySpam(),
      redirectChainLength: 0,
    };
  }

  const schema = meta.rawHtml
    ? extractSchema(meta.rawHtml)
    : { jsonLdCount: 0, microdataCount: 0, detectedTypes: [], hasOrganization: false, hasWebSite: false, hasBreadcrumb: false };

  const footprint = host
    ? await fetchBacklinkFootprint(host)
    : { data: { refDomainsObserved: null, linkSamplesObserved: null, pageRank01: null, confidence: 0 }, sources: [] };

  const lowerHtml = meta.rawHtml ? meta.rawHtml.toLowerCase() : "";
  const suspiciousKeywordHits = SUSPICIOUS_KEYWORDS.reduce(
    (acc, k) => acc + (lowerHtml.includes(k) ? 1 : 0),
    0,
  );

  const content: ContentSignals = {
    reachable: true,
    statusCode: m.statusCode,
    titleLength: m.titleLength,
    metaDescriptionLength: m.metaDescriptionLength,
    h1Count: m.h1Count,
    internalLinks: m.internalLinks,
    externalLinks: m.externalLinks,
    wordCount: m.wordCount,
    hasFavicon: m.hasFavicon,
    hasViewport: m.hasViewport,
    language: m.language,
  };

  const trust: TrustSignals = {
    hasPrivacyPolicy: m.hasPrivacyPolicy,
    hasContactPage: m.hasContactPage,
    hasAboutPage: m.hasAboutPage,
    hasSchemaOrg: schema.jsonLdCount + schema.microdataCount > 0,
    hasOpenGraph: m.hasOpenGraph,
    socialProfiles: m.socialProfiles,
    schemaTypes: schema.detectedTypes.length,
    hasOrganizationSchema: schema.hasOrganization,
  };

  const authority: AuthoritySignals = {
    pageRank01: footprint.data.pageRank01,
    refDomainsObserved: footprint.data.refDomainsObserved,
    linkSamplesObserved: footprint.data.linkSamplesObserved,
    outboundHostDiversity: m.externalHosts.length,
    brandConsistency: m.brandConsistency,
    providers: footprint.sources,
  };

  const spam: SpamSignals = {
    outboundLinkRatio: m.outboundLinkRatio,
    emptyAnchorRatio: m.emptyAnchorRatio,
    redirectChainLength: 0,
    suspiciousKeywordHits,
  };

  return { content, trust, authority, spam, redirectChainLength: 0 };
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
    schemaTypes: 0,
    hasOrganizationSchema: false,
  };
}
function emptyAuthority(): AuthoritySignals {
  return {
    pageRank01: null,
    refDomainsObserved: null,
    linkSamplesObserved: null,
    outboundHostDiversity: null,
    brandConsistency: 0,
    providers: [],
  };
}
function emptySpam(): SpamSignals {
  return {
    outboundLinkRatio: 0,
    emptyAnchorRatio: 0,
    redirectChainLength: 0,
    suspiciousKeywordHits: 0,
  };
}
