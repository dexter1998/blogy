import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Metadata API Reference",
  description:
    "REST API for SEO metadata extraction: title, description, canonical, OG, Twitter, hreflang. Returns scores, issues, and raw fields.",
  alternates: { canonical: "/docs-api/metadata-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/metadata",
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
        status: 200,
        fetchedAt: "2026-05-10T08:14:22.318Z",
        basic: {
          title: "Blogy — AI-powered blogging platform",
          titleLength: 36,
          description: "Write, publish, and grow…",
          descriptionLength: 142,
          canonical: "https://blogy.in/",
          robots: null,
          viewport: "width=device-width, initial-scale=1",
          charset: "UTF-8",
          language: "en",
          favicon: "https://blogy.in/favicon.ico",
          themeColor: "#6366f1",
        },
        openGraph: { title: "Blogy", description: "…", image: "https://blogy.in/og.png", type: "website", url: "https://blogy.in/", siteName: "Blogy", locale: "en_US" },
        twitter: { card: "summary_large_image", title: "Blogy", description: "…", image: "https://blogy.in/og.png", site: "@blogy", creator: null },
        hreflang: [],
        headings: { h1: ["Blogy"], h2Count: 4, h3Count: 9 },
        scores: { overall: 92, basic: 100, social: 90, international: 60 },
        issues: [],
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 642, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="Metadata API"
      endpoint="/api/v1/metadata"
      method="POST"
      playgroundHref="/tools/metadata-checker"
      intro={
        <>
          <p>
            Extract every SEO-relevant meta tag from a URL: title, description,
            canonical, robots, viewport, Open Graph, Twitter Card, and
            hreflang. Returns a deterministic 0–100 score per category and a
            structured issue list.
          </p>
          <p>
            Pass <code>{"{ url }"}</code> for a single page or <code>{"{ urls: [...] }"}</code>{" "}
            for up to 25 in one call.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "for single", description: "Page URL or bare domain (auto-promoted to https)." },
        { name: "urls", type: "string[]", required: "for bulk", description: "Up to 25 URLs in one call." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache and force a fresh fetch." },
      ]}
      responseFields={[
        { name: "basic.*", type: "object", required: "yes", description: "Title, description, canonical, robots, viewport, lang, charset, favicon, themeColor." },
        { name: "openGraph.*", type: "object", required: "yes", description: "All og:* tags (null when missing)." },
        { name: "twitter.*", type: "object", required: "yes", description: "All twitter:* tags." },
        { name: "hreflang", type: "{hreflang, href}[]", required: "yes", description: "Every <link rel='alternate' hreflang='…'>." },
        { name: "headings", type: "object", required: "yes", description: "H1 list, H2 count, H3 count." },
        { name: "scores.overall", type: "0–100", required: "yes", description: "Weighted: basic 55% · social 30% · international 15%." },
        { name: "issues[]", type: "{severity,field,message}", required: "yes", description: "Actionable problems detected during validation." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
