"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { MetadataResult } from "@/scrapers/metadata/types";

type ApiResp =
  | { ok: true; data: { result: MetadataResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(score: number): "good" | "warn" | "bad" | "neutral" {
  if (score >= 80) return "good";
  if (score >= 50) return "warn";
  if (score > 0) return "neutral";
  return "bad";
}

export function MetadataForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    setDuration(null);
    try {
      const res = await fetch("/api/v1/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) {
        setError(json.error.message);
      } else {
        setResult(json.data.result);
        setDuration(json.meta.durationMs);
      }
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
            placeholder="https://example.com"
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Inspecting…" : "Inspect metadata"}
            </Button>
            {duration !== null && (
              <span className="text-xs text-muted-fg">
                Done in {(duration / 1000).toFixed(2)}s
              </span>
            )}
          </div>
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
            <Stat label="Basic" value={result.scores.basic} tone={tone(result.scores.basic)} />
            <Stat label="Social" value={result.scores.social} tone={tone(result.scores.social)} />
            <Stat label="International" value={result.scores.international} tone={tone(result.scores.international)} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Issues ({result.issues.length})
            </h3>
            {result.issues.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                No metadata issues detected.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {result.issues.map((iss, i) => (
                  <li key={i} className="flex gap-2">
                    <Badge tone={iss.severity === "error" ? "bad" : iss.severity === "warning" ? "warn" : "neutral"}>
                      {iss.severity}
                    </Badge>
                    <code className="text-xs text-muted-fg">{iss.field}</code>
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Basic</h3>
              <Field label="Title" value={result.basic.title} hint={result.basic.titleLength ? `${result.basic.titleLength} chars` : undefined} />
              <Field label="Description" value={result.basic.description} hint={result.basic.descriptionLength ? `${result.basic.descriptionLength} chars` : undefined} />
              <Field label="Canonical" value={result.basic.canonical} mono />
              <Field label="Robots" value={result.basic.robots} mono />
              <Field label="Viewport" value={result.basic.viewport} mono />
              <Field label="Lang" value={result.basic.language} />
              <Field label="Charset" value={result.basic.charset} />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Open Graph</h3>
              <Field label="og:title" value={result.openGraph.title} />
              <Field label="og:description" value={result.openGraph.description} />
              <Field label="og:image" value={result.openGraph.image} mono />
              <Field label="og:type" value={result.openGraph.type} />
              <Field label="og:site_name" value={result.openGraph.siteName} />
              <h3 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wider text-muted-fg">Twitter</h3>
              <Field label="card" value={result.twitter.card} />
              <Field label="title" value={result.twitter.title} />
              <Field label="image" value={result.twitter.image} mono />
              <Field label="site" value={result.twitter.site} />
            </Card>
          </div>

          {result.hreflang.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Hreflang ({result.hreflang.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.hreflang.map((h, i) => (
                  <div key={i} className="rounded border border-app px-2 py-1 text-xs">
                    <span className="font-mono text-accent">{h.hreflang}</span>
                    <span className="ml-2 break-all text-muted-fg">{h.href}</span>
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

function Field({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: string | null;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-app pb-2 last:border-0">
      <div className="min-w-[110px] text-xs uppercase tracking-wider text-muted-fg">{label}</div>
      <div className={`flex-1 break-words text-right text-sm ${mono ? "font-mono text-xs" : ""} ${value ? "" : "text-muted-fg italic"}`}>
        {value ?? "—"}
        {hint && <span className="ml-2 text-[11px] text-muted-fg">({hint})</span>}
      </div>
    </div>
  );
}
