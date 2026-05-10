import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { collectDomainSignals } from "./signals/domain";
import { collectIndexationSignals } from "./signals/indexation";
import { collectOnPageSignals } from "./signals/onpage";
import type { DaPaInput, DaPaResult, ScoreBreakdown } from "./types";
import {
  buildExplanations,
  combineScores,
  scoreAuthority,
  scoreContent,
  scoreDomain,
  scoreIndexation,
  scoreSpam,
  scoreTrust,
} from "@/scoring/da-pa";

export const daPaScraper: Scraper<DaPaInput, DaPaResult> = {
  name: "da-pa",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input: DaPaInput): string | null {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input: DaPaInput, _ctx: ScrapeContext): Promise<DaPaResult> {
    const u = new URL(input.url);
    const origin = `${u.protocol}//${u.host}`;

    const [domain, indexation, onPage] = await Promise.all([
      collectDomainSignals(input.url),
      collectIndexationSignals(origin),
      collectOnPageSignals(input.url),
    ]);

    const breakdown: ScoreBreakdown = {
      domain: scoreDomain(domain),
      indexation: scoreIndexation(indexation),
      content: scoreContent(onPage.content),
      trust: scoreTrust(onPage.trust),
      authority: scoreAuthority(onPage.authority, domain, indexation),
      spam: scoreSpam(onPage.spam, onPage.content, onPage.trust),
    };

    const combined = combineScores(breakdown);

    const explanations = buildExplanations(
      breakdown,
      domain,
      indexation,
      onPage.trust,
      onPage.spam,
      onPage.authority,
    );

    const result: DaPaResult = {
      url: input.url,
      domain: domain.domain,
      fetchedAt: new Date().toISOString(),
      scores: {
        authorityScore: combined.authorityScore,
        pageStrength: combined.pageStrength,
        domainStrength: combined.domainStrength,
        urlStrength: combined.urlStrength,
        spamScore: combined.spamScore,
        stabilityScore: combined.stabilityScore,
        trust: combined.trust,
        confidence: combined.confidence,
        // Legacy aliases (deprecated). Removed in a future version.
        da: combined.authorityScore,
        pa: combined.pageStrength,
        dr: combined.domainStrength,
        ur: combined.urlStrength,
        ss: combined.spamScore,
        st: combined.stabilityScore,
      },
      metrics: {
        domainAgeYears: domain.ageYears,
        indexedPages: indexation.indexedPages,
        pageRank01: onPage.authority.pageRank01,
        referringCaptures: onPage.authority.refDomainsObserved,
        https: domain.https,
      },
      signals: {
        domain,
        indexation,
        content: onPage.content,
        trust: onPage.trust,
        authority: onPage.authority,
        spam: onPage.spam,
      },
      explanations,
    };

    if (input.debug) result.breakdown = breakdown;

    return result;
  },
};
