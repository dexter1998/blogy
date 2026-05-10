export type PageSpeedInput = {
  url: string;
  strategy?: "mobile" | "desktop";
  fresh?: boolean;
};

export type CoreWebVital = {
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number | null;
  unit: "ms" | "score";
  category: "good" | "needs-improvement" | "poor" | "unknown";
};

export type AuditEntry = {
  id: string;
  title: string;
  description: string;
  /** 0-1 lighthouse audit score, or null if non-binary / informational */
  score: number | null;
  scoreDisplayMode: string;
  /** Human-readable display value, e.g. "1.8 s" or "0.05" */
  displayValue?: string;
  /** Estimated savings in ms when this audit is for an opportunity */
  savingsMs?: number;
  /** Estimated savings in bytes when this audit is for an opportunity */
  savingsBytes?: number;
};

export type PageSpeedResult = {
  url: string;
  finalUrl: string;
  strategy: "mobile" | "desktop";
  fetchedAt: string;
  /** Final-screenshot data URL (jpeg/png base64). Empty string when unavailable. */
  screenshot: string;
  /** Field data from CrUX (real users). Null if Google has no CrUX data. */
  field: {
    available: boolean;
    coreWebVitalsAssessment: "PASS" | "FAIL" | "UNKNOWN";
    metrics: CoreWebVital[];
  };
  /** Lighthouse lab data (synthetic). Always available. */
  lab: {
    performanceScore: number | null;
    metrics: {
      lcp: number | null;
      fcp: number | null;
      cls: number | null;
      tbt: number | null;
      si: number | null;
      tti: number | null;
    };
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      savingsMs: number;
    }>;
    diagnostics: Array<{ id: string; title: string; description: string }>;
  };
  /** Lighthouse category scores (0-100) for all categories the API returned. */
  categories: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
  };
  /** Per-category audit refs, split into failing / passed / not-applicable / manual.
   * Each ref is a fully-populated audit (id/title/description/score/displayValue). */
  audits: {
    performance: AuditBuckets;
    seo: AuditBuckets;
    accessibility: AuditBuckets;
    bestPractices: AuditBuckets;
  };
  scores: {
    overall: number;
    performance: number;
    cwv: number;
  };
  source: "psi-v5" | "lighthouse-fallback";
};

export type AuditBuckets = {
  failing: AuditEntry[];
  passed: AuditEntry[];
  manual: AuditEntry[];
  notApplicable: AuditEntry[];
};
