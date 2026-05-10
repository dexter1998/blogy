import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "PAA (People Also Ask) API Reference",
  description:
    "REST API to discover question-shaped queries from DuckDuckGo + Bing related searches.",
  alternates: { canonical: "/docs-api/paa-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/paa",
  exampleBody: { query: "domain authority", depth: 2 },
  responseExtractor: "data.result.questions",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        query: "domain authority",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totalQuestions: 18,
        questions: [
          { question: "How is domain authority calculated?", source: "duckduckgo", depth: 0, expanded: true },
          { question: "What is a good domain authority score?", source: "duckduckgo", depth: 0, expanded: false },
          { question: "Why does domain authority matter for SEO?", source: "expansion", depth: 0, expanded: false },
        ],
        related: ["page authority", "domain authority score", "url strength"],
        questionTypes: { how: 4, what: 6, why: 3, is: 2, can: 3 },
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 1842, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="PAA API"
      endpoint="/api/v1/paa"
      method="POST"
      playgroundHref="/tools/paa-checker"
      intro={
        <>
          <p>
            Discover question-shaped queries around a topic. We surface
            related searches and question-shaped result titles from DuckDuckGo
            (with Bing fallback) and add a small set of deterministic
            expansion seeds (<code>how</code>, <code>what</code>,{" "}
            <code>why</code>, <code>vs</code>, <code>best</code>,{" "}
            <code>examples</code>).
          </p>
          <p>
            <code>depth: 2</code> re-queries the top 5 surfaced questions one
            more level. Each question's <code>source</code> field tells you
            where it came from so you can filter scraped vs synthesised.
          </p>
        </>
      }
      params={[
        { name: "query", type: "string", required: "yes", description: "The seed topic." },
        { name: "depth", type: "1 | 2", required: "no", description: "1 (default) for one pass, 2 to expand top results." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "totalQuestions", type: "number", required: "yes", description: "Number of unique questions returned." },
        { name: "questions[]", type: "{question,source,depth,expanded}", required: "yes", description: "Source = duckduckgo, bing, wikipedia, or expansion." },
        { name: "related[]", type: "string[]", required: "yes", description: "Engine-suggested related searches." },
        { name: "questionTypes", type: "Record<string,number>", required: "yes", description: "Question-stem distribution (how, what, why, …)." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
