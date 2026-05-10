"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { SerpScrapeResult } from "@/scrapers/serp/types";

type ApiResp =
  | { ok: true; data: { result: SerpScrapeResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

export function SerpForm() {
  const [query, setQuery] = useState("best react ui library");
  const [region, setRegion] = useState("us-en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerpScrapeResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/serp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, region }),
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
              <label className="text-sm font-medium">Query</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="how to score backlinks"
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="us-en"
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search SERP"}
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
            <Stat label="Results" value={result.totalResults} tone={result.totalResults > 0 ? "good" : "bad"} />
            <Stat label="Intent" value={result.intent} tone="neutral" />
            <Stat label="Source" value={result.source} tone="neutral" />
            <Stat label="Unique domains" value={result.domains.length} tone="neutral" />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Results
            </h3>
            <ol className="space-y-3 text-sm">
              {result.results.map((r) => (
                <li key={r.position} className="border-b border-app pb-3 last:border-0">
                  <div className="flex items-start gap-2">
                    <Badge>{r.position}</Badge>
                    <div className="min-w-0 flex-1">
                      <a href={r.url} target="_blank" rel="noreferrer" className="block font-semibold text-accent hover:underline">
                        {r.title}
                      </a>
                      <div className="break-all text-xs text-emerald-600 dark:text-emerald-400">{r.displayUrl}</div>
                      <p className="mt-1 text-sm text-muted-fg">{r.snippet}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Top domains
              </h3>
              <ul className="space-y-1 text-sm">
                {result.domains.slice(0, 10).map((d) => (
                  <li key={d.domain} className="flex justify-between">
                    <code>{d.domain}</code>
                    <span className="tabular-nums text-muted-fg">{d.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Related searches
              </h3>
              {result.related.length === 0 ? (
                <p className="text-sm italic text-muted-fg">None.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.related.map((r) => (
                    <Badge key={r} tone="accent">{r}</Badge>
                  ))}
                </div>
              )}
              <h3 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Intent signals
              </h3>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between"><span>How-to / informational</span><span className="tabular-nums">{result.intentSignals.howTo}</span></li>
                <li className="flex justify-between"><span>Branded / navigational</span><span className="tabular-nums">{result.intentSignals.brand}</span></li>
                <li className="flex justify-between"><span>Commercial</span><span className="tabular-nums">{result.intentSignals.commercial}</span></li>
                <li className="flex justify-between"><span>Comparison</span><span className="tabular-nums">{result.intentSignals.comparison}</span></li>
              </ul>
            </Card>
          </div>

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
