import type { SchemaIssue, SchemaResult } from "@/scrapers/schema/types";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function scoreSchema(r: SchemaResult): {
  scores: SchemaResult["scores"];
  issues: SchemaIssue[];
} {
  const issues: SchemaIssue[] = [];
  for (const item of r.items) {
    for (const e of item.errors) issues.push({ severity: "error", type: item.type, message: e });
    for (const w of item.warnings) issues.push({ severity: "warning", type: item.type, message: w });
  }
  for (const rec of r.recommendedTypes) {
    issues.push({ severity: "info", type: rec, message: `Recommended: add ${rec} schema` });
  }

  let coverage = 0;
  if (r.totalItems > 0) coverage += 30;
  if (r.byFormat.jsonLd > 0) coverage += 25;
  coverage += Math.min(30, r.detectedTypes.length * 8);
  if (r.recommendedTypes.length === 0) coverage += 15;

  const errorCount = r.items.reduce((acc, i) => acc + i.errors.length, 0);
  const warnCount = r.items.reduce((acc, i) => acc + i.warnings.length, 0);
  let quality = 100;
  quality -= errorCount * 15;
  quality -= warnCount * 5;

  const scores = {
    coverage: clamp(coverage),
    quality: clamp(quality),
    overall: 0,
  };
  scores.overall = Math.round(scores.coverage * 0.5 + scores.quality * 0.5);
  return { scores, issues };
}
