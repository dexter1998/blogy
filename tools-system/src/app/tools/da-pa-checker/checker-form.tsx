"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import type { DaPaResult } from "@/scrapers/da-pa/types";

type ResultRow =
  | { url: string; ok: true; result: DaPaResult }
  | { url: string; ok: false; error: string };

type ApiBulk = { ok: true; data: { results: ResultRow[] }; meta: { durationMs: number } };
type ApiSingle = { ok: true; data: { result: DaPaResult }; meta: { durationMs: number } };
type ApiErr = { ok: false; error: { message: string } };
type ApiResp = ApiBulk | ApiSingle | ApiErr;

function tone(score: number): "good" | "warn" | "bad" | "neutral" {
  if (score >= 70) return "good";
  if (score >= 40) return "warn";
  if (score > 0) return "neutral";
  return "bad";
}

function ageLabel(years: number | null): string {
  if (years === null) return "—";
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} mo`;
  }
  return `${years} yr`;
}

export function CheckerForm() {
  const [input, setInput] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [duration, setDuration] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setRows([]);
    setDuration(null);

    const urls = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setError("Enter at least one domain or URL.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/da-pa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(urls.length === 1 ? { url: urls[0] } : { urls }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) {
        setError(json.error.message);
        setLoading(false);
        return;
      }
      setDuration(json.meta.durationMs);
      if ("result" in json.data) {
        setRows([{ url: json.data.result.url, ok: true, result: json.data.result }]);
      } else {
        setRows(json.data.results);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const successful = rows.filter((r): r is Extract<ResultRow, { ok: true }> => r.ok);
    if (successful.length === 0) return;
    const header = [
      "Web Page",
      "Authority Score",
      "Page Strength",
      "Spam Score",
      "Domain Age",
      "Domain Strength",
      "URL Strength",
      "Stability Score",
    ];
    const lines = [
      header.join(","),
      ...successful.map((r) => {
        const s = r.result.scores;
        return [
          JSON.stringify(r.result.url),
          s.authorityScore,
          s.pageStrength,
          s.spamScore,
          ageLabel(r.result.metrics.domainAgeYears),
          s.domainStrength,
          s.urlStrength,
          s.stabilityScore,
        ].join(",");
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "authority-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const successful = rows.filter((r): r is Extract<ResultRow, { ok: true }> => r.ok);
  const failed = rows.filter((r): r is Extract<ResultRow, { ok: false }> => !r.ok);

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm font-medium">
            Domain or URL
            <span className="ml-2 text-xs font-normal text-muted-fg">
              one per line · max 25
            </span>
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={"blogy.in\nhttps://example.com/blog"}
            className="w-full resize-none rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Analysing…" : "Run check"}
            </Button>
            {successful.length > 0 && (
              <Button type="button" variant="ghost" onClick={exportCsv}>
                Export CSV
              </Button>
            )}
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

      {successful.length > 0 && (
        <>
          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Authority &amp; Page Strength
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-fg">
                  <tr className="border-b border-app">
                    <th className="px-2 py-2">Web Page</th>
                    <th className="px-2 py-2">Authority Score</th>
                    <th className="px-2 py-2">Page Strength</th>
                    <th className="px-2 py-2">Spam Score</th>
                    <th className="px-2 py-2">Domain Age</th>
                  </tr>
                </thead>
                <tbody>
                  {successful.map((r, i) => (
                    <tr key={i} className="border-b border-app last:border-0">
                      <td className="px-2 py-2 font-mono text-xs">{r.url}</td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={tone(r.result.scores.authorityScore)}>
                          {r.result.scores.authorityScore}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={tone(r.result.scores.pageStrength)}>
                          {r.result.scores.pageStrength}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={r.result.scores.spamScore > 30 ? "bad" : "good"}>
                          {r.result.scores.spamScore}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 tabular-nums">
                        {ageLabel(r.result.metrics.domainAgeYears)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Domain &amp; URL Strength
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-fg">
                  <tr className="border-b border-app">
                    <th className="px-2 py-2">Web Page</th>
                    <th className="px-2 py-2">Domain Strength</th>
                    <th className="px-2 py-2">URL Strength</th>
                    <th className="px-2 py-2">Stability Score</th>
                  </tr>
                </thead>
                <tbody>
                  {successful.map((r, i) => (
                    <tr key={i} className="border-b border-app last:border-0">
                      <td className="px-2 py-2 font-mono text-xs">{r.url}</td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={tone(r.result.scores.domainStrength)}>
                          {r.result.scores.domainStrength}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={tone(r.result.scores.urlStrength)}>
                          {r.result.scores.urlStrength}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 tabular-nums">
                        <Badge tone={tone(r.result.scores.stabilityScore)}>
                          {r.result.scores.stabilityScore}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {failed.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Failed ({failed.length})
          </h3>
          <ul className="space-y-1 text-sm">
            {failed.map((r, i) => (
              <li key={i} className="text-rose-600 dark:text-rose-400">
                <span className="font-mono text-xs">{r.url}</span> — {r.error}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
