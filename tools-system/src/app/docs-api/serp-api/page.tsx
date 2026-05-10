import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "SERP API Reference",
  description:
    "REST API for multi-engine, country-localized search-engine result pages. Google, Bing, Yahoo, DuckDuckGo. Featured snippets, PAA, ads, intent classification.",
  alternates: { canonical: "/docs-api/serp-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/serp",
  exampleBody: {
    query: "best react ui library",
    country: "US",
    engines: ["google", "bing", "yahoo", "duckduckgo"],
  },
  responseExtractor: "data.result.results",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        query: "best react ui library",
        country: "US",
        language: "en",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totalResults: 18,
        results: [
          {
            position: 1,
            title: "10 Best React UI Libraries — 2026",
            url: "https://example.com/best-react-ui",
            displayUrl: "example.com/best-react-ui",
            domain: "example.com",
            snippet: "We compared the top React UI libraries…",
            kind: "organic",
          },
        ],
        engines: [
          { engine: "google", ok: true, durationMs: 612, resultCount: 10 },
          { engine: "bing", ok: true, durationMs: 488, resultCount: 10 },
          { engine: "yahoo", ok: true, durationMs: 521, resultCount: 9 },
          { engine: "duckduckgo", ok: true, durationMs: 433, resultCount: 10 },
        ],
        featuredSnippets: [
          {
            source: "google",
            title: "Best React UI Library",
            url: "https://example.com/best-react-ui",
            domain: "example.com",
            snippet: "shadcn/ui is the most-recommended…",
          },
        ],
        paa: [{ question: "What is the best React UI library?" }],
        related: ["react component libraries", "shadcn/ui vs mui"],
        blocks: {
          ads: 4,
          videos: 2,
          images: 6,
          news: 0,
          hasFeaturedSnippet: true,
          hasKnowledgePanel: false,
          hasLocalPack: false,
        },
        intent: "commercial",
        intentSignals: { howTo: 1, brand: 0, commercial: 2, comparison: 6 },
        domains: [{ domain: "example.com", count: 2 }],
        ok: true,
      },
    },
    meta: {
      requestId: "req_x9k2lzm",
      apiVersion: "v1",
      durationMs: 1284,
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
      apiName="SERP API"
      endpoint="/api/v1/serp"
      method="POST"
      playgroundHref="/tools/serp-checker"
      intro={
        <>
          <p>
            Multi-engine SERP extraction for any query. Fans the request out
            in parallel to Google, Bing, Yahoo and DuckDuckGo using
            engine-specific parsers, then returns a normalized schema with a
            merged top-ranking list (deduped, blended by avg position) plus
            full per-engine output for transparency.
          </p>
          <p>
            Country targeting is honored at the engine level — Google
            <code> gl</code>/<code> hl</code>, Bing <code> cc</code>, Yahoo
            country host, DuckDuckGo <code> kl</code>. Featured snippets, PAA,
            ads, videos, news and related searches are captured when the
            engine surfaces them.
          </p>
        </>
      }
      params={[
        { name: "query", type: "string", required: "yes", description: "The search query (1–200 chars)." },
        { name: "country", type: "string", required: "no", description: "ISO-3166 alpha-2 country (e.g. US, IN, GB). Default US." },
        { name: "engines", type: "string[]", required: "no", description: "Subset of [google, bing, yahoo, duckduckgo]. Default = all four." },
        { name: "maxResults", type: "number", required: "no", description: "Per-engine cap, 5–50. Default 25." },
        { name: "queries", type: "string[]", required: "alt", description: "Bulk: up to 10 queries in one call." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass the 10-minute SERP cache." },
      ]}
      responseFields={[
        { name: "results[]", type: "{position,title,url,displayUrl,domain,snippet,kind}", required: "yes", description: "Merged organic results blended across engines." },
        { name: "perEngine[]", type: "EngineFetch[]", required: "yes", description: "Raw per-engine output — full positions, blocks, errors." },
        { name: "engines[]", type: "{engine,ok,error?,durationMs,resultCount}", required: "yes", description: "Run status for each engine." },
        { name: "featuredSnippets[]", type: "{source,title,url,domain,snippet}", required: "yes", description: "Top-of-SERP answer boxes returned by any engine." },
        { name: "paa[]", type: "{question,answer?,sourceUrl?}[]", required: "yes", description: "Deduped People Also Ask questions across engines." },
        { name: "related[]", type: "string[]", required: "yes", description: "Deduped 'related searches'." },
        { name: "blocks", type: "{ads,videos,images,news,hasFeaturedSnippet,hasKnowledgePanel,hasLocalPack}", required: "yes", description: "Aggregated rich-block presence." },
        { name: "intent", type: "informational | navigational | transactional | commercial | mixed", required: "yes", description: "SERP-derived intent classification." },
        { name: "intentSignals", type: "{howTo,brand,commercial,comparison}", required: "yes", description: "Per-signal counts that fed the intent classifier." },
        { name: "domains[]", type: "{domain,count}[]", required: "yes", description: "Domain frequency in the merged list." },
        { name: "country / language", type: "string", required: "yes", description: "Resolved country + primary language for the run." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
