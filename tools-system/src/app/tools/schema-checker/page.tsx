import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { SchemaForm } from "./schema-form";

const tool = getTool("schema-checker")!;

export const metadata: Metadata = {
  title: "Schema Markup Checker — JSON-LD, Microdata, RDFa Validator",
  description:
    "Detect, validate, and audit Schema.org structured data on any URL. JSON-LD, Microdata, RDFa supported. Get coverage, quality, and rich-result recommendations.",
  alternates: { canonical: "/tools/schema-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/schema \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Technical · Schema"
      howItWorks={[
        "Parses all <script type='application/ld+json'> blocks",
        "Walks itemtype microdata + RDFa typeof",
        "Validates required + recommended fields per type",
        "Suggests rich-result types based on URL + content",
      ]}
      exampleCurl={exampleCurl}
    >
      <SchemaForm />
    </ToolShell>
  );
}
