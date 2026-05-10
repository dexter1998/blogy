import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "AI Humanizer API Reference",
  description:
    "REST API to humanize AI-generated text. Deterministic transforms + AI-likelihood scoring. No LLM dependency.",
  alternates: { canonical: "/docs-api/ai-humanizer-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/ai-humanizer",
  exampleBody: { text: "It is important to note that, in today's fast-paced world, leveraging robust solutions is a game-changer.", level: "medium" },
  responseExtractor: "data.result.output.text",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        fetchedAt: "2026-05-10T08:14:22.318Z",
        level: "medium",
        input: { text: "…", wordCount: 18, sentenceCount: 1, avgSentenceWords: 18 },
        output: { text: "Today, using strong solutions is a big shift.", wordCount: 9, sentenceCount: 1, avgSentenceWords: 9 },
        changes: { contractionsApplied: 0, sentencesRestructured: 0, aiTellsRemoved: 4, transitionsTrimmed: 0 },
        aiTells: [{ pattern: "It is important to note that", count: 1, category: "phrase" }],
        scores: { aiLikelihoodBefore: 78, aiLikelihoodAfter: 18, readabilityBefore: 42, readabilityAfter: 72 },
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 8, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="AI Humanizer API"
      endpoint="/api/v1/ai-humanizer"
      method="POST"
      playgroundHref="/tools/ai-humanizer"
      intro={
        <>
          <p>
            Pure transformation API. <strong>No LLM dependency</strong> —
            this is deterministic so the same input always produces the
            same output (and is cache-friendly). Internally the engine:
          </p>
          <ul className="list-disc pl-6">
            <li>Detects 30+ phrases LLMs over-use ("delve into", "tapestry of", "in today's fast-paced world").</li>
            <li>Replaces them with simpler equivalents.</li>
            <li>Applies common English contractions ("do not" → "don't").</li>
            <li>At <code>level=medium</code> or <code>heavy</code>, splits sentences over 32 words at conjunction hinges.</li>
            <li>At <code>level=heavy</code>, also leads with the verb on "There is/are/was/were" patterns.</li>
          </ul>
          <p>
            Returns before/after AI-likelihood scores so you can verify
            the transformation reduced AI signature.
          </p>
        </>
      }
      params={[
        { name: "text", type: "string", required: "yes", description: "Text to humanize, 20–20,000 chars." },
        { name: "level", type: "light | medium | heavy", required: "no", description: "Default 'medium'. light = contractions + AI-tell removal only. heavy = + sentence restructure." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "input", type: "{text,wordCount,sentenceCount,avgSentenceWords}", required: "yes", description: "Original-text stats." },
        { name: "output", type: "{text,wordCount,sentenceCount,avgSentenceWords}", required: "yes", description: "Humanized text + stats." },
        { name: "changes", type: "object", required: "yes", description: "Counts: contractions, restructures, AI tells removed, transitions trimmed." },
        { name: "aiTells[]", type: "AiTellMatch[]", required: "yes", description: "Detected AI tells with category + count." },
        { name: "scores.aiLikelihoodBefore/After", type: "0–100", required: "yes", description: "AI-likelihood heuristic score (lower is more human)." },
        { name: "scores.readabilityBefore/After", type: "0–100", required: "yes", description: "Flesch-style readability proxy (higher is easier)." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
