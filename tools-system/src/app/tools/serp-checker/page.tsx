import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { SerpForm } from "./serp-form";

const tool = getTool("serp-checker")!;

export const metadata: Metadata = {
  title: "SERP Checker — Real Search Results & Intent Classifier",
  description:
    "Get real, structured search results for any query. DuckDuckGo + Bing fallback. Returns positions, snippets, related searches, intent classification, and domain mix.",
  alternates: { canonical: "/tools/serp-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/serp \\
  -H "Content-Type: application/json" \\
  -d '{"query": "best react ui library"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Research · SERP"
      howItWorks={[
        "Queries DuckDuckGo HTML SERP first (no key needed)",
        "Falls back to Bing HTML if DDG returns nothing",
        "Classifies intent from the SERP result mix",
        "Reports domain diversity and related searches",
      ]}
      exampleCurl={exampleCurl}
    >
      <SerpForm />
    </ToolShell>
  );
}
