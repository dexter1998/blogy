import type { MetadataResult } from "@/scrapers/metadata/types";
import type { SchemaResult } from "@/scrapers/schema/types";
import type { SitemapResult } from "@/scrapers/sitemap/types";
import type { AuditReport } from "./report-types";

export type SeoAuditInput = { url: string; fresh?: boolean };

// Legacy compact shape kept for backwards compatibility. New consumers
// should read the full `AuditReport` (`SeoAuditResult["report"]`).
export type SeoAuditCategory = {
  name: "metadata" | "schema" | "sitemap" | "content" | "links" | "indexability";
  score: number;
  weight: number;
  summary: string;
  issues: Array<{ severity: "error" | "warning" | "info"; message: string }>;
};

export type SeoAuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  scores: { overall: number; grade: "A" | "B" | "C" | "D" | "F" };
  categories: SeoAuditCategory[];
  totals: {
    errors: number;
    warnings: number;
    infos: number;
  };
  references: {
    metadata: Pick<MetadataResult, "scores"> & { issues: number };
    schema: Pick<SchemaResult, "scores"> & { detectedTypes: string[]; recommendedTypes: string[] };
    sitemap: Pick<SitemapResult, "scores"> & { totalUrls: number; truncated: boolean };
  };
  /** Full v2 audit report with checks + recommendations. */
  report: AuditReport;
};
