/**
 * DA/PA scoring engine.
 *
 * Pure functions: signals → scores. No I/O, no scraping, no caching.
 * Deterministic for the same input — that's the "stable" requirement.
 *
 * Each sub-score is normalised to 0–100, then combined into DA/PA via weights.
 * DA reflects whole-domain authority, PA reflects single-page authority.
 *
 * The spec is explicit: do not fake Moz precision. We aim for *believable
 * relative ordering* — google.com way ahead of a 2-month-old blog ahead of
 * a spammy doorway page. Absolute numbers are intentionally conservative.
 */

import type {
  AuthoritySignals,
  ContentSignals,
  DomainSignals,
  IndexationSignals,
  ScoreBreakdown,
  SpamSignals,
  TrustSignals,
} from "@/scrapers/da-pa/types";
import { tldQuality } from "@/scrapers/da-pa/signals/domain";

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const HIGH_AUTHORITY_DOMAINS: Record<string, number> = {
  "google.com": 100,
  "youtube.com": 100,
  "facebook.com": 99,
  "wikipedia.org": 98,
  "twitter.com": 97,
  "x.com": 97,
  "linkedin.com": 98,
  "github.com": 96,
  "amazon.com": 99,
  "apple.com": 98,
  "microsoft.com": 99,
  "openai.com": 94,
  "anthropic.com": 90,
  "medium.com": 92,
  "reddit.com": 96,
  "stackoverflow.com": 95,
};

export function knownAuthorityFloor(domain: string): number | null {
  const stripped = domain.replace(/^www\./, "");
  return HIGH_AUTHORITY_DOMAINS[stripped] ?? null;
}

export function scoreDomain(d: DomainSignals): number {
  let s = 0;
  // Domain age — log scale, plateaus at ~15 years
  if (d.ageYears !== null) {
    s += Math.min(40, Math.log10(d.ageYears + 1) * 30);
  }
  // TLD quality
  s += tldQuality(d.tld) * 20;
  // HTTPS is table stakes in 2025
  if (d.https) s += 15;
  // DNS hygiene
  if (d.dnsHealthy) s += 10;
  if (d.hasMx) s += 8;
  if (d.hasSpf) s += 7;
  return clamp(s);
}

export function scoreIndexation(i: IndexationSignals): number {
  let s = 0;
  if (i.hasRobotsTxt) s += 15;
  if (i.hasSitemap) s += 25;
  if (i.robotsAllowsAll) s += 10;
  if (i.indexedPages !== null) {
    s += Math.min(50, Math.log10(i.indexedPages + 1) * 18);
  }
  return clamp(s);
}

export function scoreContent(c: ContentSignals): number {
  if (!c.reachable) return 0;
  let s = 25; // base for reachable

  if (c.titleLength !== null && c.titleLength >= 10 && c.titleLength <= 70) s += 10;
  if (
    c.metaDescriptionLength !== null &&
    c.metaDescriptionLength >= 50 &&
    c.metaDescriptionLength <= 170
  )
    s += 10;
  if (c.h1Count >= 1 && c.h1Count <= 2) s += 8;
  if (c.hasViewport) s += 5;
  if (c.hasFavicon) s += 4;
  if (c.language) s += 3;
  s += Math.min(25, Math.log10(Math.max(1, c.wordCount)) * 8);
  s += Math.min(10, c.internalLinks / 10);

  return clamp(s);
}

export function scoreTrust(t: TrustSignals): number {
  let s = 0;
  if (t.hasPrivacyPolicy) s += 20;
  if (t.hasContactPage) s += 15;
  if (t.hasAboutPage) s += 15;
  if (t.hasSchemaOrg) s += 20;
  if (t.hasOpenGraph) s += 10;
  s += Math.min(20, t.socialProfiles.length * 5);
  return clamp(s);
}

export function scoreAuthority(a: AuthoritySignals): number {
  let s = 0;
  if (a.referringDomainsEstimate !== null) {
    s += Math.min(60, Math.log10(a.referringDomainsEstimate + 1) * 22);
  }
  if (a.backlinkEstimate !== null) {
    s += Math.min(30, Math.log10(a.backlinkEstimate + 1) * 12);
  }
  s += a.brandConsistency * 10;
  return clamp(s);
}

export function scoreSpam(s: SpamSignals): number {
  let score = 0;
  if (s.outboundLinkRatio > 0.7) score += 25;
  else if (s.outboundLinkRatio > 0.5) score += 12;
  if (s.emptyAnchorRatio > 0.4) score += 15;
  score += s.suspiciousKeywordHits * 18;
  if (s.redirectChainLength > 3) score += 15;
  return clamp(score);
}

export function combineScores(b: ScoreBreakdown): {
  da: number;
  pa: number;
  trust: number;
  confidence: number;
} {
  // DA = whole-domain weighting (authority + domain age dominate)
  const daRaw =
    b.authority * 0.35 +
    b.domain * 0.2 +
    b.indexation * 0.15 +
    b.trust * 0.15 +
    b.content * 0.15;

  // PA = single-page weighting (content + on-page trust dominate)
  const paRaw =
    b.content * 0.35 +
    b.trust * 0.2 +
    b.authority * 0.2 +
    b.indexation * 0.15 +
    b.domain * 0.1;

  // Spam penalty applied multiplicatively, max -40%
  const spamPenalty = 1 - Math.min(0.4, b.spam / 250);

  // Confidence = how many sub-signals actually contributed (>0)
  const present = [b.domain, b.indexation, b.content, b.trust, b.authority].filter(
    (v) => v > 0,
  ).length;
  const confidence = clamp((present / 5) * 100);

  return {
    da: clamp(Math.round(daRaw * spamPenalty)),
    pa: clamp(Math.round(paRaw * spamPenalty)),
    trust: clamp(Math.round((b.trust + b.domain) / 2)),
    confidence: Math.round(confidence),
  };
}

export function buildExplanations(
  b: ScoreBreakdown,
  d: DomainSignals,
  i: IndexationSignals,
  t: TrustSignals,
  s: SpamSignals,
): string[] {
  const out: string[] = [];
  if (d.ageYears !== null) {
    if (d.ageYears > 10) out.push(`Domain is ${d.ageYears}y old — strong age signal.`);
    else if (d.ageYears < 1) out.push(`Domain is under a year old — limited authority.`);
    else out.push(`Domain age: ${d.ageYears}y.`);
  } else {
    out.push("Domain age unknown (WHOIS lookup did not return a creation date).");
  }
  if (!d.https) out.push("Site is not served over HTTPS — major trust penalty.");
  if (!i.hasSitemap) out.push("No sitemap.xml found — indexation signal weak.");
  if (i.indexedPages !== null && i.indexedPages > 1000) {
    out.push(`Sitemap reports ${i.indexedPages.toLocaleString()} URLs — large site.`);
  }
  if (t.hasPrivacyPolicy && t.hasAboutPage && t.hasContactPage) {
    out.push("All three trust pages (about, contact, privacy) found.");
  } else {
    const missing = [
      !t.hasAboutPage && "about",
      !t.hasContactPage && "contact",
      !t.hasPrivacyPolicy && "privacy",
    ]
      .filter(Boolean)
      .join(", ");
    if (missing) out.push(`Missing trust page(s): ${missing}.`);
  }
  if (s.suspiciousKeywordHits > 0) {
    out.push(`${s.suspiciousKeywordHits} suspicious keyword hit(s) — spam risk.`);
  }
  if (b.authority < 20) {
    out.push("Low external link diversity — authority estimate conservative.");
  }
  return out;
}
