/**
 * Multi-engine fan-out runner.
 *
 * Given a query + country + a list of engine IDs, runs every engine in
 * parallel, captures both successes and engine-level errors, and returns
 * the per-engine fetches plus a normalized "merged" view useful for
 * cross-engine analysis (top URL across engines, dedupe, etc).
 *
 * The runner is the only place that knows about engine concurrency,
 * timing, and partial-success handling. Engines stay pure parsers.
 */

import type { CountryEntry } from "./countries";
import type { SearchEngine } from "./engine";
import { resolveEngines } from "./registry";
import { resolveCountry } from "./countries";
import type {
  EngineFetch,
  EngineId,
  PaaItem,
  SearchResult,
} from "./types";

export type MultiEngineRequest = {
  query: string;
  country?: string;
  engines?: EngineId[];
  maxResults?: number;
  signal?: AbortSignal;
};

export type EngineRunStatus = {
  engine: EngineId;
  ok: boolean;
  error?: string;
  durationMs: number;
  resultCount: number;
};

export type MultiEngineResult = {
  query: string;
  country: string;
  language: string;
  engines: EngineRunStatus[];
  perEngine: EngineFetch[];
  merged: SearchResult[];
  mergedPaa: PaaItem[];
  mergedRelated: string[];
};

async function runOne(
  engine: SearchEngine,
  query: string,
  country: CountryEntry,
  maxResults: number,
  signal: AbortSignal | undefined,
): Promise<{ status: EngineRunStatus; fetch: EngineFetch }> {
  const t0 = Date.now();
  try {
    const fetched = await engine.fetch(query, country, { maxResults, signal });
    return {
      status: {
        engine: engine.id,
        ok: fetched.ok,
        ...(fetched.error ? { error: fetched.error } : {}),
        durationMs: Date.now() - t0,
        resultCount: fetched.results.length,
      },
      fetch: fetched,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "engine_failed";
    return {
      status: {
        engine: engine.id,
        ok: false,
        error: message,
        durationMs: Date.now() - t0,
        resultCount: 0,
      },
      fetch: {
        engine: engine.id,
        query,
        country: country.code,
        language: country.language,
        fetchedAt: new Date().toISOString(),
        ok: false,
        error: message,
        results: [],
        paa: [],
        related: [],
        featuredSnippet: null,
        blocks: {
          ads: 0,
          videos: 0,
          images: 0,
          news: 0,
          hasFeaturedSnippet: false,
          hasKnowledgePanel: false,
          hasLocalPack: false,
        },
      },
    };
  }
}

function mergeResults(perEngine: EngineFetch[]): SearchResult[] {
  // Score each unique URL by its average position across engines that
  // returned it (lower = better) and keep the most informative metadata.
  type Acc = {
    url: string;
    title: string;
    displayUrl: string;
    domain: string;
    snippet: string;
    sumPos: number;
    count: number;
    kind: SearchResult["kind"];
  };
  const acc = new Map<string, Acc>();

  for (const fetch of perEngine) {
    for (const r of fetch.results) {
      const key = r.url;
      const cur = acc.get(key);
      if (!cur) {
        acc.set(key, {
          url: r.url,
          title: r.title,
          displayUrl: r.displayUrl,
          domain: r.domain,
          snippet: r.snippet,
          sumPos: r.position,
          count: 1,
          kind: r.kind,
        });
      } else {
        cur.sumPos += r.position;
        cur.count += 1;
        if (!cur.snippet && r.snippet) cur.snippet = r.snippet;
        if (cur.title.length < r.title.length) cur.title = r.title;
      }
    }
  }

  const merged = Array.from(acc.values())
    .map((a) => ({
      avg: a.sumPos / a.count,
      count: a.count,
      data: a,
    }))
    .sort((x, y) => {
      // Prefer URLs that appear in MORE engines, then by avg position.
      if (y.count !== x.count) return y.count - x.count;
      return x.avg - y.avg;
    })
    .map(({ data }, i): SearchResult => ({
      position: i + 1,
      title: data.title,
      url: data.url,
      displayUrl: data.displayUrl,
      domain: data.domain,
      snippet: data.snippet,
      kind: data.kind,
    }));

  return merged;
}

function mergePaa(perEngine: EngineFetch[]): PaaItem[] {
  const seen = new Set<string>();
  const out: PaaItem[] = [];
  for (const f of perEngine) {
    for (const q of f.paa) {
      const norm = q.question.toLowerCase().replace(/[?.!]+$/, "").trim();
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      out.push(q);
    }
  }
  return out;
}

function mergeRelated(perEngine: EngineFetch[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of perEngine) {
    for (const r of f.related) {
      const norm = r.toLowerCase().trim();
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      out.push(r);
    }
  }
  return out;
}

export async function runMultiEngine(req: MultiEngineRequest): Promise<MultiEngineResult> {
  const country = resolveCountry(req.country);
  const engines = resolveEngines(req.engines);
  const maxResults = Math.max(5, Math.min(req.maxResults ?? 25, 50));

  const settled = await Promise.all(
    engines.map((engine) => runOne(engine, req.query, country, maxResults, req.signal)),
  );

  const statuses = settled.map((s) => s.status);
  const perEngine = settled.map((s) => s.fetch);

  return {
    query: req.query,
    country: country.code,
    language: country.language,
    engines: statuses,
    perEngine,
    merged: mergeResults(perEngine),
    mergedPaa: mergePaa(perEngine),
    mergedRelated: mergeRelated(perEngine),
  };
}
