import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { AuditForm } from "./audit-form";

const tool = getTool("seo-audit")!;

export const metadata: Metadata = {
  title: "SEO Audit — One-Page Site Health Check",
  description:
    "Composite SEO audit: metadata, schema, sitemap, content, links, indexability. Letter grade, category scores, and a flat issue list.",
  alternates: { canonical: "/tools/seo-audit" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/seo-audit \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="SEO · Audit"
      howItWorks={[
        "Runs Metadata, Schema, and Sitemap scrapers in parallel",
        "Adds on-page content + link + indexability checks",
        "Combines weighted category scores into a letter grade",
        "Reuses the cache from individual API calls",
      ]}
      exampleCurl={exampleCurl}
    >
      <AuditForm />
    </ToolShell>
  );
}
