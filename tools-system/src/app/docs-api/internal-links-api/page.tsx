import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Internal Links API Reference",
  description:
    "REST API that extracts every link from a single page, classifies internal vs external (subdomains count as internal), buckets by navbar/footer/body, and live-checks each one for broken targets.",
  alternates: { canonical: "/docs-api/internal-links-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/internal-links",
  exampleBody: { url: "https://example.com/", offset: 0, limit: 500 },
  responseExtractor: "data.result.totals.all",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        pageUrl: "https://example.com/",
        origin: "https://example.com",
        baseHost: "example.com",
        pageStatus: 200,
        pageTitle: "Example Domain",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        totals: {
          all: { total: 124, internal: 96, external: 28, broken: 3 },
          navbar: { total: 12, internal: 12, external: 0, broken: 0 },
          footer: { total: 18, internal: 14, external: 4, broken: 1 },
          body: { total: 94, internal: 70, external: 24, broken: 2 },
        },
        page: {
          offset: 0,
          limit: 500,
          total: 124,
          links: [
            {
              url: "https://example.com/pricing",
              href: "/pricing",
              text: "Pricing",
              section: "navbar",
              scope: "internal",
              rel: null,
              status: 200,
              broken: false,
            },
          ],
        },
      },
    },
    meta: {
      requestId: "req_x9k2lzm",
      apiVersion: "v1",
      durationMs: 1840,
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
      apiName="Internal Links API"
      endpoint="/api/v1/internal-links"
      method="POST"
      playgroundHref="/tools/internal-links"
      intro={
        <>
          <p>
            Fetches a single page and extracts every <code>{"<a href>"}</code>.
            Each link is bucketed by section (<strong>navbar</strong> /{" "}
            <strong>footer</strong> / <strong>body</strong>, based on its
            ancestor <code>{"<nav>"}</code>/<code>{"<header>"}</code>/
            <code>{"<footer>"}</code> with class/id fallbacks) and by scope
            (<strong>internal</strong> = same domain or a subdomain;{" "}
            <strong>external</strong> = anything else).
          </p>
          <p>
            Every unique destination is then live-pinged so broken targets are
            flagged. Responses are paginated at 500 links per call — use{" "}
            <code>offset</code> to walk further into a large page.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "The single page to extract links from." },
        { name: "offset", type: "number", required: "no", description: "0-indexed start of the slice. Default 0." },
        { name: "limit", type: "number", required: "no", description: "Slice size, max 500. Default 500." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache and re-fetch the page." },
      ]}
      responseFields={[
        { name: "pageUrl", type: "string", required: "yes", description: "Final URL of the fetched page (after redirects)." },
        { name: "baseHost", type: "string", required: "yes", description: "Registrable host used for internal vs external bucketing." },
        { name: "totals.all", type: "SectionCounts", required: "yes", description: "Aggregate counts: total, internal, external, broken." },
        { name: "totals.navbar / footer / body", type: "SectionCounts", required: "yes", description: "Same counts scoped to each page section." },
        { name: "page.offset / limit / total", type: "number", required: "yes", description: "Pagination cursor for the returned slice." },
        { name: "page.links[]", type: "ExtractedLink[]", required: "yes", description: "url, href, text, section, scope, rel, status, broken." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
