"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { InternalLinkResult } from "@/scrapers/internal-links/types";

type ApiResp =
  | { ok: true; data: { result: InternalLinkResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 80) return "good";
  if (s >= 50) return "warn";
  if (s > 0) return "neutral";
  return "bad";
}

export function LinksForm() {
  const [url, setUrl] = useState("blogy.in");
  const [maxPages, setMaxPages] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InternalLinkResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/internal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages }),
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
              <label className="text-sm font-medium">Start URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max pages</label>
              <input
                type="number"
                min={5}
                max={50}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? `Crawling (≤${maxPages} pages)…` : "Crawl & analyse"}
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
            <Stat label="Pages crawled" value={result.pagesCrawled} />
            <Stat label="Edges" value={result.graph.edgeCount} />
            <Stat label="Orphans" value={result.orphans.length} tone={result.orphans.length === 0 ? "good" : "bad"} />
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Stat label="Coverage" value={result.scores.coverage} tone={tone(result.scores.coverage)} />
            <Stat label="Distribution" value={result.scores.distribution} tone={tone(result.scores.distribution)} />
            <Stat label="Health" value={result.scores.health} tone={tone(result.scores.health)} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Top hubs (most inbound links)
            </h3>
            <ul className="space-y-1 text-sm">
              {result.hubs.map((h) => (
                <li key={h.url} className="flex items-center justify-between border-b border-app py-1 last:border-0">
                  <code className="break-all text-xs">{h.url}</code>
                  <Badge tone="accent">{h.inboundCount}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          {result.orphans.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Orphans ({result.orphans.length})
              </h3>
              <ul className="space-y-1 text-xs font-mono">
                {result.orphans.slice(0, 20).map((u) => (
                  <li key={u} className="break-all">{u}</li>
                ))}
              </ul>
            </Card>
          )}

          {result.brokenLinks.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Broken pages
              </h3>
              <ul className="space-y-1 text-xs">
                {result.brokenLinks.map((b) => (
                  <li key={b.url} className="flex justify-between gap-2">
                    <code className="break-all">{b.url}</code>
                    <Badge tone="bad">{b.status ?? "no resp"}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Recommendations
            </h3>
            {result.recommendations.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Graph is clean.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <Badge tone={r.priority === "high" ? "bad" : r.priority === "medium" ? "warn" : "neutral"}>
                      {r.priority}
                    </Badge>
                    <span>{r.message}</span>
                  </li>
                ))}
              </ul>
            )}
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
