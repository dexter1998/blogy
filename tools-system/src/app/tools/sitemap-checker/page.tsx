import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { SitemapForm } from "./sitemap-form";

const tool = getTool("sitemap-checker")!;

export const metadata: Metadata = {
  title: "Sitemap Checker — XML Sitemap Audit & Stats",
  description:
    "Discover, validate, and analyse XML sitemaps. Auto-discovers via robots.txt, expands sitemap indexes, returns URL stats, freshness, and structure.",
  alternates: { canonical: "/tools/sitemap-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/sitemap \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Technical · Sitemaps"
      howItWorks={[
        "Accepts domain, sitemap URL, or any nested sitemap",
        "Discovers via robots.txt + common paths (sitemap.xml, sitemap_index.xml, wp-sitemap.xml, …)",
        "Recursively expands sitemap indexes with concurrent fetching",
        "Decompresses gzipped (.xml.gz) sitemaps automatically",
        "Parses image / video / news / hreflang namespaces",
        "Exports filtered or full URL list as CSV / TXT / JSON",
      ]}
      exampleCurl={exampleCurl}
    >
      <SitemapForm />
    </ToolShell>
  );
}
