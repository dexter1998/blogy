"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { MultiSelect } from "@/components/multi-select";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY_OPTION,
  DEFAULT_ENGINE_OPTION_IDS,
  DEFAULT_PAA_LIMIT,
  ENGINE_OPTIONS,
  PAA_LIMIT_OPTIONS,
} from "@/scrapers/_shared/search/ui-options";
import type { EngineId } from "@/scrapers/_shared/search";
import type { PaaResult } from "@/scrapers/paa/types";

type ApiResp =
  | { ok: true; data: { result: PaaResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function PaaForm() {
  const [query, setQuery] = useState("domain authority");
  const [country, setCountry] = useState(DEFAULT_COUNTRY_OPTION);
  const [engines, setEngines] = useState<EngineId[]>(DEFAULT_ENGINE_OPTION_IDS);
  const [limit, setLimit] = useState<number>(DEFAULT_PAA_LIMIT);
  const [depth, setDepth] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaaResult | null>(null);

  const engineMSOptions = useMemo(
    () => ENGINE_OPTIONS.map((e) => ({ value: e.id, label: e.label })),
    [],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (engines.length === 0) {
      setError("Pick at least one search engine.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/paa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, country, engines, limit, depth }),
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

  function exportCsv() {
    if (!result) return;
    const header = ["question", "answer", "source_url", "source_domain", "depth", "engine", "classification"];
    const rows = result.questions.map((q) => [
      q.question,
      q.answer ?? "",
      q.sourceUrl ?? "",
      q.sourceDomain ?? "",
      String(q.depth),
      q.engine,
      q.classification,
    ]);
    downloadCsv(`paa-${result.query.replace(/[^a-z0-9]+/gi, "-")}-${result.country}.csv`, [header, ...rows]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_180px_180px_140px_120px]">
            <div className="min-w-0">
              <label className="text-sm font-medium">Topic</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium">Search engines</label>
              <div className="mt-1">
                <MultiSelect<EngineId>
                  options={engineMSOptions}
                  selected={engines}
                  onChange={setEngines}
                  placeholder="Pick engines"
                />
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium">Questions</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {PAA_LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium">Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value) as 1 | 2 | 3)}
                className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate PAA"}
            </Button>
            {result && (
              <Button type="button" variant="ghost" onClick={exportCsv}>
                Export CSV
              </Button>
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
            <Stat label="Questions" value={result.totalQuestions} tone="good" />
            <Stat label="Depth" value={result.depth} />
            <Stat label="Country" value={result.country} />
            <Stat
              label="Engines used"
              value={Object.keys(result.byEngine).filter((e) => e !== "expansion").length}
            />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Source mix
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {Object.entries(result.byEngine).map(([engine, n]) => (
                <li
                  key={engine}
                  className="flex justify-between rounded border border-app px-2 py-1.5"
                >
                  <span className="capitalize">{engine}</span>
                  <span className="tabular-nums text-muted-fg">{n}</span>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 mt-5 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Question types
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {Object.entries(result.byClassification).map(([cls, n]) => (
                <li
                  key={cls}
                  className="flex justify-between rounded border border-app px-2 py-1.5"
                >
                  <span className="capitalize">{cls}</span>
                  <span className="tabular-nums text-muted-fg">{n}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Questions
              </h3>
              <CopyButton
                text={result.questions.map((q) => q.question).join("\n")}
                label="Copy all"
              />
            </div>
            <div className="overflow-x-auto">
              <ul className="min-w-0 space-y-2 text-sm">
                {result.questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-start gap-2 border-b border-app pb-2 last:border-0"
                  >
                    <Badge tone={q.depth === 0 ? "accent" : "neutral"}>L{q.depth}</Badge>
                    <Badge>{q.engine}</Badge>
                    <Badge tone="neutral">{q.classification}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="break-words font-medium">{q.question}</div>
                      {q.answer && (
                        <p className="mt-1 break-words text-xs text-muted-fg">{q.answer}</p>
                      )}
                      {q.sourceUrl && (
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 block break-all text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          {q.sourceDomain ?? q.sourceUrl}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
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
