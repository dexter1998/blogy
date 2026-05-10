import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { LinksForm } from "./links-form";

const tool = getTool("internal-links")!;

export const metadata: Metadata = {
  title: "Internal Links Audit — Hub & Orphan Detection",
  description:
    "BFS-crawl a site to build the internal-link graph: hubs, orphans, deep pages, broken pages, noindex. Distribution + health scoring.",
  alternates: { canonical: "/tools/internal-links" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/internal-links \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in", "maxPages": 30}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="SEO · Architecture"
      howItWorks={[
        "BFS-crawls up to 50 pages from the seed URL",
        "Builds inbound/outbound link graph",
        "Detects hubs, orphans, deep pages (depth ≥ 4)",
        "Flags broken (4xx/5xx) and noindex pages",
      ]}
      exampleCurl={exampleCurl}
    >
      <LinksForm />
    </ToolShell>
  );
}
