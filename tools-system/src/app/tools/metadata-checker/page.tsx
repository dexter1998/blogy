import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { MetadataForm } from "./metadata-form";

const tool = getTool("metadata-checker")!;

export const metadata: Metadata = {
  title: "Metadata Checker — Title, Meta, OG, Twitter, Hreflang",
  description:
    "Inspect every SEO meta tag on a page: title, description, canonical, robots, viewport, Open Graph, Twitter Card, hreflang. Get an issues list and a score.",
  alternates: { canonical: "/tools/metadata-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/metadata \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Technical · Metadata"
      howItWorks={[
        "Fetches the page once, parses with Cheerio",
        "Extracts title, meta, OG, Twitter, hreflang",
        "Validates lengths, duplicates, and required tags",
        "Returns a 0–100 score per category and issue list",
      ]}
      exampleCurl={exampleCurl}
    >
      <MetadataForm />
    </ToolShell>
  );
}
