import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { CheckerForm } from "./checker-form";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";

const tool = getTool("da-pa-checker")!;

export const metadata: Metadata = {
  title: "Authority Checker — Domain & Page Authority from Public Signals",
  description:
    "Check Authority Score, Page Strength, Domain Strength, URL Strength, Spam Score and Stability Score for any URL. Bulk supported. Transparent scoring derived from public signals only — no proprietary metrics emulated.",
  alternates: { canonical: "/tools/da-pa-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/da-pa \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="SEO · Authority"
      howItWorks={[
        "Domain age, TLD, HTTPS, DNS health",
        "Robots, sitemap, indexable URL count",
        "On-page trust pages & schema",
        "External link diversity (referring proxy)",
        "Spam pattern detection",
      ]}
      exampleCurl={exampleCurl}
    >
      <CheckerForm />
    </ToolShell>
  );
}
