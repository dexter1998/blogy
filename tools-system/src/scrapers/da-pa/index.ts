import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { collectDomainSignals } from "./signals/domain";
import { collectIndexationSignals } from "./signals/indexation";
import { collectOnPageSignals } from "./signals/onpage";
import type { DaPaInput, DaPaResult, ScoreBreakdown } from "./types";
import {
  buildExplanations,
  combineScores,
  knownAuthorityFloor,
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
      authority: scoreAuthority(onPage.authority),
      spam: scoreSpam(onPage.spam),
    };

    let combined = combineScores(breakdown);

    // Floor for well-known mega-domains. We're not going to claim google.com is a 47.
    const floor = knownAuthorityFloor(domain.domain);
    if (floor !== null) {
      combined = {
        ...combined,
        da: Math.max(combined.da, floor),
        pa: Math.max(combined.pa, Math.round(floor * 0.9)),
        confidence: Math.max(combined.confidence, 95),
      };
    }

    const explanations = buildExplanations(
      breakdown,
      domain,
      indexation,
      onPage.trust,
      onPage.spam,
    );

    const result: DaPaResult = {
      url: input.url,
      domain: domain.domain,
      fetchedAt: new Date().toISOString(),
      scores: {
        da: combined.da,
        pa: combined.pa,
        spam: breakdown.spam,
        trust: combined.trust,
        confidence: combined.confidence,
      },
      metrics: {
        domainAgeYears: domain.ageYears,
        indexedPages: indexation.indexedPages,
        referringDomainsEstimate: onPage.authority.referringDomainsEstimate,
        backlinkEstimate: onPage.authority.backlinkEstimate,
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
