/**
 * Scoring + prioritisation. All inputs are `CheckResult[]` so the logic
 * is deterministic and trivially testable.
 *
 * Per-check scoring:
 *   pass    → 100
 *   warn    → 60
 *   info    → 100 (treated as pass — informational checks don't penalise)
 *   skipped → excluded (don't penalise things we couldn't evaluate)
 *   fail    → 0
 *
 * Category score = weighted average of evaluated checks in that category.
 * Overall score  = weighted sum of category scores using CATEGORY_META.
 */

import {
  CATEGORY_META,
  type CategoryId,
  type CategoryScore,
  type CheckResult,
  gradeOf,
} from "./report-types";

function scoreForCheck(c: CheckResult): number | null {
  switch (c.status) {
    case "pass":
      return 100;
    case "warn":
      return 60;
    case "info":
      return 100;
    case "fail":
      return 0;
    case "skipped":
      return null;
  }
}

export function scoreCategories(checks: CheckResult[]): CategoryScore[] {
  const byCat = new Map<CategoryId, CheckResult[]>();
  for (const c of checks) {
    const arr = byCat.get(c.category) ?? [];
    arr.push(c);
    byCat.set(c.category, arr);
  }

  const result: CategoryScore[] = [];
  for (const [cat, meta] of Object.entries(CATEGORY_META) as Array<[CategoryId, typeof CATEGORY_META[CategoryId]]>) {
    const items = byCat.get(cat) ?? [];
    let totalWeight = 0;
    let totalScore = 0;
    let passed = 0,
      warnings = 0,
      failures = 0,
      skipped = 0;
    for (const c of items) {
      const s = scoreForCheck(c);
      if (s == null) {
        skipped += 1;
        continue;
      }
      totalWeight += c.weight;
      totalScore += s * c.weight;
      if (c.status === "pass" || c.status === "info") passed += 1;
      else if (c.status === "warn") warnings += 1;
      else if (c.status === "fail") failures += 1;
    }
    const score = totalWeight === 0 ? 0 : Math.round(totalScore / totalWeight);
    result.push({
      category: cat,
      label: meta.label,
      weight: meta.weight,
      score,
      grade: gradeOf(score),
      passed,
      warnings,
      failures,
      skipped,
    });
  }
  return result;
}

export function overallScore(categories: CategoryScore[]): number {
  // Weighted average, but only over categories that had at least one
  // evaluated check (totalWeight > 0). This avoids penalising a category
  // we couldn't measure.
  let weight = 0;
  let total = 0;
  for (const c of categories) {
    if (c.passed + c.warnings + c.failures === 0) continue;
    weight += c.weight;
    total += c.score * c.weight;
  }
  if (weight === 0) return 0;
  return Math.round(total / weight);
}

export function prioritise(checks: CheckResult[]): {
  critical: CheckResult[];
  warnings: CheckResult[];
  passed: CheckResult[];
  info: CheckResult[];
} {
  const critical: CheckResult[] = [];
  const warnings: CheckResult[] = [];
  const passed: CheckResult[] = [];
  const info: CheckResult[] = [];
  for (const c of checks) {
    if (c.severity === "critical") critical.push(c);
    else if (c.severity === "warning") warnings.push(c);
    else if (c.severity === "pass") passed.push(c);
    else info.push(c);
  }
  // Sort within each bucket by weight desc (impact-first).
  const byWeight = (a: CheckResult, b: CheckResult) => b.weight - a.weight;
  return {
    critical: critical.sort(byWeight),
    warnings: warnings.sort(byWeight),
    passed: passed.sort(byWeight),
    info: info.sort(byWeight),
  };
}
