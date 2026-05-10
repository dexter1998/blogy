import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { PaaForm } from "./paa-form";

const tool = getTool("paa-checker")!;

export const metadata: Metadata = {
  title: "People Also Ask Generator — Multi-Engine PAA Discovery",
  description:
    "Discover real PAA questions across Google, Bing, Yahoo and DuckDuckGo with country-level targeting. Limit selector, recursive expansion, deduped output, CSV export.",
  alternates: { canonical: "/tools/paa-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/paa \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "domain authority",
    "country": "US",
    "engines": ["google", "bing", "yahoo", "duckduckgo"],
    "limit": 25,
    "depth": 2
  }'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Research · PAA"
      howItWorks={[
        "Pulls native PAA blocks from Google, Bing, Yahoo when available",
        "Adds question-shaped related searches and SERP titles from every engine",
        "Country-aware extraction (US, IN, GB, CA + 18 more)",
        "Recursive expansion (depth 2/3) re-queries the top scraped questions",
        "Deduped, classified by question type, and exportable as CSV",
      ]}
      exampleCurl={exampleCurl}
    >
      <PaaForm />
    </ToolShell>
  );
}
