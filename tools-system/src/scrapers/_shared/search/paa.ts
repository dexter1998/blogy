/**
 * Reusable PAA (People-Also-Ask) harvester. Sits ON TOP of the engine
 * runner — it doesn't know how individual engines parse, just consumes
 * the normalized output. This is the shared core that both:
 *   - the SERP API (returns PAA as a sidecar)
 *   - the PAA API (the primary surface)
 * call into.
 *
 * Quota model: each engine gets its own per-engine quota (default 10),
 * not a single shared limit. This keeps coverage balanced — a noisy
 * engine can't crowd out a quieter one. `expansion` (synthetic seeds)
 * is a virtual engine and uses the same per-engine quota.
 */

import type { CountryEntry } from "./countries";
import { resolveCountry } from "./countries";
import { resolveEngines } from "./registry";
import { runMultiEngine } from "./runner";
import type { EngineId } from "./types";

export type PaaSource = EngineId | "expansion";

export type HarvestedQuestion = {
  question: string;
  /** Suggested answer snippet (when the engine returned one). */
  answer?: string;
  sourceUrl?: string;
  sourceDomain?: string;
  /** Engine that surfaced the question — or "expansion" for synthetic seeds. */
  engine: PaaSource;
  /** Tree depth: 0 = direct from query, 1 = first expansion, … */
  depth: number;
  /** Question class: "how", "what", "why", … */
  classification: string;
};

export type PaaHarvestRequest = {
  query: string;
  country?: string;
  engines?: EngineId[];
  /**
   * Maximum questions PER engine (post-dedupe). Each engine — including
   * the synthetic "expansion" source — gets up to this many questions.
   * Default 10.
   */
  perEngineLimit?: number;
  /**
   * Legacy global cap. When set, the harvester returns at most this many
   * questions across all engines combined (after the per-engine quota is
   * applied). Older callers can keep using this; new callers should use
   * `perEngineLimit` only.
   */
  limit?: number;
  /** Recursion depth: 1 = no expansion; 2 = expand top results once, … */
  depth?: 1 | 2 | 3;
  /** Whether to also include synthetic deterministic question seeds. */
  includeSeeds?: boolean;
  signal?: AbortSignal;
};

export type PaaHarvestResult = {
  query: string;
  country: string;
  language: string;
  total: number;
  depth: number;
  /** Per-engine quota that was applied. */
  perEngineLimit: number;
  questions: HarvestedQuestion[];
  byEngine: Record<string, number>;
  byClassification: Record<string, number>;
};

const QUESTION_LEAD = /^(how|what|why|when|where|who|which|is|are|can|do|does|did|will|should|may|could)\b/i;

function isQuestionShape(text: string): boolean {
  const t = text.trim();
  if (t.length < 6 || t.length > 220) return false;
  return t.endsWith("?") || QUESTION_LEAD.test(t);
}

function classify(q: string): string {
  const m = q.toLowerCase().match(/^(how|what|why|when|where|who|which|is|are|can|do|does|will|should)\b/);
  return m ? m[1]! : "other";
}

function normalize(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/, "").trim();
}

function expansionSeeds(query: string): string[] {
  const q = query.trim();
  return [
    `how does ${q} work`,
    `what is ${q}`,
    `why is ${q} important`,
    `${q} examples`,
    `best ${q}`,
    `${q} vs alternatives`,
    `how to use ${q}`,
    `benefits of ${q}`,
    `${q} pros and cons`,
    `${q} explained`,
    `${q} for beginners`,
    `${q} step by step`,
  ];
}

type Buckets = Map<PaaSource, HarvestedQuestion[]>;

function bucketTotal(buckets: Buckets): number {
  let n = 0;
  for (const list of buckets.values()) n += list.length;
  return n;
}

function tryAdd(
  buckets: Buckets,
  seen: Set<string>,
  perEngineLimit: number,
  item: HarvestedQuestion,
): boolean {
  const norm = normalize(item.question);
  if (!norm || seen.has(norm)) return false;
  let bucket = buckets.get(item.engine);
  if (!bucket) {
    bucket = [];
    buckets.set(item.engine, bucket);
  }
  if (bucket.length >= perEngineLimit) return false;
  seen.add(norm);
  bucket.push(item);
  return true;
}

/**
 * Harvest a single layer of PAA + question-shaped signals from one query.
 * Adds questions to per-engine buckets, respecting the per-engine quota.
 */
async function harvestOne(
  query: string,
  country: CountryEntry,
  engines: EngineId[],
  depth: number,
  signal: AbortSignal | undefined,
  seen: Set<string>,
  buckets: Buckets,
  perEngineLimit: number,
): Promise<void> {
  const fetched = await runMultiEngine({
    query,
    country: country.code,
    engines,
    signal,
  });

  for (const f of fetched.perEngine) {
    // Native PAA from the engine's "People also ask" block (Google/Bing/Yahoo)
    for (const p of f.paa) {
      tryAdd(buckets, seen, perEngineLimit, {
        question: p.question,
        ...(p.answer ? { answer: p.answer } : {}),
        ...(p.sourceUrl ? { sourceUrl: p.sourceUrl } : {}),
        ...(p.sourceDomain ? { sourceDomain: p.sourceDomain } : {}),
        engine: f.engine,
        depth,
        classification: classify(p.question),
      });
    }
    // Question-shaped related searches
    for (const r of f.related) {
      if (!isQuestionShape(r)) continue;
      tryAdd(buckets, seen, perEngineLimit, {
        question: r,
        engine: f.engine,
        depth,
        classification: classify(r),
      });
    }
    // Question-shaped result titles + snippet leads
    for (const r of f.results) {
      if (isQuestionShape(r.title)) {
        tryAdd(buckets, seen, perEngineLimit, {
          question: r.title.endsWith("?") ? r.title : `${r.title}?`,
          sourceUrl: r.url,
          sourceDomain: r.domain,
          engine: f.engine,
          depth,
          classification: classify(r.title),
        });
      }
      const firstSentence = r.snippet.split(/[.?!]/)[0]?.trim();
      if (firstSentence && isQuestionShape(firstSentence)) {
        tryAdd(buckets, seen, perEngineLimit, {
          question: `${firstSentence}?`,
          sourceUrl: r.url,
          sourceDomain: r.domain,
          engine: f.engine,
          depth,
          classification: classify(firstSentence),
        });
      }
    }
  }
}

export async function harvestPaa(req: PaaHarvestRequest): Promise<PaaHarvestResult> {
  const country = resolveCountry(req.country);
  const enginesResolved = resolveEngines(req.engines);
  const engineIds = enginesResolved.map((e) => e.id);
  const perEngineLimit = Math.max(1, Math.min(req.perEngineLimit ?? 10, 100));
  const depth = (req.depth ?? 1) as 1 | 2 | 3;
  const includeSeeds = req.includeSeeds !== false;
  // Optional global cap; default = no cap beyond per-engine quotas.
  const globalCap = Math.max(
    1,
    Math.min(
      req.limit ?? perEngineLimit * (engineIds.length + (includeSeeds ? 1 : 0)),
      1000,
    ),
  );

  const seen = new Set<string>();
  const buckets: Buckets = new Map();

  // Layer 0: direct query
  await harvestOne(req.query, country, engineIds, 0, req.signal, seen, buckets, perEngineLimit);

  // Synthetic seeds — expansion patterns only, not scraped data.
  if (includeSeeds) {
    for (const seed of expansionSeeds(req.query)) {
      tryAdd(buckets, seen, perEngineLimit, {
        question: seed,
        engine: "expansion",
        depth: 0,
        classification: classify(seed),
      });
    }
  }

  // Layer 1+: recursive expansion of top scraped questions, but only into
  // engine buckets that still have headroom. Skip entirely once every engine
  // is full.
  for (let d = 1; d < depth; d++) {
    const allFull = engineIds.every(
      (id) => (buckets.get(id)?.length ?? 0) >= perEngineLimit,
    );
    if (allFull) break;

    // Use top scraped questions from the previous layer as expansion seeds.
    const prev: HarvestedQuestion[] = [];
    for (const [engine, list] of buckets) {
      if (engine === "expansion") continue;
      for (const q of list) if (q.depth === d - 1) prev.push(q);
    }
    const top = prev.slice(0, Math.min(5, prev.length));
    for (const node of top) {
      try {
        await harvestOne(
          node.question,
          country,
          engineIds,
          d,
          req.signal,
          seen,
          buckets,
          perEngineLimit,
        );
      } catch {
        /* per-node failure is fine — keep going */
      }
    }
  }

  // Flatten in a deterministic engine order: requested engines first
  // (preserving their priority), then expansion seeds last.
  const order: PaaSource[] = [...engineIds, "expansion"];
  const flat: HarvestedQuestion[] = [];
  for (const e of order) {
    const list = buckets.get(e);
    if (list) flat.push(...list);
  }
  // Add any unexpected engine buckets (defensive — shouldn't happen).
  for (const [e, list] of buckets) {
    if (!order.includes(e)) flat.push(...list);
  }

  const trimmed = flat.slice(0, globalCap);

  const byEngine: Record<string, number> = {};
  const byClassification: Record<string, number> = {};
  for (const q of trimmed) {
    byEngine[q.engine] = (byEngine[q.engine] ?? 0) + 1;
    byClassification[q.classification] = (byClassification[q.classification] ?? 0) + 1;
  }

  return {
    query: req.query,
    country: country.code,
    language: country.language,
    total: trimmed.length,
    depth,
    perEngineLimit,
    questions: trimmed,
    byEngine,
    byClassification,
  };
}
