/**
 * Website Intelligence Engine — orchestrator scraper.
 *
 * Crawls once via the core engine, then runs every extractor against the
 * shared context. Each extractor is independently tested, independently
 * exposed via its own API endpoint, and additively composes into the
 * master `/api/v1/website-intelligence` envelope.
 *
 * No third-party SaaS APIs. All signals are derived from the site's own
 * HTML, response headers, robots.txt, sitemap.xml, and structured data.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { buildContext } from "./core/engine";
import { extractBrand } from "./extractors/brand";
import { extractMetadata } from "./extractors/metadata";
import { extractSocial } from "./extractors/social";
import { extractSitemap } from "./extractors/sitemap";
import { extractSchema } from "./extractors/schema";
import { extractInternalArchitecture } from "./extractors/internal-architecture";
import { extractFooter } from "./extractors/footer";
import { extractPayments } from "./extractors/payments";
import { extractTechStack } from "./extractors/techstack";
import { extractAnalytics } from "./extractors/analytics";
import { extractAIReadiness } from "./extractors/ai-readiness";
import { extractContent } from "./extractors/content";
import { extractSecurity } from "./extractors/security";
import { extractPerformance } from "./extractors/performance";
import { extractGeo } from "./extractors/geo";
import { extractLeadGen } from "./extractors/lead-gen";
import { extractForms } from "./extractors/forms";
import { extractCookies } from "./extractors/cookies";
import { extractAds } from "./extractors/ads";
import { extractCMS } from "./extractors/cms";
import { extractHosting } from "./extractors/hosting";
import { extractTrust } from "./extractors/trust";
import type {
  WebsiteIntelligenceInput,
  WebsiteIntelligenceResult,
} from "./types";

export const websiteIntelligenceScraper: Scraper<
  WebsiteIntelligenceInput,
  WebsiteIntelligenceResult
> = {
  name: "website-intelligence",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    try {
      return `${new URL(input.url).toString()}|d=${input.depth ?? 8}`;
    } catch {
      return null;
    }
  },

  async execute(
    input: WebsiteIntelligenceInput,
    _ctx: ScrapeContext,
  ): Promise<WebsiteIntelligenceResult> {
    const t0 = Date.now();
    let ctx;
    try {
      ctx = await buildContext(input.url, { depth: input.depth });
    } catch (e) {
      throw new ScrapeError(
        "scrape_failed",
        e instanceof Error ? e.message : "Could not crawl URL",
      );
    }

    // AI readiness fetches /llms.txt over the wire — run it in parallel with
    // the synchronous extractors to keep p50 down.
    const [aiReadiness] = await Promise.all([extractAIReadiness(ctx)]);

    const brand = extractBrand(ctx);
    const metadata = extractMetadata(ctx);
    const social = extractSocial(ctx);
    const sitemap = extractSitemap(ctx);
    const schema = extractSchema(ctx);
    const internalArchitecture = extractInternalArchitecture(ctx);
    const footer = extractFooter(ctx);
    const payments = extractPayments(ctx);
    const techStack = extractTechStack(ctx);
    const analytics = extractAnalytics(ctx);
    const content = extractContent(ctx);
    const security = extractSecurity(ctx);
    const performance = extractPerformance(ctx);
    const geo = extractGeo(ctx);
    const leadGen = extractLeadGen(ctx);
    const forms = extractForms(ctx);
    const cookies = extractCookies(ctx);
    const ads = extractAds(ctx);
    const cms = extractCMS(ctx);
    const hosting = extractHosting(ctx);
    const trust = extractTrust(ctx);

    const totals: WebsiteIntelligenceResult["totals"] = [
      { key: "brand", label: "Brand", total: countTrue(brand) },
      { key: "metadata", label: "Metadata", total: countTrue(metadata) + (metadata.hreflang.length || 0) },
      { key: "social", label: "Social", total: social.count },
      {
        key: "sitemap",
        label: "Sitemap & Robots",
        total: sitemap.totalUrls,
        hasMore: sitemap.totalUrls > sitemap.sampleUrls.length,
      },
      { key: "schema", label: "Schema", total: schema.totalItems },
      {
        key: "internalArchitecture",
        label: "Internal Architecture",
        total: internalArchitecture.uniqueInternalUrls,
        hasMore:
          internalArchitecture.uniqueInternalUrls > internalArchitecture.internalSample.length,
      },
      { key: "footer", label: "Footer", total: footer.totalLinks },
      { key: "payments", label: "Payments", total: payments.detected.length },
      {
        key: "techStack",
        label: "Tech Stack",
        total:
          techStack.frameworks.length +
          techStack.cms.length +
          techStack.hosting.length +
          techStack.cdn.length +
          techStack.buildTools.length,
      },
      { key: "analytics", label: "Analytics", total: analytics.detected.length },
      { key: "aiReadiness", label: "AI Readiness", total: aiReadinessScore(aiReadiness) },
      { key: "content", label: "Content", total: content.wordCount },
      { key: "security", label: "Security", total: securityScore(security) },
      { key: "performance", label: "Performance", total: performance.scripts },
      {
        key: "geo",
        label: "Geo / Local",
        total:
          geo.addresses.length +
          geo.cities.length +
          geo.phones.length +
          geo.emails.length +
          geo.mapLinks.length,
      },
      { key: "leadGen", label: "Lead Gen / Chat", total: leadGen.detected.length },
      { key: "forms", label: "Forms & CTAs", total: forms.totalForms },
      { key: "cookies", label: "Cookies & Consent", total: cookies.cookieBannerDetected ? 1 : 0 },
      { key: "ads", label: "Ads & Monetization", total: ads.detected.length },
      { key: "cms", label: "CMS", total: cms.cms ? 1 : 0 },
      { key: "hosting", label: "Hosting & Infra", total: (hosting.hosting ? 1 : 0) + (hosting.cdn ? 1 : 0) },
      { key: "trust", label: "Trust Signals", total: trustScore(trust) },
    ];

    return {
      input: { url: input.url },
      finalUrl: ctx.finalUrl,
      origin: ctx.origin,
      rootDomain: ctx.rootDomain,
      fetchedAt: new Date().toISOString(),
      pagesCrawled: ctx.pages.length,
      durationMs: Date.now() - t0,
      signals: {
        brand,
        metadata,
        social,
        sitemap,
        schema,
        internalArchitecture,
        footer,
        payments,
        techStack,
        analytics,
        aiReadiness,
        content,
        security,
        performance,
        geo,
        leadGen,
        forms,
        cookies,
        ads,
        cms,
        hosting,
        trust,
      },
      totals,
    };
  },
};

// ── Internal scoring helpers (just for "totals" in the UI) ─────────────────

function countTrue(o: object): number {
  let n = 0;
  for (const v of Object.values(o)) {
    if (v === true) n += 1;
    else if (typeof v === "string" && v) n += 1;
    else if (Array.isArray(v) && v.length) n += 1;
  }
  return n;
}

function aiReadinessScore(a: ReturnType<typeof extractAIReadiness> extends Promise<infer T> ? T : never): number {
  let n = 0;
  if (a.llmsTxt) n += 1;
  if (a.semanticHeadings) n += 1;
  if (a.hasFaqSchema) n += 1;
  if (a.hasArticleSchema) n += 1;
  if (a.authorEntities.length) n += 1;
  if (a.faqDepth >= 3) n += 1;
  if (a.citableBlocks >= 5) n += 1;
  return n;
}

function securityScore(s: ReturnType<typeof extractSecurity>): number {
  let n = 0;
  if (s.https) n += 1;
  if (s.hsts) n += 1;
  if (s.csp) n += 1;
  if (s.xFrameOptions) n += 1;
  if (s.xContentTypeOptions) n += 1;
  if (s.referrerPolicy) n += 1;
  if (s.permissionsPolicy) n += 1;
  if (s.cdnDetected) n += 1;
  return n;
}

function trustScore(t: ReturnType<typeof extractTrust>): number {
  let n = 0;
  if (t.hasContactPage) n += 1;
  if (t.hasAboutPage) n += 1;
  if (t.hasPrivacyPolicy) n += 1;
  if (t.hasTermsPage) n += 1;
  if (t.hasOrganizationSchema) n += 1;
  if (t.trustpilotLink) n += 1;
  if (t.g2Link) n += 1;
  if (t.capterraLink) n += 1;
  if (t.yearFounded) n += 1;
  return n;
}
