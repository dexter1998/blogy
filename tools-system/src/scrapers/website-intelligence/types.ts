/**
 * Website Intelligence Engine — public types.
 *
 * The engine crawls a site once and produces a normalised "intelligence"
 * snapshot composed of 22 signal groups. Each signal group is produced by
 * a pure extractor function and is independently consumable.
 *
 * Design goals:
 *  - structurally serialisable (clean JSON, no functions / classes)
 *  - additive: new extractors plug into `signals` without breaking callers
 *  - lossless counts: long lists are exposed as both `count` and `items`
 *    (capped) so the UI can show totals + a "view all" drilldown.
 */

export type WebsiteIntelligenceInput = {
  url: string;
  /** Bypass cache for this run. */
  fresh?: boolean;
  /** How many pages to crawl beyond the home page (default 8, max 25). */
  depth?: number;
};

// ── Per-signal shapes ───────────────────────────────────────────────────

export type BrandSignals = {
  websiteName: string | null;
  brandName: string | null;
  tagline: string | null;
  logo: string | null;
  favicon: string | null;
  themeColor: string | null;
  colorPalette: string[];
  fonts: string[];
  darkModeSupported: boolean;
};

export type MetadataSignals = {
  title: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  viewport: string | null;
  charset: string | null;
  themeColor: string | null;
  language: string | null;
  publisher: string | null;
  author: string | null;
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
  hreflang: Array<{ hreflang: string; href: string }>;
};

export type SocialSignals = {
  count: number;
  byPlatform: Record<string, string[]>;
  links: Array<{ platform: string; url: string }>;
};

export type SitemapSignals = {
  robotsTxtFound: boolean;
  robotsTxtUrl: string | null;
  disallows: string[];
  userAgents: string[];
  sitemapsDeclared: string[];
  sitemapsDiscovered: string[];
  totalUrls: number;
  truncated: boolean;
  /** Capped sample of URLs (full list available via /api/v1/sitemap). */
  sampleUrls: string[];
};

export type SchemaSignals = {
  totalItems: number;
  byFormat: { jsonLd: number; microdata: number; rdfa: number };
  detectedTypes: string[];
  typeCounts: Record<string, number>;
};

export type InternalArchitectureSignals = {
  totalInternalLinks: number;
  totalExternalLinks: number;
  uniqueInternalUrls: number;
  uniqueExternalDomains: number;
  navMenuLinks: Array<{ text: string; href: string }>;
  topAnchors: Array<{ anchor: string; count: number }>;
  pagesCrawled: number;
  internalSample: Array<{ url: string; count: number }>;
};

export type FooterSignals = {
  found: boolean;
  totalLinks: number;
  links: Array<{ text: string; href: string }>;
  detected: {
    aboutUs: boolean;
    contact: boolean;
    privacyPolicy: boolean;
    terms: boolean;
    refundPolicy: boolean;
    shippingPolicy: boolean;
    careers: boolean;
    affiliate: boolean;
    blog: boolean;
    pricing: boolean;
  };
  legalEntities: string[];
};

export type PaymentSignals = {
  detected: string[];
  evidence: Array<{ provider: string; via: string; sample: string }>;
};

export type TechStackSignals = {
  frameworks: string[];
  cms: string[];
  hosting: string[];
  cdn: string[];
  buildTools: string[];
  evidence: Array<{ tech: string; via: string; sample: string }>;
};

export type AnalyticsSignals = {
  detected: string[];
  evidence: Array<{ tool: string; via: string; sample: string }>;
};

export type AIReadinessSignals = {
  llmsTxt: boolean;
  llmsTxtUrl: string | null;
  semanticHeadings: boolean;
  faqDepth: number;
  authorEntities: string[];
  citableBlocks: number;
  hasFaqSchema: boolean;
  hasArticleSchema: boolean;
};

export type ContentSignals = {
  wordCount: number;
  language: string | null;
  headingHierarchy: { h1: number; h2: number; h3: number; h4: number };
  duplicateTitleAcrossPages: boolean;
  readingTimeMinutes: number;
  pagesAnalyzed: number;
};

export type SecuritySignals = {
  https: boolean;
  hsts: boolean;
  csp: boolean;
  xFrameOptions: string | null;
  xContentTypeOptions: string | null;
  referrerPolicy: string | null;
  permissionsPolicy: string | null;
  cdnDetected: string | null;
};

export type PerformanceSignals = {
  lazyLoadingImages: number;
  totalImages: number;
  scripts: number;
  externalScripts: number;
  inlineScripts: number;
  styles: number;
  fonts: number;
  preconnects: number;
  preloads: number;
  renderBlockingScripts: number;
};

export type GeoSignals = {
  addresses: string[];
  cities: string[];
  phones: string[];
  emails: string[];
  mapLinks: string[];
  hasLocalBusinessSchema: boolean;
};

export type AIReadinessV2 = AIReadinessSignals;

export type LeadGenSignals = {
  detected: string[];
  evidence: Array<{ tool: string; via: string; sample: string }>;
};

export type FormSignals = {
  totalForms: number;
  newsletterForms: number;
  contactForms: number;
  searchForms: number;
  popups: number;
  ctaButtons: number;
  bookingWidgets: number;
};

export type CookieSignals = {
  cookieBannerDetected: boolean;
  consentManager: string | null;
  setCookies: string[];
};

export type AdsSignals = {
  detected: string[];
  evidence: Array<{ network: string; via: string; sample: string }>;
};

export type CMSSignals = {
  cms: string | null;
  generator: string | null;
  evidence: string[];
};

export type HostingSignals = {
  hosting: string | null;
  cdn: string | null;
  server: string | null;
  poweredBy: string | null;
  evidence: Array<{ provider: string; via: string; sample: string }>;
};

export type NetworkSignals = {
  /** First A record (server IP). Null if DNS lookup fails. */
  serverIp: string | null;
  /** All A records returned. */
  allIps: string[];
  /** Authoritative NS records. */
  dnsServers: string[];
  spf: {
    present: boolean;
    /** Raw v=spf1 TXT lines, exactly as published. */
    records: string[];
  };
  dmarc: {
    present: boolean;
    /** Raw v=DMARC1 TXT lines from _dmarc.<domain>. */
    records: string[];
  };
  /** All TXT records at the root, for transparency / debugging. */
  txtRecords: string[];
};

export type PixelEvidence = {
  name:
    | "Meta Pixel"
    | "Google Ads"
    | "LinkedIn Insight"
    | "X Pixel"
    | "Pinterest Tag"
    | "TikTok Pixel"
    | "Reddit Pixel";
  /** Pixel/conversion ID when recoverable from inline script. */
  id: string | null;
};

export type PixelSignals = {
  count: number;
  detected: PixelEvidence[];
  facebookPixelDetected: boolean;
  facebookPixelId: string | null;
};

export type YouTubeSignals = {
  linked: boolean;
  channelUrl: string | null;
  subscribers: number | null;
  subscribersText: string | null;
  totalViews: number | null;
  totalViewsText: string | null;
};

export type TrustSignals = {
  hasContactPage: boolean;
  hasAboutPage: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsPage: boolean;
  hasOrganizationSchema: boolean;
  trustpilotLink: string | null;
  g2Link: string | null;
  capterraLink: string | null;
  yearFounded: number | null;
};

// ── Master result envelope ──────────────────────────────────────────────

export type WebsiteIntelligenceResult = {
  input: { url: string };
  finalUrl: string;
  origin: string;
  rootDomain: string;
  fetchedAt: string;
  pagesCrawled: number;
  durationMs: number;
  /** Per-signal extractor outputs. */
  signals: {
    brand: BrandSignals;
    metadata: MetadataSignals;
    social: SocialSignals;
    sitemap: SitemapSignals;
    schema: SchemaSignals;
    internalArchitecture: InternalArchitectureSignals;
    footer: FooterSignals;
    payments: PaymentSignals;
    techStack: TechStackSignals;
    analytics: AnalyticsSignals;
    aiReadiness: AIReadinessSignals;
    content: ContentSignals;
    security: SecuritySignals;
    performance: PerformanceSignals;
    geo: GeoSignals;
    leadGen: LeadGenSignals;
    forms: FormSignals;
    cookies: CookieSignals;
    ads: AdsSignals;
    cms: CMSSignals;
    hosting: HostingSignals;
    trust: TrustSignals;
    network: NetworkSignals;
    pixels: PixelSignals;
    youtube: YouTubeSignals;
  };
  /** High-level totals indexed by signal name; UI uses this to render
   * the table-of-contents accordion. */
  totals: Array<{ key: string; label: string; total: number; hasMore?: boolean }>;
};
