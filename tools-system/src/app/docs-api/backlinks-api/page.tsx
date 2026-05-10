import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Backlink Discovery API Reference",
  description:
    "REST API to discover inbound links from Common Crawl with optional live verification.",
  alternates: { canonical: "/docs-api/backlinks-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/backlinks",
  exampleBody: { url: "blogy.in", verify: true },
  responseExtractor: "data.result.uniqueReferringDomains",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        target: "blogy.in",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        source: "common-crawl",
        indexesQueried: ["CC-MAIN-2026-13", "CC-MAIN-2026-09", "CC-MAIN-2025-51", "CC-MAIN-2025-43"],
        totalCandidates: 47,
        uniqueReferringDomains: 18,
        totalBacklinks: 41,
        verifiedCount: 6,
        topDomains: [{ domain: "github.com", count: 4 }, { domain: "dev.to", count: 3 }],
        backlinks: [
          { source: "https://example.com/blog/post", origin: "verified", domain: "example.com", firstSeenIndex: "CC-MAIN-2026-13", verifiedAt: "2026-05-10T08:14:24.482Z", linksToTarget: true, status: 200, anchorText: "Blogy", rel: null },
        ],
        truncated: false,
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 18482, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="Backlink Discovery API"
      endpoint="/api/v1/backlinks"
      method="POST"
      playgroundHref="/tools/backlinks"
      intro={
        <>
          <p>
            Real backlink discovery from <strong>Common Crawl CDX</strong>{" "}
            — the public web corpus that powers most open-source backlink
            datasets. Queries the four most-recent monthly indexes for any
            page that references the target host.
          </p>
          <p>
            Pass <code>verify: true</code> to re-fetch the top candidates
            live — when the link is still present we capture anchor text
            and rel attribute and mark <code>origin: "verified"</code>.
            Without verification you get the raw CC candidate list.
          </p>
          <p>
            <strong>Limitations</strong>: Common Crawl is sampled, not
            exhaustive. It will under-report compared to Ahrefs/Majestic
            (which run their own crawlers). Use this for free baseline
            discovery; pair with a paid backlink API for exhaustive audits.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Target page URL or domain." },
        { name: "verify", type: "boolean", required: "no", description: "Re-fetch top candidates to confirm the link still exists. Slower." },
        { name: "maxVerify", type: "number", required: "no", description: "1–20, default 10. Caps verification fan-out." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass the 6-hour cache." },
      ]}
      responseFields={[
        { name: "totalCandidates", type: "number", required: "yes", description: "Raw CDX rows pulled before dedup." },
        { name: "totalBacklinks", type: "number", required: "yes", description: "Unique referring URLs after dedup." },
        { name: "uniqueReferringDomains", type: "number", required: "yes", description: "Distinct domains across all backlinks." },
        { name: "verifiedCount", type: "number", required: "yes", description: "Number confirmed live (when verify=true)." },
        { name: "topDomains[]", type: "{domain,count}[]", required: "yes", description: "Top 25 referring domains by link count." },
        { name: "backlinks[]", type: "Backlink[]", required: "yes", description: "Up to 100 referring URLs with origin, anchor, rel (when verified)." },
        { name: "truncated", type: "boolean", required: "yes", description: "Hit the 200-candidate hard cap." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
