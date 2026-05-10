import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { PaaForm } from "./paa-form";

const tool = getTool("paa-checker")!;

export const metadata: Metadata = {
  title: "People Also Ask Generator — PAA Question Discovery",
  description:
    "Discover real, question-shaped queries people ask around any topic. DuckDuckGo + Bing related searches, with optional second-level expansion.",
  alternates: { canonical: "/tools/paa-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/paa \\
  -H "Content-Type: application/json" \\
  -d '{"query": "domain authority", "depth": 2}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Research · PAA"
      howItWorks={[
        "Pulls related searches + question-shaped titles from DDG/Bing",
        "Adds deterministic expansion seeds (how, what, why, …)",
        "depth=2 expands the top 5 questions one level deeper",
        "Each question shows its source for full transparency",
      ]}
      exampleCurl={exampleCurl}
    >
      <PaaForm />
    </ToolShell>
  );
}
