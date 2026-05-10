/**
 * People-Also-Ask scraper.
 *
 * Routes through the shared search runner so we get:
 *   - real PAA blocks from Google/Bing/Yahoo when available
 *   - question-shaped related searches from any engine
 *   - synthetic expansion seeds (clearly labelled `engine="expansion"`)
 *   - recursive expansion when `depth > 1`
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_ENGINE_IDS,
  harvestPaa,
} from "@/scrapers/_shared/search";
import type { PaaInput, PaaResult } from "./types";

export const paaScraper: Scraper<PaaInput, PaaResult> = {
  name: "paa",
  cacheTtlSeconds: Math.min(env.cacheTtlSeconds, 1800),

  cacheKey(input) {
    if (input.fresh) return null;
    const country = (input.country ?? DEFAULT_COUNTRY_CODE).toUpperCase();
    const engines = (input.engines && input.engines.length > 0
      ? [...input.engines]
      : DEFAULT_ENGINE_IDS
    )
      .slice()
      .sort()
      .join(",");
    const depth = input.depth ?? 1;
    const limit = input.limit ?? 25;
    return `${country}:${engines}:${depth}:${limit}:${input.query.trim().toLowerCase()}`;
  },

  async execute(input, ctx: ScrapeContext): Promise<PaaResult> {
    const harvested = await harvestPaa({
      query: input.query,
      country: input.country,
      engines: input.engines,
      limit: input.limit,
      depth: input.depth,
      includeSeeds: input.includeSeeds,
      ...(ctx.signal ? { signal: ctx.signal } : {}),
    });

    return {
      query: harvested.query,
      country: harvested.country,
      language: harvested.language,
      fetchedAt: new Date().toISOString(),
      totalQuestions: harvested.total,
      depth: harvested.depth,
      questions: harvested.questions,
      byEngine: harvested.byEngine,
      byClassification: harvested.byClassification,
    };
  },
};
