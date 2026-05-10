import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Internal Links API Reference",
  description:
    "REST API to crawl a site, build its internal-link graph, and surface hubs, orphans, and broken pages.",
  alternates: { canonical: "/docs-api/internal-links-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/internal-links",
  exampleBody: { url: "blogy.in", maxPages: 30 },
  responseExtractor: "data.result.scores",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        origin: "https://blogy.in",
        startedFrom: "https://blogy.in/",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        pagesCrawled: 18,
        truncated: false,
        graph: { nodes: [], edgeCount: 76 },
        hubs: [{ url: "https://blogy.in/", inboundCount: 17 }],
        orphans: [],
        deepPages: [],
        noindexed: [],
        brokenLinks: [],
        scores: { overall: 86, coverage: 100, distribution: 78, health: 95 },
        recommendations: [],
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 8482, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="Internal Links API"
      endpoint="/api/v1/internal-links"
      method="POST"
      playgroundHref="/tools/internal-links"
      intro={
        <>
          <p>
            BFS-crawls a site (capped at 50 pages, concurrency 4) and
            returns the internal-link graph with hubs, orphans, deep pages,
            broken pages, and noindex coverage.
          </p>
          <p>
            Three sub-scores: <strong>Coverage</strong> (how much of the
            crawled set is reachable from the seed),{" "}
            <strong>Distribution</strong> (orphan + concentration penalty),{" "}
            <strong>Health</strong> (broken + noindex + depth penalty).
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Seed URL — crawl stays on this origin." },
        { name: "maxPages", type: "number", required: "no", description: "5–50, default 30. Hits the cap → truncated:true." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "graph.nodes[]", type: "LinkNode[]", required: "yes", description: "url, inboundCount, outboundCount, depth, isOrphan, noindex, status, title." },
        { name: "graph.edgeCount", type: "number", required: "yes", description: "Total internal edges between crawled pages." },
        { name: "hubs[]", type: "{url,inboundCount}[]", required: "yes", description: "Top 10 by inbound count." },
        { name: "orphans[]", type: "string[]", required: "yes", description: "Pages with zero inbound (excluding the seed)." },
        { name: "deepPages[]", type: "{url,depth}[]", required: "yes", description: "Pages at depth ≥4 from the seed." },
        { name: "brokenLinks[]", type: "{url,status}[]", required: "yes", description: "Pages that returned 4xx/5xx or no response." },
        { name: "scores.overall", type: "0–100", required: "yes", description: "Coverage 35% · Distribution 40% · Health 25%." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
