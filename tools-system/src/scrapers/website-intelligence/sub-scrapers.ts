/**
 * Per-signal sub-scrapers. Each one shares the same crawl primitive as the
 * orchestrator (one fetch → many extractors), but only runs one extractor.
 *
 * Used by the per-signal API endpoints under /api/v1/website-intelligence/*.
 * Each sub-scraper is independently cache-keyed.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { buildContext, type IntelligenceContext } from "./core/engine";
import { extractBrand } from "./extractors/brand";
import { extractMetadata } from "./extractors/metadata";
import { extractSocial } from "./extractors/social";
import { extractFooter } from "./extractors/footer";
import { extractPayments } from "./extractors/payments";
import { extractTechStack } from "./extractors/techstack";
import { extractAnalytics } from "./extractors/analytics";
import type {
  AnalyticsSignals,
  BrandSignals,
  FooterSignals,
  MetadataSignals,
  PaymentSignals,
  SocialSignals,
  TechStackSignals,
} from "./types";

export type SubInput = {
  url: string;
  fresh?: boolean;
  depth?: number;
};

export type SubEnvelope<O> = {
  finalUrl: string;
  fetchedAt: string;
  signal: O;
};

function makeSubScraper<O>(
  name: string,
  extractor: (ctx: IntelligenceContext) => O | Promise<O>,
): Scraper<SubInput, SubEnvelope<O>> {
  return {
    name,
    cacheTtlSeconds: env.cacheTtlSeconds,
    cacheKey(input) {
      if (input.fresh) return null;
      try {
        return `${new URL(input.url).toString()}|d=${input.depth ?? 4}`;
      } catch {
        return null;
      }
    },
    async execute(input, _ctx: ScrapeContext): Promise<SubEnvelope<O>> {
      try {
        const ctx = await buildContext(input.url, { depth: input.depth ?? 4 });
        const signal = await extractor(ctx);
        return {
          finalUrl: ctx.finalUrl,
          fetchedAt: new Date().toISOString(),
          signal,
        };
      } catch (e) {
        throw new ScrapeError(
          "scrape_failed",
          e instanceof Error ? e.message : "Could not crawl URL",
        );
      }
    },
  };
}

export const brandSubScraper = makeSubScraper<BrandSignals>("wi-brand", extractBrand);
export const metadataSubScraper = makeSubScraper<MetadataSignals>("wi-metadata", extractMetadata);
export const socialSubScraper = makeSubScraper<SocialSignals>("wi-social", extractSocial);
export const footerSubScraper = makeSubScraper<FooterSignals>("wi-footer", extractFooter);
export const paymentsSubScraper = makeSubScraper<PaymentSignals>("wi-payments", extractPayments);
export const techStackSubScraper = makeSubScraper<TechStackSignals>("wi-techstack", extractTechStack);
export const analyticsSubScraper = makeSubScraper<AnalyticsSignals>("wi-analytics", extractAnalytics);
