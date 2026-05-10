import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { CheckerForm } from "./checker-form";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";

const tool = getTool("da-pa-checker")!;

export const metadata: Metadata = {
  title: "DA PA Checker — Free Domain & Page Authority Estimator",
  description:
    "Check Domain Authority, Page Authority, Spam Score and Domain Age for any URL. Bulk supported. Transparent scoring from public signals — no fake Moz numbers.",
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
