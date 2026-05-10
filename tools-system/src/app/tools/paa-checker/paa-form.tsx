"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { PaaResult } from "@/scrapers/paa/types";

type ApiResp =
  | { ok: true; data: { result: PaaResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

export function PaaForm() {
  const [query, setQuery] = useState("domain authority");
  const [depth, setDepth] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaaResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/paa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, depth }),
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
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value) as 1 | 2)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={1}>1</option>
                <option value={2}>2 (slower)</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate PAA"}
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
            <Stat label="Questions" value={result.totalQuestions} tone="good" />
            <Stat label="How" value={result.questionTypes["how"] ?? 0} />
            <Stat label="What" value={result.questionTypes["what"] ?? 0} />
            <Stat label="Why" value={result.questionTypes["why"] ?? 0} />
          </div>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Questions
              </h3>
              <CopyButton text={result.questions.map((q) => q.question).join("\n")} label="Copy all" />
            </div>
            <ul className="space-y-2 text-sm">
              {result.questions.map((q, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-2 border-b border-app pb-2 last:border-0">
                  <Badge tone={q.depth === 0 ? "accent" : "neutral"}>L{q.depth}</Badge>
                  <Badge>{q.source}</Badge>
                  <span className="flex-1">{q.question}</span>
                </li>
              ))}
            </ul>
          </Card>

          {result.related.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Related searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.related.map((r) => (
                  <Badge key={r}>{r}</Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
