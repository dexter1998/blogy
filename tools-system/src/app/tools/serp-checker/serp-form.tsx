"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { MultiSelect } from "@/components/multi-select";
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY_OPTION,
  DEFAULT_ENGINE_OPTION_IDS,
  ENGINE_OPTIONS,
} from "@/scrapers/_shared/search/ui-options";
import type { EngineId } from "@/scrapers/_shared/search";
import type { SerpScrapeResult } from "@/scrapers/serp/types";

type ApiResp =
  | { ok: true; data: { result: SerpScrapeResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

const ENGINE_LABEL: Record<EngineId, string> = {
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
};

export function SerpForm() {
  const [query, setQuery] = useState("best react ui library");
  const [country, setCountry] = useState(DEFAULT_COUNTRY_OPTION);
  const [engines, setEngines] = useState<EngineId[]>(DEFAULT_ENGINE_OPTION_IDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerpScrapeResult | null>(null);

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
      const res = await fetch("/api/v1/serp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, country, engines }),
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
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="min-w-0">
              <label className="text-sm font-medium">Query</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="how to score backlinks"
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
            <Stat
              label="Merged results"
              value={result.totalResults}
              tone={result.totalResults > 0 ? "good" : "bad"}
            />
            <Stat label="Intent" value={result.intent} tone="neutral" />
            <Stat label="Country" value={result.country} tone="neutral" />
            <Stat label="Unique domains" value={result.domains.length} tone="neutral" />
          </div>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Engines
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {result.engines.map((e) => (
                <div
                  key={e.engine}
                  className="rounded-lg border border-app bg-app p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ENGINE_LABEL[e.engine]}</span>
                    <Badge tone={e.ok ? "good" : "bad"}>{e.ok ? "ok" : e.error ?? "error"}</Badge>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-fg">
                    <span>{e.resultCount} results</span>
                    <span className="tabular-nums">{e.durationMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Rich blocks (across engines)
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Ads</span>
                <span className="tabular-nums">{result.blocks.ads}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Videos</span>
                <span className="tabular-nums">{result.blocks.videos}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Images</span>
                <span className="tabular-nums">{result.blocks.images}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>News</span>
                <span className="tabular-nums">{result.blocks.news}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Featured snippet</span>
                <span>{result.blocks.hasFeaturedSnippet ? "yes" : "no"}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Knowledge panel</span>
                <span>{result.blocks.hasKnowledgePanel ? "yes" : "no"}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>Local pack</span>
                <span>{result.blocks.hasLocalPack ? "yes" : "no"}</span>
              </li>
              <li className="flex justify-between rounded border border-app px-2 py-1.5">
                <span>PAA questions</span>
                <span className="tabular-nums">{result.paa.length}</span>
              </li>
            </ul>
          </Card>

          {result.featuredSnippets.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Featured snippets
              </h3>
              <ul className="space-y-3 text-sm">
                {result.featuredSnippets.map((s, i) => (
                  <li key={i} className="border-b border-app pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="accent">{s.source}</Badge>
                      <span className="font-medium">{s.title}</span>
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {s.url}
                      </a>
                    )}
                    <p className="mt-1 text-sm text-muted-fg">{s.snippet}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Top ranking pages (merged across engines)
            </h3>
            <div className="overflow-x-auto">
              <ol className="min-w-0 space-y-3 text-sm">
                {result.results.map((r) => (
                  <li key={r.position} className="border-b border-app pb-3 last:border-0">
                    <div className="flex items-start gap-2">
                      <Badge>{r.position}</Badge>
                      <div className="min-w-0 flex-1">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block font-semibold text-accent hover:underline break-words"
                        >
                          {r.title}
                        </a>
                        <div className="break-all text-xs text-emerald-600 dark:text-emerald-400">
                          {r.displayUrl}
                        </div>
                        <p className="mt-1 break-words text-sm text-muted-fg">{r.snippet}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Top domains
              </h3>
              <ul className="space-y-1 text-sm">
                {result.domains.slice(0, 10).map((d) => (
                  <li key={d.domain} className="flex justify-between gap-2">
                    <code className="truncate">{d.domain}</code>
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
                  {result.related.slice(0, 30).map((r) => (
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

          {result.paa.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                People also ask (across engines)
              </h3>
              <ul className="space-y-1.5 text-sm">
                {result.paa.slice(0, 20).map((p, i) => (
                  <li key={i} className="border-b border-app pb-1.5 last:border-0">
                    {p.question}
                  </li>
                ))}
              </ul>
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
