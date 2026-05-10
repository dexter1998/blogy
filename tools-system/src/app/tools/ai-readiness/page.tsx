import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { AiReadinessForm } from "./ai-readiness-form";

const tool = getTool("ai-readiness")!;

export const metadata: Metadata = {
  title: "AI Readiness Checker — E-E-A-T + Citability Score",
  description:
    "Score how AI-ready a page is for Google AI Overviews, ChatGPT, and Perplexity. Author signals, dates, schema, structure, llms.txt, freshness.",
  alternates: { canonical: "/tools/ai-readiness" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/ai-readiness \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="AI · Readiness"
      howItWorks={[
        "Detects author, publish + modified dates, citations",
        "Inspects Article/Organization/FAQ/HowTo JSON-LD",
        "Checks structure: H1, H2 count, paragraph length",
        "Probes /llms.txt and robots allow signals",
      ]}
      exampleCurl={exampleCurl}
    >
      <AiReadinessForm />
    </ToolShell>
  );
}
