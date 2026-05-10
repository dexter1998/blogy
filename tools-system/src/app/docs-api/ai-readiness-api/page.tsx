import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "AI Readiness API Reference",
  description:
    "REST API to score how prepared a page is for AI search engines (AI Overviews, ChatGPT, Perplexity).",
  alternates: { canonical: "/docs-api/ai-readiness-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/ai-readiness",
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
        scores: { overall: 72, eeat: 65, structure: 80, machineReadability: 85, freshness: 60 },
        eeat: { hasAuthorByline: true, hasAuthorBio: false, hasPublishedDate: true, hasModifiedDate: false, ageDays: 142, hasOrganizationSchema: true, hasArticleSchema: true, hasReviewSchema: false, externalCitations: 8 },
        structure: { hasH1: true, h2Count: 5, paragraphCount: 22, avgParagraphWords: 48, hasFaqSchema: false, hasHowToSchema: false, hasBreadcrumbSchema: true },
        machineReadability: { canonical: "https://blogy.in/", hasMetaDescription: true, hasOpenGraph: true, hasTwitterCard: true, hasJsonLd: true, hasLlmsTxt: false, hasRobotsAllow: true },
        recommendations: [{ priority: "medium", message: "Add an author bio block (E-E-A-T)" }],
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 1184, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="AI Readiness API"
      endpoint="/api/v1/ai-readiness"
      method="POST"
      playgroundHref="/tools/ai-readiness"
      intro={
        <>
          <p>
            Scores how likely a page is to be picked up, understood, and
            cited by AI-powered search (Google AI Overviews, ChatGPT
            Search, Perplexity). Combines four sub-scores:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>E-E-A-T (35%)</strong> — author signals, dates, schema, citations.</li>
            <li><strong>Structure (25%)</strong> — H1/H2 hierarchy, paragraph length, FAQ/HowTo/Breadcrumb schema.</li>
            <li><strong>Machine readability (25%)</strong> — canonical, OG, Twitter, JSON-LD, llms.txt, robots.</li>
            <li><strong>Freshness (15%)</strong> — modified-date age band.</li>
          </ul>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Page URL or bare domain." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "scores.overall", type: "0–100", required: "yes", description: "Weighted overall AI-readiness." },
        { name: "scores.eeat", type: "0–100", required: "yes", description: "E-E-A-T signal score." },
        { name: "scores.structure", type: "0–100", required: "yes", description: "Content structure / passage citability." },
        { name: "scores.machineReadability", type: "0–100", required: "yes", description: "Machine consumption readiness (schema, OG, llms.txt, robots)." },
        { name: "scores.freshness", type: "0–100", required: "yes", description: "Freshness derived from modified date." },
        { name: "eeat", type: "EeatSignals", required: "yes", description: "Raw author/date/schema/citations signals." },
        { name: "structure", type: "StructureSignals", required: "yes", description: "Heading + paragraph + schema-shape signals." },
        { name: "machineReadability", type: "object", required: "yes", description: "Per-channel detection booleans." },
        { name: "recommendations[]", type: "{priority,message}[]", required: "yes", description: "Prioritized fix list." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
