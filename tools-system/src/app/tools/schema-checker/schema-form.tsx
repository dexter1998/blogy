"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { SchemaResult } from "@/scrapers/schema/types";

type ApiResp =
  | { ok: true; data: { result: SchemaResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 80) return "good";
  if (s >= 50) return "warn";
  if (s > 0) return "neutral";
  return "bad";
}

export function SchemaForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SchemaResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/schema", {
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
          <label className="text-sm font-medium">URL or domain</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Inspecting…" : "Check schema"}
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
            <Stat label="Items" value={result.totalItems} tone={result.totalItems > 0 ? "good" : "bad"} />
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
            <Stat label="Coverage" value={result.scores.coverage} tone={tone(result.scores.coverage)} />
            <Stat label="Quality" value={result.scores.quality} tone={tone(result.scores.quality)} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Detected types
            </h3>
            {result.detectedTypes.length === 0 ? (
              <p className="text-sm text-muted-fg italic">No structured data found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.detectedTypes.map((t) => (
                  <Badge key={t} tone="accent">{t}</Badge>
                ))}
              </div>
            )}
            {result.recommendedTypes.length > 0 && (
              <>
                <h3 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  Recommended
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedTypes.map((t) => (
                    <Badge key={t} tone="warn">{t}</Badge>
                  ))}
                </div>
              </>
            )}
          </Card>

          {result.issues.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Issues ({result.issues.length})
              </h3>
              <ul className="space-y-2 text-sm">
                {result.issues.map((iss, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2">
                    <Badge tone={iss.severity === "error" ? "bad" : iss.severity === "warning" ? "warn" : "neutral"}>
                      {iss.severity}
                    </Badge>
                    {iss.type && <code className="text-xs text-muted-fg">{iss.type}</code>}
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.items.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Items
              </h3>
              <div className="space-y-3">
                {result.items.map((it, i) => (
                  <div key={i} className="rounded border border-app p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge tone="neutral">{it.format}</Badge>
                      <span className="font-semibold">{it.type}</span>
                    </div>
                    <pre className="code-block max-h-60 overflow-auto text-xs">
{JSON.stringify(it.raw, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
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
