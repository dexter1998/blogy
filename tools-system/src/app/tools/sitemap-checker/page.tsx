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
        "Discovers sitemaps via robots.txt and common locations",
        "Expands <sitemapindex> recursively (capped)",
        "Computes freshness, depth, and changefreq stats",
        "Flags missing lastmod, multi-host, or stale entries",
      ]}
      exampleCurl={exampleCurl}
    >
      <SitemapForm />
    </ToolShell>
  );
}
