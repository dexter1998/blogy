import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "GEO API Reference",
  description:
    "REST API for Generative Engine Optimization analysis. AI crawler access, passage citability, brand entity, answerability.",
  alternates: { canonical: "/docs-api/geo-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/geo",
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
        scores: { overall: 71, citability: 68, aiAccess: 100, brandSignals: 60, answerability: 55 },
        passages: [{ text: "Domain Authority is a 0–100 score that predicts how a site will rank.", type: "definition", position: 1, wordCount: 14, citabilityScore: 88 }],
        aiCrawlers: [{ bot: "GPTBot", allowed: true, rule: null }, { bot: "ClaudeBot", allowed: true, rule: null }],
        brandSignals: { brandName: "blogy", brandMentions: 7, sameAsLinks: ["https://twitter.com/blogy"], organizationSchema: true, websiteSchema: true },
        answerability: { hasFaq: false, hasHowTo: false, hasDefinitions: 2, hasNumberedLists: 1, hasBulletedLists: 4, hasTables: 0, questionHeadings: 3 },
        recommendations: [{ priority: "medium", message: "Convert question headings into FAQPage schema" }],
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
      apiName="GEO API"
      endpoint="/api/v1/geo"
      method="POST"
      playgroundHref="/tools/geo-checker"
      intro={
        <>
          <p>
            Generative Engine Optimization analysis. GEO is distinct from
            traditional SEO and AI Readiness: it scores how <em>quotable</em>{" "}
            a page is for the answer engines (Google AI Overviews, ChatGPT
            Search, Perplexity). Four sub-scores:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Citability (30%)</strong> — passage extraction + per-passage citability score.</li>
            <li><strong>AI Access (25%)</strong> — robots.txt access for 11 named AI crawlers.</li>
            <li><strong>Brand signals (20%)</strong> — Organization schema, sameAs entity links, brand mention density.</li>
            <li><strong>Answerability (25%)</strong> — FAQ/HowTo schema, lists, tables, question headings.</li>
          </ul>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Page URL or bare domain." },
        { name: "query", type: "string", required: "no", description: "Optional intent context (reserved for future passage-relevance scoring)." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "scores.*", type: "0–100", required: "yes", description: "Overall + four sub-scores." },
        { name: "passages[]", type: "CitablePassage[]", required: "yes", description: "Top 25 candidates with type (definition/stat/answer/quote/list-item) + citability score." },
        { name: "aiCrawlers[]", type: "AiCrawlerStatus[]", required: "yes", description: "Per-bot allowed/blocked + the matching rule." },
        { name: "brandSignals", type: "object", required: "yes", description: "Brand mentions, sameAs, organization/website schema flags." },
        { name: "answerability", type: "object", required: "yes", description: "FAQ/HowTo/lists/tables/question-heading counts." },
        { name: "recommendations[]", type: "{priority,message}[]", required: "yes", description: "Prioritized fix list." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
