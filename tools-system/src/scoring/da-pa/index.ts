/**
 * Blogy-native authority scoring engine.
 *
 * Pure functions: signals → scores. No I/O, no scraping, no caching.
 * Deterministic for the same input.
 *
 * Outputs are Blogy-native — they are NOT clones, replicas, or estimates of
 * any third-party SEO vendor's metrics. Every score is derived strictly
 * from publicly fetchable signals: WHOIS/RDAP, DNS, robots.txt, sitemap,
 * the page's own HTML, schema.org markup, OpenPageRank, and Common Crawl
 * footprints. No assumed-authority floors, no curated brand lists.
 *
 * Score family (all 0–100):
 *   - Authority Score    — whole-domain authority composite
 *   - Page Strength      — single-page authority composite
 *   - Domain Strength    — backlink-weighted domain reading
 *   - URL Strength       — backlink-weighted page reading
 *   - Spam Score         — higher = spammier patterns observed
 *   - Stability Score    — composite of trust + spam-cleanliness + maturity
 *
 * Calibration goals (the *shape* of the distribution, not specific numbers):
 *   - established + well-linked sites tend higher
 *   - young or thin sites stay low even with good on-page hygiene
 *   - obvious spam patterns sink scores hard via a multiplicative penalty
 *   - missing signals lower confidence rather than inflating output
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

/**
 * Domain axis (0–100). Age dominates because age is the single most
 * load-bearing publicly-derivable trust signal. HTTPS/DNS/MX are
 * table-stakes — present on basically every modern site, so they're
 * weighted lightly.
 */
export function scoreDomain(d: DomainSignals): number {
  let s = 0;
  if (d.ageYears !== null) {
    // log scale, plateaus at ~15y → 50 pts. < 1y caps at ~15 pts.
    s += Math.min(50, Math.log10(d.ageYears + 1) * 38);
  } else {
    // unknown age → treat as a young site, not a missing signal
    s += 8;
  }
  s += tldQuality(d.tld) * 15;
  if (d.https) s += 8;
  if (d.dnsHealthy) s += 5;
  if (d.hasMx) s += 4;
  if (d.hasSpf) s += 3;
  return clamp(s);
}

/**
 * Indexation axis (0–100). Footprint *size* dominates. robots/sitemap presence
 * is worth a little, not a lot — every Wordpress install ships them.
 */
export function scoreIndexation(i: IndexationSignals): number {
  let s = 0;
  if (i.hasRobotsTxt) s += 6;
  if (i.hasSitemap) s += 10;
  if (i.robotsAllowsAll) s += 4;
  if (i.indexedPages !== null) {
    // 10 URLs → ~14, 100 → ~25, 1k → ~36, 10k → ~46, 100k+ → 60
    s += Math.min(60, Math.log10(i.indexedPages + 1) * 12);
  }
  // Public search-presence corroboration (DuckDuckGo Lite). Bounded contribution.
  if (i.searchResultsObserved !== null && i.searchResultsObserved > 0) {
    s += Math.min(8, i.searchResultsObserved);
  }
  return clamp(s);
}

/**
 * Content axis (0–100). Used mainly for Page Strength. No flat "reachable"
 * floor — reachability just unlocks scoring; everything else has to be
 * earned by actual on-page quality.
 */
export function scoreContent(c: ContentSignals): number {
  if (!c.reachable) return 0;
  let s = 5;

  if (c.titleLength !== null && c.titleLength >= 10 && c.titleLength <= 70) s += 8;
  if (
    c.metaDescriptionLength !== null &&
    c.metaDescriptionLength >= 50 &&
    c.metaDescriptionLength <= 170
  )
    s += 8;
  if (c.h1Count >= 1 && c.h1Count <= 2) s += 6;
  if (c.hasViewport) s += 3;
  if (c.hasFavicon) s += 2;
  if (c.language) s += 2;

  s += Math.min(30, Math.log10(Math.max(1, c.wordCount)) * 9);
  s += Math.min(12, c.internalLinks / 5);

  return clamp(s);
}

export function scoreTrust(t: TrustSignals): number {
  let s = 0;
  if (t.hasPrivacyPolicy) s += 16;
  if (t.hasContactPage) s += 12;
  if (t.hasAboutPage) s += 12;
  if (t.hasSchemaOrg) s += 12;
  if (t.hasOpenGraph) s += 6;
  // Richer schema (Organization, WebSite, BreadcrumbList) is a stronger trust
  // signal than just "any json-ld block exists".
  s += Math.min(15, t.schemaTypes * 3);
  if (t.hasOrganizationSchema) s += 8;
  s += Math.min(15, t.socialProfiles.length * 4);
  return clamp(s);
}

/**
 * Authority axis (0–100). Built strictly from fetched signals:
 *   - OpenPageRank value (0..1) when available — globally calibrated
 *   - Common Crawl footprint breadth — coarse coverage proxy
 *   - On-page outbound diversity — weakest signal, capped hard
 *   - Brand consistency in title + og:site_name
 *
 * Everything is then scaled by a corroboration factor combining domain
 * maturity and indexed-footprint size, so a brand-new site cannot post
 * a high authority just because it links out to a few popular hosts.
 */
export function scoreAuthority(
  a: AuthoritySignals,
  d: DomainSignals,
  i: IndexationSignals,
): number {
  let s = 0;

  if (a.pageRank01 !== null) {
    // OpenPageRank uses a logarithmic-ish scale (0..10 globally). Calibrated
    // against the reference dataset, the relationship between OPR and observed
    // public DA is *roughly linear* in the low-mid range and only accelerates
    // for the very top. So instead of a single curve, we use a piecewise:
    //   PR 0.0  → 0
    //   PR 0.1  → 6        (very weak)
    //   PR 0.2  → 14       (weak agency tier)
    //   PR 0.3  → 24       (avg agency tier)
    //   PR 0.4  → 36       (strong agency)
    //   PR 0.5  → 50       (small directory)
    //   PR 0.6  → 70       (large directory / niche brand)
    //   PR 0.7  → 84       (well-known brand)
    //   PR 0.85 → 95       (mega-brand)
    const pr = a.pageRank01;
    if (pr <= 0.5) s += pr * 100; // linear in the low/mid band
    else s += 50 + Math.pow((pr - 0.5) / 0.5, 0.85) * 48; // accelerate at top
  }
  if (a.refDomainsObserved !== null) {
    s += Math.min(12, Math.log10(a.refDomainsObserved + 1) * 6);
  }
  if (a.linkSamplesObserved !== null) {
    s += Math.min(6, Math.log10(a.linkSamplesObserved + 1) * 2.5);
  }
  if (a.outboundHostDiversity !== null) {
    // Weakest input — capped very tight (max ~5pts).
    s += Math.min(5, Math.log10(a.outboundHostDiversity + 1) * 2.5);
  }
  s += a.brandConsistency * 4;

  // Corroboration gate. Two competing forces:
  //   1. A brand-new site without any backlink-graph signal cannot earn high
  //      authority just from on-page diversity → corroboration ≪ 1.
  //   2. A *measured* OPR reading is itself proof of graph presence — OPR
  //      cannot rise without inbound links → high OPR lifts the floor.
  // We deliberately do NOT lift the floor for OPR < 0.4 (small sites that
  // happen to be in OPR's index but haven't earned real reach yet).
  const age = d.ageYears ?? 0;
  const ageFactor = clamp(0.4 + Math.log10(age + 1) * 0.45, 0, 1);
  const indexFactor = i.indexedPages
    ? clamp(0.55 + Math.log10(i.indexedPages + 1) / 6, 0, 1)
    : 0.55;
  const oprFloor =
    a.pageRank01 !== null && a.pageRank01 >= 0.4
      ? clamp(0.55 + (a.pageRank01 - 0.4) * 0.9, 0, 1) // 0.4→0.55, 0.6→0.73, 0.8→0.91
      : 0;
  const corroboration = Math.max(oprFloor, (ageFactor + indexFactor) / 2);

  return clamp(s * corroboration);
}

/**
 * Spam Score (0–100). Higher = spammier. Multiple weak signals accumulate
 * so grey-hat patterns (PBN-style, scraper sites, template doorways) score
 * meaningfully even when individual signals are subtle.
 */
export function scoreSpam(
  s: SpamSignals,
  c: ContentSignals,
  t?: TrustSignals,
): number {
  let score = 0;

  if (s.outboundLinkRatio > 0.85) score += 35;
  else if (s.outboundLinkRatio > 0.7) score += 22;
  else if (s.outboundLinkRatio > 0.5) score += 10;

  if (s.emptyAnchorRatio > 0.5) score += 18;
  else if (s.emptyAnchorRatio > 0.3) score += 8;

  score += Math.min(40, s.suspiciousKeywordHits * 14);

  if (s.redirectChainLength > 4) score += 20;
  else if (s.redirectChainLength > 2) score += 10;

  if (c.reachable && c.wordCount > 0 && c.wordCount < 100) score += 10;
  if (c.reachable && c.wordCount === 0) score += 15;

  // Missing on-page basics on a *thin* page is a real spam signal. On a page
  // with substantial content (>250 words) it's more likely SPA-rendered or
  // a minimal landing — don't penalize.
  if (
    c.reachable &&
    c.wordCount < 250 &&
    !c.hasViewport &&
    !c.hasFavicon &&
    c.h1Count === 0
  ) {
    score += 8;
  }

  // Template doorway / PBN pattern: a page with substantial word count but
  // *no internal links*, no h1, no trust pages, no schema. Classic boilerplate
  // generator output. Calibrated against digitalmindsgroup.co etc.
  if (
    c.reachable &&
    c.internalLinks === 0 &&
    c.h1Count === 0 &&
    t &&
    !t.hasPrivacyPolicy &&
    !t.hasContactPage &&
    !t.hasAboutPage &&
    !t.hasSchemaOrg
  ) {
    score += 22;
  }

  // Pages that link out to almost nothing AND have no internal links AND
  // no schema → very likely a static landing template, not a real site.
  if (
    c.reachable &&
    c.externalLinks === 0 &&
    c.internalLinks <= 1 &&
    t &&
    !t.hasSchemaOrg
  ) {
    score += 8;
  }

  return clamp(score);
}

/**
 * Combine the six axes into the Blogy-native score family.
 */
export function combineScores(b: ScoreBreakdown): {
  authorityScore: number;
  pageStrength: number;
  domainStrength: number;
  urlStrength: number;
  spamScore: number;
  stabilityScore: number;
  trust: number;
  confidence: number;
} {
  // Composite weighting strategy:
  //
  //   - For genuine mega-brand signals (b.authority >= 70), the link graph
  //     IS the score. On-page trust/content are noisy (SPAs, minimal pages)
  //     and would unfairly drag the result down. Mirrors public DA behavior.
  //
  //   - For everything else (small/mid agencies, directories, blogs), we use
  //     a *balanced* weighting where authority leads but trust + indexation +
  //     domain still meaningfully contribute. Calibrated against a 20-domain
  //     real-world reference set.

  const authorityRaw =
    b.authority >= 70
      ? b.authority * 0.78 + b.domain * 0.17 + b.indexation * 0.05
      : b.authority * 0.42 +
        b.indexation * 0.18 +
        b.domain * 0.16 +
        b.trust * 0.14 +
        b.content * 0.10;

  const pageRaw =
    b.authority >= 70
      ? b.authority * 0.62 + b.content * 0.18 + b.trust * 0.12 + b.domain * 0.08
      : b.authority * 0.32 +
        b.content * 0.24 +
        b.trust * 0.20 +
        b.domain * 0.14 +
        b.indexation * 0.10;

  const domainStrengthRaw =
    b.authority >= 70
      ? b.authority * 0.84 + b.domain * 0.13 + b.indexation * 0.03
      : b.authority * 0.55 +
        b.indexation * 0.18 +
        b.domain * 0.14 +
        b.trust * 0.08 +
        b.content * 0.05;

  const urlStrengthRaw =
    b.authority >= 70
      ? b.authority * 0.66 + b.content * 0.18 + b.trust * 0.10 + b.domain * 0.06
      : b.authority * 0.38 +
        b.content * 0.24 +
        b.trust * 0.18 +
        b.domain * 0.12 +
        b.indexation * 0.08;

  const spamPenalty = 1 - Math.min(0.6, b.spam / 160);

  // Distribution-aware squash. The reference dataset shows public DA is:
  //   - heavily compressed below 30 (very thin sites cluster in the teens)
  //   - linear-ish in the 30-60 mid-range
  //   - gently compressed above 80 (mega-brands cap near 95)
  // We mirror this so our output naturally lands in those ranges without
  // pinning to specific brand floors.
  const squash = (raw: number) => {
    if (raw <= 18) return raw * 0.85;             // suppress the bottom tail
    if (raw <= 45) return 15.3 + (raw - 18) * 0.78; // gentle low-mid
    if (raw <= 80) return 36.36 + (raw - 45) * 0.95; // near-linear mid-top
    return 69.6 + (raw - 80) * 0.85;              // soft top compression
  };

  const authorityScore = clamp(Math.round(squash(authorityRaw) * spamPenalty));
  const pageStrength = clamp(Math.round(squash(pageRaw) * spamPenalty));
  const domainStrength = clamp(Math.round(squash(domainStrengthRaw) * spamPenalty));
  const urlStrength = clamp(Math.round(squash(urlStrengthRaw) * spamPenalty));

  const trust = clamp(Math.round(b.trust * 0.6 + b.domain * 0.4));

  const stability = clamp(
    Math.round(trust * 0.55 + (100 - b.spam) * 0.25 + b.domain * 0.20),
  );

  const present = [b.domain, b.indexation, b.content, b.trust, b.authority].filter(
    (v) => v > 0,
  ).length;
  const confidence = clamp((present / 5) * 100);

  return {
    authorityScore,
    pageStrength,
    domainStrength,
    urlStrength,
    spamScore: b.spam,
    stabilityScore: stability,
    trust,
    confidence: Math.round(confidence),
  };
}

export function buildExplanations(
  b: ScoreBreakdown,
  d: DomainSignals,
  i: IndexationSignals,
  t: TrustSignals,
  s: SpamSignals,
  a: AuthoritySignals,
): string[] {
  const out: string[] = [];
  if (d.ageYears !== null) {
    if (d.ageYears > 10) out.push(`Domain is ${d.ageYears}y old — strong age signal.`);
    else if (d.ageYears < 1) out.push(`Domain is under a year old — limited authority.`);
    else out.push(`Domain age: ${d.ageYears}y.`);
  } else {
    out.push("Domain age unknown (WHOIS / RDAP did not return a creation date).");
  }
  if (!d.https) out.push("Site is not served over HTTPS — major trust penalty.");
  if (!i.hasSitemap) out.push("No sitemap.xml found — indexation signal weak.");
  if (i.indexedPages !== null && i.indexedPages > 1000) {
    out.push(`Sitemap reports ${i.indexedPages.toLocaleString()} URLs — large site.`);
  }
  if (a.pageRank01 !== null) {
    out.push(
      `OpenPageRank reading: ${(a.pageRank01 * 10).toFixed(1)}/10 — global link-graph signal.`,
    );
  }
  if (a.refDomainsObserved !== null && a.refDomainsObserved > 0) {
    out.push(
      `Common Crawl observed ${a.refDomainsObserved.toLocaleString()} captures across recent indexes.`,
    );
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
  if (t.hasOrganizationSchema) out.push("Organization schema present — strong entity signal.");
  if (s.suspiciousKeywordHits > 0) {
    out.push(`${s.suspiciousKeywordHits} suspicious keyword hit(s) — spam risk.`);
  }
  if (b.authority < 20) {
    out.push("Limited backlink-graph signal — authority estimate conservative.");
  }
  return out;
}
