"use client";

import { useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type { HumanizerResult } from "@/scrapers/ai-humanizer/types";

type ApiResp =
  | { ok: true; data: { result: HumanizerResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

const SAMPLE = `In today's fast-paced digital world, it is important to note that businesses must leverage robust solutions to navigate the complexities of modern challenges. Furthermore, by delving into the realm of cutting-edge technologies, organizations can unlock the potential of seamless integrations. Moreover, a myriad of opportunities exists for those who are willing to embrace innovation. In conclusion, it is clear that this transformative journey is a true game-changer.`;

function tone(s: number, invert = false): "good" | "warn" | "bad" | "neutral" {
  const v = invert ? 100 - s : s;
  if (v >= 70) return "good";
  if (v >= 40) return "warn";
  return "bad";
}

export function HumanizerForm() {
  const [text, setText] = useState(SAMPLE);
  const [level, setLevel] = useState<"light" | "medium" | "heavy">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HumanizerResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai-humanizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level }),
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Text to humanize</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as "light" | "medium" | "heavy")}
              className="rounded-lg border border-app bg-app px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-lg border border-app bg-app px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Humanizing…" : "Humanize"}
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
            <Stat label="AI before" value={`${result.scores.aiLikelihoodBefore}%`} tone={tone(result.scores.aiLikelihoodBefore, true)} />
            <Stat label="AI after" value={`${result.scores.aiLikelihoodAfter}%`} tone={tone(result.scores.aiLikelihoodAfter, true)} />
            <Stat label="Readable before" value={result.scores.readabilityBefore} tone={tone(result.scores.readabilityBefore)} />
            <Stat label="Readable after" value={result.scores.readabilityAfter} tone={tone(result.scores.readabilityAfter)} />
          </div>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Humanized output
              </h3>
              <CopyButton text={result.output.text} />
            </div>
            <pre className="whitespace-pre-wrap rounded border border-app bg-app p-3 text-sm">
{result.output.text}
            </pre>
            <p className="mt-2 text-xs text-muted-fg">
              {result.output.wordCount} words · {result.output.sentenceCount} sentences · avg {result.output.avgSentenceWords} words/sentence
            </p>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">Changes</h3>
              <Row label="Contractions applied" value={result.changes.contractionsApplied} />
              <Row label="AI tells removed" value={result.changes.aiTellsRemoved} />
              <Row label="Transitions trimmed" value={result.changes.transitionsTrimmed} />
              <Row label="Sentences restructured" value={result.changes.sentencesRestructured} />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">AI tells detected (in input)</h3>
              {result.aiTells.length === 0 ? (
                <p className="text-sm italic text-muted-fg">No common AI tells found.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {result.aiTells.map((t, i) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <Badge tone="warn">{t.category}</Badge>
                      <code className="text-xs">{t.pattern}</code>
                      <span className="ml-auto tabular-nums text-muted-fg">×{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
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
