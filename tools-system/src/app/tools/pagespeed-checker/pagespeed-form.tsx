"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { CoreWebVital, PageSpeedResult } from "@/scrapers/pagespeed/types";

type ApiResp =
  | { ok: true; data: { result: PageSpeedResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 90) return "good";
  if (s >= 50) return "warn";
  return "bad";
}

function cwvTone(c: CoreWebVital["category"]): "good" | "warn" | "bad" | "neutral" {
  if (c === "good") return "good";
  if (c === "needs-improvement") return "warn";
  if (c === "poor") return "bad";
  return "neutral";
}

export function PageSpeedForm() {
  const [url, setUrl] = useState("blogy.in");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PageSpeedResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/pagespeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, strategy }),
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
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="text-sm font-medium">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as "mobile" | "desktop")}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Auditing (≈20s)…" : "Run PageSpeed"}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
            <Stat label="Performance" value={result.scores.performance} tone={tone(result.scores.performance)} />
            <Stat label="Core Web Vitals" value={result.scores.cwv} tone={tone(result.scores.cwv)} />
          </div>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Field data (real users · CrUX)
              </h3>
              <Badge tone={result.field.available ? "good" : "neutral"}>
                {result.field.available ? "Available" : "No CrUX data"}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {result.field.metrics.map((m) => (
                <Stat
                  key={m.metric}
                  label={m.metric}
                  value={m.value === null ? "—" : m.unit === "ms" ? `${m.value}ms` : m.value.toFixed(3)}
                  tone={cwvTone(m.category)}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-fg">
              CWV assessment:{" "}
              <Badge tone={result.field.coreWebVitalsAssessment === "PASS" ? "good" : result.field.coreWebVitalsAssessment === "FAIL" ? "bad" : "neutral"}>
                {result.field.coreWebVitalsAssessment}
              </Badge>
            </p>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Lab metrics (Lighthouse)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="LCP" value={result.lab.metrics.lcp ? `${result.lab.metrics.lcp}ms` : "—"} />
              <Stat label="FCP" value={result.lab.metrics.fcp ? `${result.lab.metrics.fcp}ms` : "—"} />
              <Stat label="CLS" value={result.lab.metrics.cls ?? "—"} />
              <Stat label="TBT" value={result.lab.metrics.tbt ? `${result.lab.metrics.tbt}ms` : "—"} />
              <Stat label="Speed Index" value={result.lab.metrics.si ? `${result.lab.metrics.si}ms` : "—"} />
              <Stat label="TTI" value={result.lab.metrics.tti ? `${result.lab.metrics.tti}ms` : "—"} />
            </div>
          </Card>

          {result.lab.opportunities.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Top opportunities
              </h3>
              <ul className="space-y-2">
                {result.lab.opportunities.map((o) => (
                  <li key={o.id} className="border-b border-app pb-2 text-sm last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{o.title}</span>
                      <Badge tone="warn">~{(o.savingsMs / 1000).toFixed(1)}s</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-fg">{o.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

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
