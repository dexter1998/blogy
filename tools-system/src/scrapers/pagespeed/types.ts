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

export type PageSpeedResult = {
  url: string;
  finalUrl: string;
  strategy: "mobile" | "desktop";
  fetchedAt: string;
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
  scores: {
    overall: number;
    performance: number;
    cwv: number;
  };
  source: "psi-v5" | "lighthouse-fallback";
};
