"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { AiReadinessResult } from "@/scrapers/ai-readiness/types";

type ApiResp =
  | { ok: true; data: { result: AiReadinessResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 80) return "good";
  if (s >= 50) return "warn";
  if (s > 0) return "neutral";
  return "bad";
}

export function AiReadinessForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiReadinessResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai-readiness", {
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
            {loading ? "Scoring…" : "Score AI readiness"}
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
            <Stat label="E-E-A-T" value={result.scores.eeat} tone={tone(result.scores.eeat)} />
            <Stat label="Structure" value={result.scores.structure} tone={tone(result.scores.structure)} />
            <Stat label="Machine" value={result.scores.machineReadability} tone={tone(result.scores.machineReadability)} />
            <Stat label="Freshness" value={result.scores.freshness} tone={tone(result.scores.freshness)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">E-E-A-T</h3>
              <SignalRow label="Author byline" yes={result.eeat.hasAuthorByline} />
              <SignalRow label="Author bio" yes={result.eeat.hasAuthorBio} />
              <SignalRow label="Published date" yes={result.eeat.hasPublishedDate} />
              <SignalRow label="Modified date" yes={result.eeat.hasModifiedDate} />
              <SignalRow label="Article schema" yes={result.eeat.hasArticleSchema} />
              <SignalRow label="Organization schema" yes={result.eeat.hasOrganizationSchema} />
              <SignalRow label="Review/Rating schema" yes={result.eeat.hasReviewSchema} />
              <SignalRow label="External citations" value={result.eeat.externalCitations} />
              <SignalRow label="Age (days)" value={result.eeat.ageDays ?? "—"} />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Structure</h3>
              <SignalRow label="<h1> present" yes={result.structure.hasH1} />
              <SignalRow label="<h2> count" value={result.structure.h2Count} />
              <SignalRow label="Paragraphs" value={result.structure.paragraphCount} />
              <SignalRow label="Avg paragraph words" value={result.structure.avgParagraphWords} />
              <SignalRow label="FAQPage schema" yes={result.structure.hasFaqSchema} />
              <SignalRow label="HowTo schema" yes={result.structure.hasHowToSchema} />
              <SignalRow label="Breadcrumb schema" yes={result.structure.hasBreadcrumbSchema} />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Machine readability</h3>
              <SignalRow label="Canonical" value={result.machineReadability.canonical ?? "—"} mono />
              <SignalRow label="Meta description" yes={result.machineReadability.hasMetaDescription} />
              <SignalRow label="Open Graph" yes={result.machineReadability.hasOpenGraph} />
              <SignalRow label="Twitter Card" yes={result.machineReadability.hasTwitterCard} />
              <SignalRow label="JSON-LD" yes={result.machineReadability.hasJsonLd} />
              <SignalRow label="/llms.txt" yes={result.machineReadability.hasLlmsTxt} />
              <SignalRow label="robots allow" yes={result.machineReadability.hasRobotsAllow} />
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Recommendations
            </h3>
            {result.recommendations.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Page is well-prepared for AI search.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <Badge tone={rec.priority === "high" ? "bad" : rec.priority === "medium" ? "warn" : "neutral"}>
                      {rec.priority}
                    </Badge>
                    <span>{rec.message}</span>
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

function SignalRow({
  label,
  yes,
  value,
  mono,
}: {
  label: string;
  yes?: boolean;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 border-b border-app pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-fg">{label}</span>
      {value !== undefined ? (
        <span className={`text-sm font-medium ${mono ? "break-all font-mono text-xs" : ""}`}>{value}</span>
      ) : (
        <Badge tone={yes ? "good" : "bad"}>{yes ? "yes" : "no"}</Badge>
      )}
    </div>
  );
}
