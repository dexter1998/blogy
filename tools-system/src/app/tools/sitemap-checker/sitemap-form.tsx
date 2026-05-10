"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { SitemapResult } from "@/scrapers/sitemap/types";

type ApiResp =
  | { ok: true; data: { result: SitemapResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(n: number): "good" | "warn" | "bad" | "neutral" {
  if (n >= 80) return "good";
  if (n >= 50) return "warn";
  if (n > 0) return "neutral";
  return "bad";
}

export function SitemapForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SitemapResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sitemap", {
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
          <label className="text-sm font-medium">
            Domain or sitemap URL
            <span className="ml-2 text-xs font-normal text-muted-fg">
              auto-discovers via robots.txt
            </span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Crawling…" : "Audit sitemap"}
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
            <Stat label="Total URLs" value={result.stats.totalUrls.toLocaleString()} />
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
            <Stat label="Coverage" value={result.scores.coverage} tone={tone(result.scores.coverage)} />
            <Stat label="Freshness" value={result.scores.freshness} tone={tone(result.scores.freshness)} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Discovered sitemaps
            </h3>
            <ul className="space-y-1 text-xs">
              {result.fetched.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge tone={f.ok ? "good" : "bad"}>{f.ok ? f.type : "fail"}</Badge>
                  <code className="break-all">{f.source}</code>
                  {f.ok && <span className="text-muted-fg">· {f.rawUrlCount} URLs</span>}
                  {f.error && <span className="text-rose-500">· {f.error}</span>}
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Stats</h3>
              <Row label="With lastmod" value={`${result.stats.withLastmod} / ${result.stats.totalUrls}`} />
              <Row label="With changefreq" value={`${result.stats.withChangefreq} / ${result.stats.totalUrls}`} />
              <Row label="With priority" value={`${result.stats.withPriority} / ${result.stats.totalUrls}`} />
              <Row label="Unique hosts" value={result.stats.uniqueHosts} />
              <Row label="Avg path depth" value={result.stats.avgPathDepth} />
              <Row label="Freshness median (days)" value={result.stats.freshnessDays.median ?? "—"} />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Top paths</h3>
              <ul className="space-y-1 text-sm">
                {result.stats.topPaths.map((p) => (
                  <li key={p.path} className="flex justify-between">
                    <code>{p.path}</code>
                    <span className="tabular-nums text-muted-fg">{p.count}</span>
                  </li>
                ))}
                {result.stats.topPaths.length === 0 && (
                  <li className="text-muted-fg italic">No paths.</li>
                )}
              </ul>
            </Card>
          </div>

          {result.issues.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Issues
              </h3>
              <ul className="space-y-2 text-sm">
                {result.issues.map((iss, i) => (
                  <li key={i} className="flex gap-2">
                    <Badge tone={iss.severity === "error" ? "bad" : iss.severity === "warning" ? "warn" : "neutral"}>
                      {iss.severity}
                    </Badge>
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.sample.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Sample ({result.sample.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left uppercase tracking-wider text-muted-fg">
                    <tr><th className="px-2 py-1">URL</th><th className="px-2 py-1">Lastmod</th><th className="px-2 py-1">Pri</th></tr>
                  </thead>
                  <tbody>
                    {result.sample.map((s, i) => (
                      <tr key={i} className="border-t border-app">
                        <td className="px-2 py-1 break-all font-mono">{s.loc}</td>
                        <td className="px-2 py-1 text-muted-fg">{s.lastmod ?? "—"}</td>
                        <td className="px-2 py-1 tabular-nums">{s.priority ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs text-muted-fg">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
