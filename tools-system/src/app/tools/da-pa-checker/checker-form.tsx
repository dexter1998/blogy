"use client";

import { useState } from "react";
import { Button, Card, Stat, Badge, CopyButton } from "@/components/ui";
import type { DaPaResult } from "@/scrapers/da-pa/types";

type ResultRow = { url: string; ok: true; result: DaPaResult } | { url: string; ok: false; error: string };

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
        body: JSON.stringify(
          urls.length === 1 ? { url: urls[0] } : { urls },
        ),
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
      "URL",
      "Domain",
      "DA",
      "PA",
      "Spam",
      "Trust",
      "Confidence",
      "Domain Age (yrs)",
      "Indexed Pages",
      "Ref Domains (est)",
      "Backlinks (est)",
      "HTTPS",
    ];
    const lines = [
      header.join(","),
      ...successful.map((r) => {
        const m = r.result.metrics;
        const s = r.result.scores;
        return [
          JSON.stringify(r.result.url),
          r.result.domain,
          s.da,
          s.pa,
          s.spam,
          s.trust,
          s.confidence,
          m.domainAgeYears ?? "",
          m.indexedPages ?? "",
          m.referringDomainsEstimate ?? "",
          m.backlinkEstimate ?? "",
          m.https ? "yes" : "no",
        ].join(",");
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "da-pa-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const single = rows.length === 1 && rows[0]!.ok ? rows[0]!.result : null;

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
              {loading ? "Analysing…" : "Check DA / PA"}
            </Button>
            {rows.some((r) => r.ok) && (
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

      {single && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="DA" value={single.scores.da} tone={tone(single.scores.da)} />
          <Stat label="PA" value={single.scores.pa} tone={tone(single.scores.pa)} />
          <Stat
            label="Spam"
            value={single.scores.spam}
            tone={single.scores.spam > 30 ? "bad" : "good"}
          />
          <Stat label="Trust" value={single.scores.trust} tone={tone(single.scores.trust)} />
          <Stat
            label="Confidence"
            value={`${single.scores.confidence}%`}
            tone={tone(single.scores.confidence)}
          />
        </div>
      )}

      {single && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Why this score
            </h3>
            <ul className="space-y-2 text-sm">
              {single.explanations.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Metrics
            </h3>
            <dl className="space-y-2 text-sm">
              <Row label="Domain age" value={single.metrics.domainAgeYears !== null ? `${single.metrics.domainAgeYears} yrs` : "—"} />
              <Row label="Indexed pages" value={single.metrics.indexedPages?.toLocaleString() ?? "—"} />
              <Row label="Ref. domains (est)" value={single.metrics.referringDomainsEstimate?.toLocaleString() ?? "—"} />
              <Row label="Backlinks (est)" value={single.metrics.backlinkEstimate?.toLocaleString() ?? "—"} />
              <Row label="HTTPS" value={single.metrics.https ? "Yes" : "No"} />
            </dl>
          </Card>
        </div>
      )}

      {rows.length > 1 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Results ({rows.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-fg">
                <tr className="border-b border-app">
                  <th className="px-2 py-2">URL</th>
                  <th className="px-2 py-2">DA</th>
                  <th className="px-2 py-2">PA</th>
                  <th className="px-2 py-2">Spam</th>
                  <th className="px-2 py-2">Age</th>
                  <th className="px-2 py-2">Indexed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-app last:border-0">
                    <td className="px-2 py-2 font-mono text-xs">{r.url}</td>
                    {r.ok ? (
                      <>
                        <td className="px-2 py-2 tabular-nums"><Badge tone={tone(r.result.scores.da)}>{r.result.scores.da}</Badge></td>
                        <td className="px-2 py-2 tabular-nums"><Badge tone={tone(r.result.scores.pa)}>{r.result.scores.pa}</Badge></td>
                        <td className="px-2 py-2 tabular-nums">{r.result.scores.spam}</td>
                        <td className="px-2 py-2 tabular-nums">{r.result.metrics.domainAgeYears ?? "—"}</td>
                        <td className="px-2 py-2 tabular-nums">{r.result.metrics.indexedPages?.toLocaleString() ?? "—"}</td>
                      </>
                    ) : (
                      <td colSpan={5} className="px-2 py-2 text-rose-600 dark:text-rose-400">
                        {r.error}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {single && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Raw API response
            </h3>
            <CopyButton text={JSON.stringify(single, null, 2)} />
          </div>
          <pre className="code-block max-h-96 overflow-auto text-xs">
{JSON.stringify(single, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-fg">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
