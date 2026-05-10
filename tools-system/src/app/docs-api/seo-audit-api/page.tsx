import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "SEO Audit API Reference",
  description:
    "Composite REST API: metadata + schema + sitemap + on-page content/links/indexability scored into a single SEO grade.",
  alternates: { canonical: "/docs-api/seo-audit-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/seo-audit",
  exampleBody: { url: "blogy.in" },
  responseExtractor: "data.result.scores",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        finalUrl: "https://blogy.in/",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        scores: { overall: 84, grade: "B" },
        categories: [
          { name: "metadata", score: 92, weight: 0.2, summary: "0 errors · 1 warnings", issues: [] },
          { name: "schema", score: 80, weight: 0.15, summary: "2 items, types: WebSite, Organization", issues: [] },
        ],
        totals: { errors: 0, warnings: 3, infos: 2 },
        references: { metadata: { scores: { overall: 92, basic: 100, social: 90, international: 60 }, issues: 1 }, schema: { scores: { overall: 80, coverage: 75, quality: 85 }, detectedTypes: ["WebSite"], recommendedTypes: [] }, sitemap: { scores: { overall: 84, coverage: 78, freshness: 92, structure: 80 }, totalUrls: 18, truncated: false } },
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 2842, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="SEO Audit API"
      endpoint="/api/v1/seo-audit"
      method="POST"
      playgroundHref="/tools/seo-audit"
      intro={
        <>
          <p>
            Composite audit endpoint. Internally runs Metadata, Schema, and
            Sitemap scrapers in parallel, then scores six weighted
            categories: <code>metadata</code> · <code>schema</code> ·{" "}
            <code>sitemap</code> · <code>content</code> · <code>links</code>{" "}
            · <code>indexability</code>.
          </p>
          <p>
            Each category produces a 0–100 score and an issue list. The
            overall score is a weighted average and gets a letter grade
            (A/B/C/D/F).
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Page URL or bare domain." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache for all sub-scrapers." },
      ]}
      responseFields={[
        { name: "scores.overall", type: "0–100", required: "yes", description: "Weighted average of category scores." },
        { name: "scores.grade", type: "A | B | C | D | F", required: "yes", description: "Letter grade derived from the overall score." },
        { name: "categories[]", type: "SeoAuditCategory[]", required: "yes", description: "Per-category score, weight, summary, issues." },
        { name: "totals", type: "{errors,warnings,infos}", required: "yes", description: "Aggregated issue counts across all categories." },
        { name: "references", type: "object", required: "yes", description: "Sub-scores from the underlying Metadata/Schema/Sitemap APIs." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
