import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "PAA (People Also Ask) API Reference",
  description:
    "REST API to discover People Also Ask questions across Google, Bing, Yahoo and DuckDuckGo with country targeting, per-engine quotas and recursive expansion.",
  alternates: { canonical: "/docs-api/paa-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/paa",
  exampleBody: {
    query: "domain authority",
    country: "US",
    engines: ["google", "bing", "yahoo", "duckduckgo"],
    perEngineLimit: 10,
    depth: 2,
  },
  responseExtractor: "data.result.questions",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        query: "domain authority",
        country: "US",
        language: "en",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totalQuestions: 33,
        depth: 2,
        perEngineLimit: 10,
        questions: [
          {
            question: "How is domain authority calculated?",
            engine: "google",
            depth: 0,
            classification: "how",
            sourceUrl: "https://example.com/da-guide",
            sourceDomain: "example.com",
          },
          {
            question: "What is a good domain authority score?",
            engine: "bing",
            depth: 0,
            classification: "what",
          },
          {
            question: "Why is domain authority important?",
            engine: "expansion",
            depth: 0,
            classification: "why",
          },
        ],
        byEngine: { google: 10, bing: 10, yahoo: 6, duckduckgo: 0, expansion: 7 },
        byClassification: { how: 6, what: 9, why: 4, is: 3, can: 3 },
      },
    },
    meta: {
      requestId: "req_x9k2lzm",
      apiVersion: "v1",
      durationMs: 2480,
      cached: false,
      rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" },
    },
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
            Multi-engine People-Also-Ask discovery. Reuses the same engine
            adapters as the SERP API, so PAA blocks from Google/Bing/Yahoo are
            captured natively when present, and question-shaped related
            searches and result titles fill the gap when they aren't.
          </p>
          <p>
            Set <code>depth: 2</code> or <code>3</code> to recursively re-query
            the top scraped questions. Each question's <code>engine</code>{" "}
            field tells you which source surfaced it (or <code>expansion</code>
            for synthetic seeds). Each engine — including the synthetic
            expansion source — has its own quota controlled by{" "}
            <code>perEngineLimit</code>, so a noisy engine can't crowd out a
            quieter one.
          </p>
        </>
      }
      params={[
        { name: "query", type: "string", required: "yes", description: "The seed topic." },
        { name: "country", type: "string", required: "no", description: "ISO-3166 alpha-2 country (default US)." },
        { name: "engines", type: "string[]", required: "no", description: "Subset of [google, bing, yahoo, duckduckgo]. Default = all four." },
        { name: "perEngineLimit", type: "number", required: "no", description: "Per-engine quota (1–100, default 10). Each engine — including the synthetic expansion source — gets up to this many questions." },
        { name: "limit", type: "number", required: "no", description: "Optional global cap (1–250) applied after the per-engine quota. Older callers can keep using this; new callers should use perEngineLimit only." },
        { name: "depth", type: "1 | 2 | 3", required: "no", description: "Recursion depth. 1 = no expansion." },
        { name: "includeSeeds", type: "boolean", required: "no", description: "Include synthetic deterministic seeds (default true)." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "totalQuestions", type: "number", required: "yes", description: "Number of unique questions returned." },
        { name: "perEngineLimit", type: "number", required: "yes", description: "Per-engine quota that was applied to this run." },
        { name: "questions[]", type: "{question,answer?,sourceUrl?,sourceDomain?,engine,depth,classification}", required: "yes", description: "Engine = google | bing | yahoo | duckduckgo | expansion." },
        { name: "byEngine", type: "Record<string,number>", required: "yes", description: "Counts per source engine." },
        { name: "byClassification", type: "Record<string,number>", required: "yes", description: "Question-stem distribution (how, what, why, …)." },
        { name: "country / language", type: "string", required: "yes", description: "Resolved country and primary language." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
