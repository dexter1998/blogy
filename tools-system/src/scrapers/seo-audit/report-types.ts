/**
 * Report-level types for the SEO Audit v2 engine.
 *
 * The audit pipeline is:
 *   1. fetch — call all extractor APIs in parallel, build a `Signals` bag.
 *   2. evaluate — run every `Check` against the signals; each emits a
 *      `CheckResult` with severity + verdict + fix.
 *   3. score — group results into 8 categories, weighted sum, grade.
 *   4. prioritise — sort fails by impact × severity into Critical / Warning
 *      / Info buckets.
 *
 * Everything is deterministic and explainable. No randomness, no faked
 * scores. The output is a `AuditReport` that the UI renders directly.
 */

import type { MetadataResult } from "@/scrapers/metadata/types";
import type { SchemaResult } from "@/scrapers/schema/types";
import type { SitemapResult } from "@/scrapers/sitemap/types";
import type { PageSpeedResult } from "@/scrapers/pagespeed/types";
import type { BacklinkResult } from "@/scrapers/backlinks/types";
import type { GeoResult } from "@/scrapers/geo/types";
import type { WebsiteIntelligenceResult } from "@/scrapers/website-intelligence/types";

// ── Category taxonomy ──────────────────────────────────────────────────

export type CategoryId =
  | "on-page"
  | "technical"
  | "performance"
  | "security"
  | "indexability"
  | "content"
  | "ai-readiness"
  | "social";

export const CATEGORY_META: Record<
  CategoryId,
  { label: string; weight: number; description: string }
> = {
  "on-page": { label: "On-Page SEO", weight: 0.18, description: "Title, meta, headings, canonical, hreflang." },
  technical: { label: "Technical SEO", weight: 0.14, description: "Sitemap, robots, structured data coverage." },
  performance: { label: "Performance", weight: 0.16, description: "Core Web Vitals, page weight, asset hygiene." },
  security: { label: "Security", weight: 0.1, description: "HTTPS, HSTS, CSP, mail authentication." },
  indexability: { label: "Indexability", weight: 0.12, description: "Canonical / robots / status-code health." },
  content: { label: "Content", weight: 0.12, description: "Depth, structure, readability, alt coverage." },
  "ai-readiness": { label: "AI Readiness", weight: 0.12, description: "AI crawler access, citability, llms.txt, schema." },
  social: { label: "Social", weight: 0.06, description: "OG/Twitter tags, profile links, pixels." },
};

// ── Check + result contracts ───────────────────────────────────────────

export type Severity = "critical" | "warning" | "info" | "pass";

export type CheckStatus = "fail" | "warn" | "pass" | "info" | "skipped";

export type CheckEvidence = {
  /** Free-form label, e.g. "Title length", "Robots header". */
  label: string;
  /** Either a literal value or a small list of URLs. */
  value: string | number | string[];
};

export type CheckResult = {
  /** Stable check identifier — used for filtering/exporting. */
  id: string;
  /** Human title — what the check is. */
  title: string;
  /** Which category this check rolls into. */
  category: CategoryId;
  /** Score weight inside the category (relative). */
  weight: number;
  /** Pass/fail/warn/info/skipped. `skipped` means we had no signal data to evaluate. */
  status: CheckStatus;
  /** Effective severity for UI sorting + colouring. */
  severity: Severity;
  /** One-line verdict. */
  summary: string;
  /** Why this matters for SEO/AI. Always non-empty. */
  whyItMatters: string;
  /** How to fix. Always non-empty when status != pass. */
  howToFix: string;
  /** Concrete numbers/URLs we observed. */
  evidence: CheckEvidence[];
  /** Optional list of affected URLs (e.g. broken links). */
  affectedUrls?: string[];
};

// ── Category score ─────────────────────────────────────────────────────

export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export type CategoryScore = {
  category: CategoryId;
  label: string;
  weight: number;
  /** 0–100. Weighted average of the checks that ran (skipped checks are excluded). */
  score: number;
  grade: Grade;
  passed: number;
  warnings: number;
  failures: number;
  skipped: number;
};

// ── Signals bag (input to every check) ─────────────────────────────────

export type Signals = {
  url: string;
  finalUrl: string;
  origin: string;
  fetchedAt: string;
  metadata: MetadataResult | null;
  schema: SchemaResult | null;
  sitemap: SitemapResult | null;
  pagespeedMobile: PageSpeedResult | null;
  pagespeedDesktop: PageSpeedResult | null;
  backlinks: BacklinkResult | null;
  geo: GeoResult | null;
  intelligence: WebsiteIntelligenceResult | null;
  images: ImageAuditResult | null;
};

export type ImageAuditResult = {
  totalImages: number;
  checked: number;
  /** Images >= 200KB on the wire are flagged as oversized. */
  oversized: Array<{ src: string; bytes: number; mime: string | null }>;
  /** Images without alt text. */
  missingAlt: string[];
  /** Images that lazy-load. */
  lazyCount: number;
  /** Non-next-gen formats (jpg/png) when webp/avif could be used. */
  legacyFormats: string[];
  totalBytes: number;
};

// ── Final report shape ─────────────────────────────────────────────────

export type AuditReport = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  durationMs: number;
  overall: {
    score: number;
    grade: Grade;
  };
  categories: CategoryScore[];
  checks: CheckResult[];
  /** Severity-sorted pre-filtered views the UI can render directly. */
  prioritised: {
    critical: CheckResult[];
    warnings: CheckResult[];
    passed: CheckResult[];
    info: CheckResult[];
  };
  /** Source signals — kept on the report so the UI can render rich
   *  sections (schema cards, link tables, etc.) without re-fetching. */
  signals: Signals;
  /** Which signal sources were skipped/failed at fetch time. */
  fetchFailures: string[];
};

// ── Tiny helper exported for both checks + UI ──────────────────────────

export function gradeOf(score: number): Grade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}
