"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { BacklinkResult } from "@/scrapers/backlinks/types";

type ApiResp =
  | { ok: true; data: { result: BacklinkResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

export function BacklinksForm() {
  const [url, setUrl] = useState("blogy.in");
  const [verify, setVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacklinkResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, verify, maxVerify: 10 }),
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
          <div>
            <label className="text-sm font-medium">Target URL or domain</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={verify} onChange={(e) => setVerify(e.target.checked)} />
            Verify top 10 candidates live (slower, captures anchor text + rel)
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Querying Common Crawl…" : "Discover backlinks"}
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
            <Stat label="Candidates" value={result.totalCandidates} />
            <Stat label="Backlinks" value={result.totalBacklinks} />
            <Stat label="Ref. domains" value={result.uniqueReferringDomains} />
            <Stat label="Verified" value={result.verifiedCount} tone={result.verifiedCount > 0 ? "good" : "neutral"} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Top referring domains
            </h3>
            <ul className="space-y-1 text-sm">
              {result.topDomains.map((d) => (
                <li key={d.domain} className="flex justify-between">
                  <code>{d.domain}</code>
                  <Badge tone="accent">{d.count}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Backlinks ({result.backlinks.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left uppercase tracking-wider text-muted-fg">
                  <tr>
                    <th className="px-2 py-1">Source</th>
                    <th className="px-2 py-1">Origin</th>
                    <th className="px-2 py-1">Anchor</th>
                    <th className="px-2 py-1">rel</th>
                  </tr>
                </thead>
                <tbody>
                  {result.backlinks.slice(0, 30).map((b, i) => (
                    <tr key={i} className="border-t border-app">
                      <td className="break-all px-2 py-1 font-mono">
                        <a href={b.source} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          {b.source}
                        </a>
                      </td>
                      <td className="px-2 py-1">
                        <Badge tone={b.origin === "verified" ? "good" : "neutral"}>{b.origin}</Badge>
                      </td>
                      <td className="px-2 py-1">{b.anchorText ?? "—"}</td>
                      <td className="px-2 py-1 text-muted-fg">{b.rel ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.truncated && (
              <p className="mt-2 text-xs text-muted-fg">Hit hard cap of 200 candidates — data truncated.</p>
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
