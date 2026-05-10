/**
 * People-Also-Ask scraper.
 *
 * Real PAA boxes are a Google feature and Google blocks scraping. We do
 * the best honest thing instead: surface question-shaped queries and
 * "Related searches" from DuckDuckGo + Bing, then optionally expand each
 * question one level by re-querying it. The `source` field on every
 * question makes the provenance explicit.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { fetchSerp } from "@/scrapers/_shared/serp";
import type { PaaInput, PaaQuestion, PaaResult } from "./types";

const QUESTION_RE = /^(how|what|why|when|where|who|which|is|are|can|do|does|did|will|should|may|could)\b/i;

function isQuestion(text: string): boolean {
  const t = text.trim();
  if (t.length < 6 || t.length > 200) return false;
  return t.endsWith("?") || QUESTION_RE.test(t);
}

function classifyQuestion(q: string): string {
  const m = q.toLowerCase().match(/^(how|what|why|when|where|who|which|is|are|can|do|does|will|should)\b/);
  return m ? m[1]! : "other";
}

function expandSeeds(query: string): string[] {
  const q = query.trim();
  return [
    `how does ${q} work`,
    `what is ${q}`,
    `why is ${q} important`,
    `${q} vs`,
    `best ${q}`,
    `${q} examples`,
  ];
}

async function harvestFromQuery(query: string): Promise<{
  questions: Array<{ q: string; source: "duckduckgo" | "bing" }>;
  related: string[];
}> {
  const ddg = await fetchSerp(query, "us-en");
  const out: Array<{ q: string; source: "duckduckgo" | "bing" }> = [];
  const seen = new Set<string>();
  const add = (q: string, source: "duckduckgo" | "bing") => {
    const trimmed = q.trim().replace(/\s+/g, " ");
    const norm = trimmed.toLowerCase().replace(/[?.!]+$/, "");
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push({ q: trimmed, source });
  };
  for (const r of ddg.related) if (isQuestion(r)) add(r, ddg.source);
  for (const r of ddg.results) {
    if (isQuestion(r.title)) add(r.title, ddg.source);
    // Snippets often start with the question they answer
    const firstSentence = r.snippet.split(/[.?!]/)[0]?.trim();
    if (firstSentence && isQuestion(firstSentence)) add(`${firstSentence}?`, ddg.source);
  }
  return { questions: out, related: ddg.related };
}

export const paaScraper: Scraper<PaaInput, PaaResult> = {
  name: "paa",
  cacheTtlSeconds: Math.min(env.cacheTtlSeconds, 1800),

  cacheKey(input) {
    if (input.fresh) return null;
    return `${input.depth ?? 1}:${input.query.trim().toLowerCase()}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<PaaResult> {
    const depth = input.depth ?? 1;
    const collected: PaaQuestion[] = [];
    const seen = new Set<string>();
    const add = (q: PaaQuestion) => {
      const norm = q.question.toLowerCase().replace(/[?.!]+$/, "").trim();
      if (seen.has(norm)) return false;
      seen.add(norm);
      collected.push(q);
      return true;
    };

    const root = await harvestFromQuery(input.query);
    for (const { q, source } of root.questions) {
      add({ question: q, source, depth: 0, expanded: false });
    }

    // Synthetic expansion seeds, marked with source="expansion" — they
    // are deterministic patterns, not scraped data.
    for (const seed of expandSeeds(input.query)) {
      if (collected.length >= 30) break;
      if (isQuestion(seed)) add({ question: seed, source: "expansion", depth: 0, expanded: false });
    }

    if (depth >= 2) {
      const top = collected.slice(0, 5);
      for (const node of top) {
        if (node.source === "expansion") continue;
        try {
          const child = await harvestFromQuery(node.question);
          for (const c of child.questions.slice(0, 4)) {
            add({ question: c.q, source: c.source, depth: 1, expanded: false });
          }
          node.expanded = true;
        } catch {
          /* skip on failure */
        }
        if (collected.length >= 50) break;
      }
    }

    const types: Record<string, number> = {};
    for (const q of collected) {
      const t = classifyQuestion(q.question);
      types[t] = (types[t] ?? 0) + 1;
    }

    return {
      query: input.query,
      fetchedAt: new Date().toISOString(),
      totalQuestions: collected.length,
      questions: collected,
      related: root.related,
      questionTypes: types,
    };
  },
};
