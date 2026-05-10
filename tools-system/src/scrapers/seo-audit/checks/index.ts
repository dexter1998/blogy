import type { CheckResult, Severity, Signals } from "../report-types";
import type { CheckDef } from "./types";
import { onPageChecks } from "./on-page";
import { technicalChecks } from "./technical";
import { performanceChecks } from "./performance";
import { securityChecks } from "./security";
import { indexabilityChecks } from "./indexability";
import { contentChecks } from "./content";
import { aiReadinessChecks } from "./ai-readiness";
import { socialChecks } from "./social";

/** All checks in evaluation order (also the default UI display order). */
export const ALL_CHECKS: CheckDef[] = [
  ...onPageChecks,
  ...technicalChecks,
  ...performanceChecks,
  ...securityChecks,
  ...indexabilityChecks,
  ...contentChecks,
  ...aiReadinessChecks,
  ...socialChecks,
];

function severityFor(status: CheckResult["status"], weight: number): Severity {
  if (status === "pass") return "pass";
  if (status === "info" || status === "skipped") return "info";
  if (status === "warn") return "warning";
  // fail — critical if it carries weight ≥ 2, otherwise warning.
  return weight >= 2 ? "critical" : "warning";
}

export function runChecks(signals: Signals): CheckResult[] {
  return ALL_CHECKS.map((def) => {
    const weight = def.weight ?? 1;
    let raw: ReturnType<CheckDef["run"]>;
    try {
      raw = def.run(signals);
    } catch (e) {
      // Don't let a single check crash the audit.
      return {
        id: def.id,
        title: def.title,
        category: def.category,
        weight,
        status: "skipped",
        severity: "info",
        summary: `Check errored: ${e instanceof Error ? e.message : "unknown"}`,
        whyItMatters: def.whyItMatters,
        howToFix: def.howToFix,
        evidence: [],
      };
    }
    if (!raw) {
      return {
        id: def.id,
        title: def.title,
        category: def.category,
        weight,
        status: "skipped",
        severity: "info",
        summary: "Signal data unavailable.",
        whyItMatters: def.whyItMatters,
        howToFix: def.howToFix,
        evidence: [],
      };
    }
    return {
      id: def.id,
      title: def.title,
      category: def.category,
      weight,
      status: raw.status,
      severity: severityFor(raw.status, weight),
      summary: raw.summary,
      whyItMatters: raw.whyItMatters ?? def.whyItMatters,
      howToFix: raw.howToFix ?? def.howToFix,
      evidence: raw.evidence,
      affectedUrls: raw.affectedUrls,
    };
  });
}
