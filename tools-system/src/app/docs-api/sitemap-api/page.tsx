import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "Sitemap API Reference",
  description:
    "REST API for XML sitemap discovery, validation, and analysis. Auto-expands sitemap indexes and returns full statistics.",
  alternates: { canonical: "/docs-api/sitemap-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/sitemap",
  exampleBody: { url: "blogy.in" },
  responseExtractor: "data.result.stats",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        discovered: ["https://blogy.in/sitemap.xml"],
        fetched: [{ source: "https://blogy.in/sitemap.xml", type: "urlset", ok: true, rawUrlCount: 18, childSitemaps: [] }],
        truncated: false,
        stats: {
          totalUrls: 18,
          withLastmod: 18,
          withChangefreq: 0,
          withPriority: 0,
          uniqueHosts: 1,
          avgPathDepth: 1.4,
          freshnessDays: { min: 1, max: 60, median: 12 },
          changefreqBreakdown: {},
          topPaths: [{ path: "/blog", count: 12 }, { path: "/", count: 6 }],
        },
        issues: [],
        scores: { overall: 84, coverage: 78, freshness: 92, structure: 80 },
        sample: [],
      },
    },
    meta: { requestId: "req_x9k2lzm", apiVersion: "v1", durationMs: 612, cached: false, rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" } },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="Sitemap API"
      endpoint="/api/v1/sitemap"
      method="POST"
      playgroundHref="/tools/sitemap-checker"
      intro={
        <>
          <p>
            Discover, parse, and analyse XML sitemaps. Pass either a domain
            (auto-discovers via robots.txt and common locations) or a direct
            sitemap URL. Sitemap indexes are recursively expanded.
          </p>
          <p>
            Caps: 25 child sitemaps, 5,000 URLs total. Hitting either flips{" "}
            <code>truncated: true</code>.
          </p>
        </>
      }
      params={[
        { name: "url", type: "string", required: "yes", description: "Domain or full sitemap URL." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache." },
      ]}
      responseFields={[
        { name: "discovered", type: "string[]", required: "yes", description: "All sitemap URLs we attempted to fetch." },
        { name: "fetched[]", type: "object[]", required: "yes", description: "Per-sitemap result: type (urlset/index), URL count, errors." },
        { name: "stats.totalUrls", type: "number", required: "yes", description: "Total URLs across all expanded sitemaps." },
        { name: "stats.freshnessDays", type: "{min,max,median}", required: "yes", description: "Lastmod-derived freshness, in days." },
        { name: "stats.topPaths", type: "[]", required: "yes", description: "Top 10 first-path-segments by URL count." },
        { name: "scores.overall", type: "0–100", required: "yes", description: "Coverage 45% · Freshness 30% · Structure 25%." },
        { name: "issues[]", type: "[]", required: "yes", description: "Detected problems (empty, multi-host, missing lastmod)." },
        { name: "sample[]", type: "[]", required: "yes", description: "First 25 URL entries with lastmod + priority." },
      ]}
      responseSample={responseSample}
      samples={samples}
    />
  );
}
