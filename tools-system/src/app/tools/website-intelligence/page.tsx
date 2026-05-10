import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { IntelligenceForm } from "./intelligence-form";

const tool = getTool("website-intelligence")!;

export const metadata: Metadata = {
  title: "Website Intelligence Engine — 22 signals from one crawl",
  description:
    "Crawl any site once and extract brand, metadata, schema, social, payments, tech-stack, analytics, AI readiness, security, performance, hosting, and 12 more signals. No third-party APIs.",
  alternates: { canonical: "/tools/website-intelligence" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/website-intelligence \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in", "depth": 8}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Intelligence · Multi-signal"
      howItWorks={[
        "Accepts domain, full URL, or any internal page",
        "Single bounded crawl (home + nav + footer + internal pages)",
        "Robots.txt + sitemap.xml discovery (with index expansion)",
        "Fingerprints scripts, headers, meta, links, JSON-LD across the site",
        "22 modular extractors share one fetch — fetch once, extract many",
        "Each signal is also exposed as its own API endpoint",
      ]}
      exampleCurl={exampleCurl}
    >
      <IntelligenceForm />
    </ToolShell>
  );
}
