import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { GeoForm } from "./geo-form";

const tool = getTool("geo-checker")!;

export const metadata: Metadata = {
  title: "GEO Checker — Generative Engine Optimization Audit",
  description:
    "Score citability for AI Overviews, ChatGPT, Perplexity. AI crawler access, passage citability, brand entity signals, and answerability patterns.",
  alternates: { canonical: "/tools/geo-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/geo \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="GEO · AI Search"
      howItWorks={[
        "Probes robots.txt for 11 AI crawlers (GPTBot, ClaudeBot, …)",
        "Extracts top 25 most-citable passages with type",
        "Counts brand mentions + sameAs entity links",
        "Detects FAQ, HowTo, lists, tables, Q&A headings",
      ]}
      exampleCurl={exampleCurl}
    >
      <GeoForm />
    </ToolShell>
  );
}
