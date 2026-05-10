import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { BacklinksForm } from "./backlinks-form";

const tool = getTool("backlinks")!;

export const metadata: Metadata = {
  title: "Backlink Discovery — Real Common Crawl Data",
  description:
    "Discover real referring URLs from Common Crawl. Optionally verify links live, with anchor text and rel attribute. No paid API needed.",
  alternates: { canonical: "/tools/backlinks" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/backlinks \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in", "verify": true}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="SEO · Backlinks"
      howItWorks={[
        "Queries 4 most-recent Common Crawl monthly indexes",
        "Filters captures whose body referenced the target host",
        "Optional: verify candidates live, capture anchor + rel",
        "Aggregates by referring domain"
      ]}
      exampleCurl={exampleCurl}
    >
      <BacklinksForm />
    </ToolShell>
  );
}
