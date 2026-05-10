"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { GeoResult } from "@/scrapers/geo/types";

type ApiResp =
  | { ok: true; data: { result: GeoResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 80) return "good";
  if (s >= 50) return "warn";
  if (s > 0) return "neutral";
  return "bad";
}

export function GeoForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeoResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/geo", {
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
          <label className="text-sm font-medium">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Analysing…" : "Audit GEO"}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Overall" value={result.scores.overall} tone={tone(result.scores.overall)} />
            <Stat label="Citability" value={result.scores.citability} tone={tone(result.scores.citability)} />
            <Stat label="AI Access" value={result.scores.aiAccess} tone={tone(result.scores.aiAccess)} />
            <Stat label="Brand" value={result.scores.brandSignals} tone={tone(result.scores.brandSignals)} />
            <Stat label="Answerability" value={result.scores.answerability} tone={tone(result.scores.answerability)} />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              AI crawler access
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {result.aiCrawlers.map((c) => (
                <div key={c.bot} className="flex items-center justify-between rounded border border-app px-2 py-1">
                  <code className="text-xs">{c.bot}</code>
                  <Badge tone={c.allowed ? "good" : "bad"}>{c.allowed ? "allowed" : "blocked"}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Top citable passages
            </h3>
            {result.passages.length === 0 ? (
              <p className="text-sm italic text-muted-fg">No citable passages detected.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {result.passages.slice(0, 8).map((p, i) => (
                  <li key={i} className="border-b border-app pb-3 last:border-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge tone={tone(p.citabilityScore)}>{p.citabilityScore}</Badge>
                      <Badge>{p.type}</Badge>
                      <span className="text-xs text-muted-fg">{p.wordCount} words</span>
                    </div>
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Brand signals
              </h3>
              <Row label="Brand" value={result.brandSignals.brandName} />
              <Row label="Mentions on page" value={result.brandSignals.brandMentions} />
              <Row label="Organization schema" value={result.brandSignals.organizationSchema ? "yes" : "no"} />
              <Row label="WebSite schema" value={result.brandSignals.websiteSchema ? "yes" : "no"} />
              <Row label="sameAs links" value={result.brandSignals.sameAsLinks.length} />
              {result.brandSignals.sameAsLinks.slice(0, 6).map((s, i) => (
                <div key={i} className="break-all text-xs text-muted-fg">{s}</div>
              ))}
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Answerability
              </h3>
              <Row label="FAQ schema" value={result.answerability.hasFaq ? "yes" : "no"} />
              <Row label="HowTo schema" value={result.answerability.hasHowTo ? "yes" : "no"} />
              <Row label="Question headings" value={result.answerability.questionHeadings} />
              <Row label="Definition lists" value={result.answerability.hasDefinitions} />
              <Row label="Numbered lists" value={result.answerability.hasNumberedLists} />
              <Row label="Bulleted lists" value={result.answerability.hasBulletedLists} />
              <Row label="Tables" value={result.answerability.hasTables} />
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Recommendations
            </h3>
            {result.recommendations.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">All clear.</p>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-1 flex justify-between text-sm">
      <span className="text-muted-fg">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
