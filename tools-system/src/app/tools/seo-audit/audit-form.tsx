"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { SeoAuditResult } from "@/scrapers/seo-audit/types";

type ApiResp =
  | { ok: true; data: { result: SeoAuditResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 80) return "good";
  if (s >= 50) return "warn";
  if (s > 0) return "neutral";
  return "bad";
}

const GRADE_TONE: Record<SeoAuditResult["scores"]["grade"], "good" | "warn" | "bad" | "neutral"> = {
  A: "good",
  B: "good",
  C: "warn",
  D: "warn",
  F: "bad",
};

export function AuditForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeoAuditResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) setError(json.error.message);
      else setResult(json.data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm font-medium">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Auditing…" : "Run audit"}
          </Button>
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
            <Stat label="Grade" value={result.scores.grade} tone={GRADE_TONE[result.scores.grade]} />
            <Stat label="Errors" value={result.totals.errors} tone={result.totals.errors === 0 ? "good" : "bad"} />
            <Stat label="Warnings" value={result.totals.warnings} tone={result.totals.warnings === 0 ? "good" : "warn"} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Categories
            </h3>
            <div className="space-y-3">
              {result.categories.map((c) => (
                <div key={c.name} className="rounded border border-app p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone={tone(c.score)}>{c.score}</Badge>
                      <span className="font-semibold capitalize">{c.name}</span>
                      <span className="text-xs text-muted-fg">weight {(c.weight * 100).toFixed(0)}%</span>
                    </div>
                    <span className="text-xs text-muted-fg">{c.summary}</span>
                  </div>
                  {c.issues.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {c.issues.slice(0, 5).map((iss, i) => (
                        <li key={i} className="flex items-baseline gap-2">
                          <Badge tone={iss.severity === "error" ? "bad" : iss.severity === "warning" ? "warn" : "neutral"}>
                            {iss.severity}
                          </Badge>
                          <span>{iss.message}</span>
                        </li>
                      ))}
                      {c.issues.length > 5 && (
                        <li className="text-xs text-muted-fg">+ {c.issues.length - 5} more</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Raw API response
              </h3>
              <CopyButton text={JSON.stringify(result, null, 2)} />
            </div>
            <pre className="code-block max-h-96 overflow-auto text-xs">
{JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}
