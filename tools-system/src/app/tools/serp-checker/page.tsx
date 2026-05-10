import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { SerpForm } from "./serp-form";

const tool = getTool("serp-checker")!;

export const metadata: Metadata = {
  title: "SERP Checker — Multi-Engine Top Ranking Pages (Google, Bing, Yahoo, DuckDuckGo)",
  description:
    "Pull top ranking pages, featured snippets, PAA, ads and rich blocks across Google, Bing, Yahoo and DuckDuckGo with country-level geo targeting. Normalized output, engine-specific parsers, transparent scoring.",
  alternates: { canonical: "/tools/serp-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/serp \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "best react ui library",
    "country": "US",
    "engines": ["google", "bing", "yahoo", "duckduckgo"]
  }'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Research · SERP"
      howItWorks={[
        "Fans out the query across Google, Bing, Yahoo and DuckDuckGo in parallel",
        "Country-aware: localized SERPs via per-engine geo params (gl, cc, kl, host)",
        "Engine-specific parsers feed a single normalized result schema",
        "Merged ranking blends positions across engines; per-engine output preserved",
        "Captures featured snippets, PAA, ads, videos and related searches",
      ]}
      exampleCurl={exampleCurl}
    >
      <SerpForm />
    </ToolShell>
  );
}
