import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "SERP API Reference",
  description:
    "REST API for live search-engine result pages. DuckDuckGo primary, Bing fallback. Includes intent classification.",
  alternates: { canonical: "/docs-api/serp-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/serp",
  exampleBody: { query: "best react ui library" },
  responseExtractor: "data.result.results",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        query: "best react ui library",
        region: "us-en",
        source: "duckduckgo",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totalResults: 10,
        results: [
          { position: 1, title: "10 Best React UI Libraries — 2026", url: "https://example.com/best-react-ui", displayUrl: "example.com/best-react-ui", snippet: "We compared the top React UI libraries…" },
        ],
        related: ["react component libraries", "shadcn/ui vs mui", "react ui kit"],
        intent: "commercial",
        intentSignals: { howTo: 1, brand: 0, commercial: 2, comparison: 6 },
        domains: [{ domain: "example.com", count: 2 }],
        ok: true,
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 1284, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="SERP API"
      endpoint="/api/v1/serp"
      method="POST"
      playgroundHref="/tools/serp-checker"
      intro={
        <>
          <p>
            Live search-engine results for any query. DuckDuckGo HTML is the
            primary source (no API key, server-rendered, stable parser). If
            DuckDuckGo returns nothing, Bing HTML is used as fallback. The
            <code>source</code> field tells you which engine answered.
          </p>
          <p>
            We do not scrape Google directly: it gates with reCAPTCHA, so the
            data would be unreliable in production.
          </p>
        </>
      }
      params={[
        { name: "query", type: "string", required: "yes", description: "The search query (1–200 chars)." },
        { name: "region", type: "string", required: "no", description: "DuckDuckGo region code, default us-en (e.g. uk-en, in-en)." },
        { name: "queries", type: "string[]", required: "alt", description: "Bulk: up to 10 queries in one call." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass the 10-minute SERP cache." },
      ]}
      responseFields={[
        { name: "results[]", type: "{position,title,url,displayUrl,snippet}", required: "yes", description: "Top organic results in order." },
        { name: "related[]", type: "string[]", required: "yes", description: "'Related searches' shown by the engine, when available." },
        { name: "intent", type: "informational | navigational | transactional | commercial | mixed", required: "yes", description: "SERP-derived intent classification." },
        { name: "intentSignals", type: "{howTo,brand,commercial,comparison}", required: "yes", description: "Per-signal counts that fed the intent classifier." },
        { name: "domains[]", type: "{domain,count}[]", required: "yes", description: "Domain frequency in the result list." },
        { name: "source", type: "duckduckgo | bing", required: "yes", description: "Which engine produced the data." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
