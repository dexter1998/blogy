import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "PageSpeed API Reference",
  description:
    "REST API for Core Web Vitals + Lighthouse audits via Google PageSpeed Insights v5.",
  alternates: { canonical: "/docs-api/pagespeed-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/pagespeed",
  exampleBody: { url: "blogy.in", strategy: "mobile" },
  responseExtractor: "data.result.scores",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        finalUrl: "https://blogy.in/",
        strategy: "mobile",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        field: {
          available: true,
          coreWebVitalsAssessment: "PASS",
          metrics: [
            { metric: "LCP", value: 1842, unit: "ms", category: "good" },
            { metric: "INP", value: 132, unit: "ms", category: "good" },
            { metric: "CLS", value: 0.04, unit: "score", category: "good" },
            { metric: "FCP", value: 1402, unit: "ms", category: "good" },
            { metric: "TTFB", value: 482, unit: "ms", category: "good" },
          ],
        },
        lab: {
          performanceScore: 94,
          metrics: { lcp: 1842, fcp: 1402, cls: 0.04, tbt: 90, si: 2102, tti: 2401 },
          opportunities: [],
          diagnostics: [],
        },
        scores: { overall: 89, performance: 94, cwv: 84 },
        source: "psi-v5",
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 14802, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="PageSpeed API"
      endpoint="/api/v1/pagespeed"
      method="POST"
      playgroundHref="/tools/pagespeed-checker"
      intro={
        <>
          <p>
            Wrap of Google PageSpeed Insights v5. Returns both{" "}
            <strong>CrUX field data</strong> (real-user 28-day metrics) and{" "}
            <strong>Lighthouse lab metrics</strong> (synthetic). When Google
            has no CrUX dataset for the URL, <code>field.available</code> is{" "}
            <code>false</code> and we fall back to the lab metrics for scoring.
          </p>
          <p>
            <strong>Auth note for higher quota:</strong> set the optional{" "}
            <code>PAGESPEED_API_KEY</code> environment variable on the server.
            Without it the public quota of 25k requests/day across the IP
            applies.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Page URL or bare domain." },
        { name: "strategy", type: "mobile | desktop", required: "no", description: "Default 'mobile'." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "field.available", type: "boolean", required: "yes", description: "True when Google has CrUX data for the URL/origin." },
        { name: "field.coreWebVitalsAssessment", type: "PASS | FAIL | UNKNOWN", required: "yes", description: "Google's overall pass/fail." },
        { name: "field.metrics[]", type: "CoreWebVital[]", required: "yes", description: "LCP, INP, CLS, FCP, TTFB with category (good/needs-improvement/poor)." },
        { name: "lab.performanceScore", type: "0–100", required: "yes", description: "Lighthouse performance score." },
        { name: "lab.metrics", type: "object", required: "yes", description: "LCP, FCP, CLS, TBT, Speed Index, TTI." },
        { name: "lab.opportunities[]", type: "[]", required: "yes", description: "Top potential savings (>=100ms)." },
        { name: "scores.overall", type: "0–100", required: "yes", description: "Performance 50% · CWV 50%." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
