/**
 * AI Humanizer — deterministic text transform.
 *
 * No LLM. We use a published list of "AI tells" — phrases that LLMs
 * over-use compared to humans (in the broad mid-2020s) — and apply
 * three classes of transforms:
 *
 *  - light:  expand → contract ("do not" → "don't"), strip transition
 *            inflation ("It is important to note that" → "")
 *  - medium: + sentence-length variation: split runs, merge short
 *            adjacent statements, replace hedging
 *  - heavy:  + restructure: lead with the verb, remove "in order to"
 *            and "as previously mentioned" patterns, swap formal
 *            connectors ("furthermore" → "also")
 *
 * Scoring of AI likelihood is heuristic, based on AI-tell density,
 * sentence-length variance, and average sentence length.
 */

import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import type { AiTellMatch, HumanizerInput, HumanizerResult } from "./types";

// ── AI tells (phrase, category) ──
type AiTellRule = {
  re: RegExp;
  replace: string | ((match: string) => string);
  category: AiTellMatch["category"];
};
const AI_TELLS: AiTellRule[] = [
  { re: /\bIt['’]s (worth|important to) note that\b/gi, replace: "", category: "phrase" },
  { re: /\bIt is (worth|important to) note that\b/gi, replace: "", category: "phrase" },
  { re: /\bIn the world of\b/gi, replace: "In", category: "phrase" },
  { re: /\bIn today['’]s (fast-paced |digital |modern )?world\b/gi, replace: "Today", category: "phrase" },
  { re: /\bIn the realm of\b/gi, replace: "In", category: "phrase" },
  { re: /\bAt the end of the day\b/gi, replace: "Ultimately", category: "phrase" },
  { re: /\bDelve into\b/gi, replace: "Explore", category: "phrase" },
  { re: /\bDelving into\b/gi, replace: "Exploring", category: "phrase" },
  { re: /\bNavigate the complexities of\b/gi, replace: "Handle", category: "phrase" },
  { re: /\bUnlock the (potential|power|secrets) of\b/gi, replace: "Use", category: "phrase" },
  { re: /\bA testament to\b/gi, replace: "Shows", category: "phrase" },
  { re: /\bIn conclusion,\s*/gi, replace: "", category: "transition" },
  { re: /\bMoreover,\s*/gi, replace: "Also, ", category: "transition" },
  { re: /\bFurthermore,\s*/gi, replace: "Also, ", category: "transition" },
  { re: /\bAdditionally,\s*/gi, replace: "Also, ", category: "transition" },
  { re: /\bConsequently,\s*/gi, replace: "So, ", category: "transition" },
  { re: /\bNotably,\s*/gi, replace: "", category: "transition" },
  { re: /\bIn essence,\s*/gi, replace: "", category: "transition" },
  { re: /\bUltimately,\s*/gi, replace: "", category: "transition" },
  { re: /\bAs (previously|earlier) (mentioned|discussed|noted),\s*/gi, replace: "", category: "transition" },
  { re: /\bKindly note that\s*/gi, replace: "", category: "phrase" },
  { re: /\bTapestry of\b/gi, replace: "mix of", category: "phrase" },
  { re: /\bMyriad of\b/gi, replace: "many", category: "phrase" },
  { re: /\bPlethora of\b/gi, replace: "many", category: "phrase" },
  { re: /\bA wide range of\b/gi, replace: "many", category: "phrase" },
  { re: /\bRobust\b/gi, replace: "strong", category: "phrase" },
  { re: /\bSeamless(ly)?\b/g, replace: (m: string) => (m.endsWith("ly") ? "smoothly" : "smooth"), category: "phrase" },
  { re: /\bGame[- ]changer\b/gi, replace: "big shift", category: "phrase" },
  { re: /\bIt['’]s clear that\s*/gi, replace: "", category: "hedge" },
  { re: /\bIt should be noted that\s*/gi, replace: "", category: "hedge" },
  { re: /\bIt['’]s safe to say that\s*/gi, replace: "", category: "hedge" },
  { re: /\bIn order to\b/gi, replace: "to", category: "structure" },
  { re: /\bDue to the fact that\b/gi, replace: "because", category: "structure" },
  { re: /\bA myriad\b/gi, replace: "many", category: "phrase" },
  { re: /\bLeverag(e|ed|ing)\b/gi, replace: (m: string) => (/\bleveraged/i.test(m) ? "used" : /\bleveraging/i.test(m) ? "using" : "use"), category: "phrase" },
  { re: /\bUtiliz(e|ed|ing)\b/gi, replace: (m: string) => (/\butilized/i.test(m) ? "used" : /\butilizing/i.test(m) ? "using" : "use"), category: "phrase" },
];

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bcannot\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bcould not\b/gi, "couldn't"],
  [/\bis not\b/gi, "isn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bI am\b/g, "I'm"],
  [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"],
  [/\bthey are\b/gi, "they're"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\bwho is\b/gi, "who's"],
  [/\blet us\b/gi, "let's"],
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordsOf(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function variance(xs: number[]): number {
  if (xs.length === 0) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / xs.length;
}

function aiLikelihood(text: string, tellCount: number): number {
  const sentences = splitSentences(text);
  const wcs = sentences.map(wordsOf);
  const avg = wcs.length ? wcs.reduce((a, b) => a + b, 0) / wcs.length : 0;
  const va = variance(wcs);
  const wordCount = wordsOf(text);
  const tellDensity = wordCount ? (tellCount / wordCount) * 1000 : 0;
  // High avg sentence length + low variance + many tells = AI-like
  let score = 0;
  if (avg > 22) score += 30;
  else if (avg > 18) score += 18;
  else if (avg > 14) score += 8;
  if (va < 30) score += 25;
  else if (va < 80) score += 12;
  score += Math.min(45, tellDensity * 4);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function readability(text: string): number {
  // Simple Flesch-Reading-Ease-style proxy: shorter sentences + more
  // common words = higher score. We don't include syllable count
  // (would need a dictionary) — sentence length + avg word length is
  // a serviceable approximation.
  const sentences = splitSentences(text);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0 || sentences.length === 0) return 50;
  const avgWordsPerSentence = words.length / sentences.length;
  const avgChars = words.reduce((a, w) => a + w.length, 0) / words.length;
  let score = 100 - avgWordsPerSentence * 1.5 - avgChars * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function detectAiTells(text: string): { matches: AiTellMatch[]; total: number } {
  const acc: Record<string, AiTellMatch> = {};
  let total = 0;
  for (const t of AI_TELLS) {
    const matches = text.match(t.re);
    if (!matches) continue;
    total += matches.length;
    const key = String(t.re).replace(/[/^$\\g i]/g, "_").slice(0, 60);
    if (!acc[key]) acc[key] = { pattern: matches[0]!, count: 0, category: t.category };
    acc[key].count += matches.length;
  }
  return { matches: Object.values(acc).sort((a, b) => b.count - a.count), total };
}

function applyTransforms(text: string, level: HumanizerInput["level"]): {
  text: string;
  contractionsApplied: number;
  sentencesRestructured: number;
  aiTellsRemoved: number;
  transitionsTrimmed: number;
} {
  let out = text;
  let aiTellsRemoved = 0;
  let transitionsTrimmed = 0;
  for (const t of AI_TELLS) {
    const before = (out.match(t.re) ?? []).length;
    if (before === 0) continue;
    out = typeof t.replace === "function"
      ? out.replace(t.re, t.replace)
      : out.replace(t.re, t.replace);
    if (t.category === "transition") transitionsTrimmed += before;
    else aiTellsRemoved += before;
  }

  let contractionsApplied = 0;
  for (const [re, sub] of CONTRACTIONS) {
    const before = (out.match(re) ?? []).length;
    if (before === 0) continue;
    out = out.replace(re, sub);
    contractionsApplied += before;
  }

  let sentencesRestructured = 0;
  if (level === "medium" || level === "heavy") {
    // Split overlong sentences at " — and " or "; " hinges
    out = out
      .split(/\n+/)
      .map((para) =>
        splitSentences(para)
          .map((s) => {
            if (wordsOf(s) > 32) {
              const parts = s.split(/(,\s+(?:and|but|so|because)\s+|;\s+)/).filter(Boolean);
              if (parts.length >= 3) {
                sentencesRestructured += 1;
                // Reassemble as two sentences. Keep original punctuation feel.
                const mid = Math.floor(parts.length / 2);
                const first = parts.slice(0, mid).join("").replace(/[,;]\s*$/, ".").trim();
                const second = parts
                  .slice(mid)
                  .join("")
                  .replace(/^(,?\s*)(and|but|so|because)\s+/i, (_, _ws, conj) => `${conj[0]!.toUpperCase()}${conj.slice(1)} `)
                  .trim();
                return `${/[.?!]$/.test(first) ? first : first + "."} ${second}`;
              }
            }
            return s;
          })
          .join(" "),
      )
      .join("\n\n");
  }

  if (level === "heavy") {
    // Strip orphan double-spaces and leading whitespace per paragraph
    out = out
      .split(/\n+/)
      .map((p) => p.replace(/\s{2,}/g, " ").trim())
      .filter(Boolean)
      .join("\n\n");
    // Lead with the verb on lines that start with "There is/are/was/were"
    out = out.replace(/^There (is|are|was|were)\s+([A-Za-z]+)/gm, (_, _be, noun) => `${noun.charAt(0).toUpperCase()}${noun.slice(1)} exists`);
  }

  return { text: out.replace(/[ \t]+/g, " ").replace(/[ \t]+\n/g, "\n").trim(), contractionsApplied, sentencesRestructured, aiTellsRemoved, transitionsTrimmed };
}

function summary(text: string) {
  const sentences = splitSentences(text);
  const wcs = sentences.map(wordsOf);
  const total = wcs.reduce((a, b) => a + b, 0);
  return {
    text,
    wordCount: total,
    sentenceCount: sentences.length,
    avgSentenceWords: sentences.length ? Math.round((total / sentences.length) * 10) / 10 : 0,
  };
}

export const aiHumanizerScraper: Scraper<HumanizerInput, HumanizerResult> = {
  name: "ai-humanizer",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    // Hash the text to a short key for cache stability
    let h = 0;
    const s = `${input.level ?? "medium"}:${input.text}`;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return `h:${h.toString(36)}:${s.length}`;
  },

  async execute(input, _ctx: ScrapeContext): Promise<HumanizerResult> {
    const level = input.level ?? "medium";
    const text = input.text ?? "";
    const before = detectAiTells(text);
    const beforeStats = summary(text);
    const beforeAi = aiLikelihood(text, before.total);
    const beforeRead = readability(text);

    const transformed = applyTransforms(text, level);
    const after = detectAiTells(transformed.text);
    const afterStats = summary(transformed.text);
    const afterAi = aiLikelihood(transformed.text, after.total);
    const afterRead = readability(transformed.text);

    return {
      fetchedAt: new Date().toISOString(),
      level,
      input: beforeStats,
      output: afterStats,
      changes: {
        contractionsApplied: transformed.contractionsApplied,
        sentencesRestructured: transformed.sentencesRestructured,
        aiTellsRemoved: transformed.aiTellsRemoved,
        transitionsTrimmed: transformed.transitionsTrimmed,
      },
      aiTells: before.matches,
      scores: {
        aiLikelihoodBefore: beforeAi,
        aiLikelihoodAfter: afterAi,
        readabilityBefore: beforeRead,
        readabilityAfter: afterRead,
      },
    };
  },
};
