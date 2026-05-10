import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Schema API Reference",
  description:
    "REST API for Schema.org structured-data extraction and validation. JSON-LD, Microdata, RDFa.",
  alternates: { canonical: "/docs-api/schema-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/schema",
  exampleBody: { url: "blogy.in" },
  responseExtractor: "data.result.detectedTypes",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        finalUrl: "https://blogy.in/",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totalItems: 2,
        byFormat: { jsonLd: 2, microdata: 0, rdfa: 0 },
        detectedTypes: ["WebSite", "Organization"],
        recommendedTypes: [],
        items: [
          { format: "json-ld", type: "WebSite", raw: { "@type": "WebSite", name: "Blogy", url: "https://blogy.in" }, errors: [], warnings: [] },
        ],
        issues: [],
        scores: { overall: 88, coverage: 85, quality: 90 },
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 412, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="Schema API"
      endpoint="/api/v1/schema"
      method="POST"
      playgroundHref="/tools/schema-checker"
      intro={
        <>
          <p>
            Detect and validate every Schema.org item on a page. Supports
            JSON-LD (preferred), Microdata, and RDFa. Per-type validation
            checks required and recommended fields against the most common
            rich-result schemas.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Page URL or bare domain." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "totalItems", type: "number", required: "yes", description: "Number of structured-data nodes detected." },
        { name: "byFormat", type: "{jsonLd,microdata,rdfa}", required: "yes", description: "Count per encoding format." },
        { name: "detectedTypes", type: "string[]", required: "yes", description: "Distinct @type values found." },
        { name: "recommendedTypes", type: "string[]", required: "yes", description: "Suggested rich-result types based on URL + content heuristics." },
        { name: "items[]", type: "SchemaItem[]", required: "yes", description: "Each item: format, type, raw payload, per-item errors and warnings." },
        { name: "scores.overall", type: "0–100", required: "yes", description: "Coverage 50% · Quality 50%." },
        { name: "issues[]", type: "{severity,type,message}", required: "yes", description: "Aggregated validation issues." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
