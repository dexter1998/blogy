/**
 * Reusable PAA (People-Also-Ask) harvester. Sits ON TOP of the engine
 * runner — it doesn't know how individual engines parse, just consumes
 * the normalized output. This is the shared core that both:
 *   - the SERP API (returns PAA as a sidecar)
 *   - the PAA API (the primary surface)
 * call into.
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
  /** Maximum questions to return (post-dedupe). */
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
  ];
}

/**
 * Harvest a single layer of PAA + question-shaped signals from one query.
 * Returned questions are normalized and deduped against `seen`.
 */
async function harvestOne(
  query: string,
  country: CountryEntry,
  engines: EngineId[],
  depth: number,
  signal: AbortSignal | undefined,
  seen: Set<string>,
): Promise<HarvestedQuestion[]> {
  const out: HarvestedQuestion[] = [];
  const add = (item: HarvestedQuestion) => {
    const norm = normalize(item.question);
    if (!norm || seen.has(norm)) return false;
    seen.add(norm);
    out.push(item);
    return true;
  };

  const fetched = await runMultiEngine({
    query,
    country: country.code,
    engines,
    signal,
  });

  for (const f of fetched.perEngine) {
    // Native PAA from the engine's "People also ask" block (Google/Bing/Yahoo)
    for (const p of f.paa) {
      add({
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
      if (isQuestionShape(r)) {
        add({
          question: r,
          engine: f.engine,
          depth,
          classification: classify(r),
        });
      }
    }
    // Question-shaped result titles
    for (const r of f.results) {
      if (isQuestionShape(r.title)) {
        add({
          question: r.title.endsWith("?") ? r.title : `${r.title}?`,
          sourceUrl: r.url,
          sourceDomain: r.domain,
          engine: f.engine,
          depth,
          classification: classify(r.title),
        });
      }
      // Snippets occasionally start with the question they answer
      const firstSentence = r.snippet.split(/[.?!]/)[0]?.trim();
      if (firstSentence && isQuestionShape(firstSentence)) {
        add({
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
  return out;
}

export async function harvestPaa(req: PaaHarvestRequest): Promise<PaaHarvestResult> {
  const country = resolveCountry(req.country);
  const enginesResolved = resolveEngines(req.engines);
  const engineIds = enginesResolved.map((e) => e.id);
  const limit = Math.max(1, Math.min(req.limit ?? 25, 250));
  const depth = (req.depth ?? 1) as 1 | 2 | 3;
  const includeSeeds = req.includeSeeds !== false;

  const seen = new Set<string>();
  const collected: HarvestedQuestion[] = [];

  // Layer 0: direct query
  const root = await harvestOne(req.query, country, engineIds, 0, req.signal, seen);
  collected.push(...root);

  // Synthetic seeds — expansion patterns only, not scraped data.
  if (includeSeeds) {
    for (const seed of expansionSeeds(req.query)) {
      if (collected.length >= limit) break;
      const norm = normalize(seed);
      if (seen.has(norm)) continue;
      seen.add(norm);
      collected.push({
        question: seed,
        engine: "expansion",
        depth: 0,
        classification: classify(seed),
      });
    }
  }

  // Layer 1+: recursive expansion of top scraped questions.
  for (let d = 1; d < depth && collected.length < limit; d++) {
    const candidates = collected.filter(
      (q) => q.depth === d - 1 && q.engine !== "expansion",
    );
    const top = candidates.slice(0, Math.min(5, candidates.length));
    for (const node of top) {
      if (collected.length >= limit) break;
      try {
        const children = await harvestOne(
          node.question,
          country,
          engineIds,
          d,
          req.signal,
          seen,
        );
        const room = limit - collected.length;
        collected.push(...children.slice(0, Math.max(0, room)));
      } catch {
        /* per-node failure is fine — keep going */
      }
    }
  }

  const trimmed = collected.slice(0, limit);

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
    questions: trimmed,
    byEngine,
    byClassification,
  };
}
