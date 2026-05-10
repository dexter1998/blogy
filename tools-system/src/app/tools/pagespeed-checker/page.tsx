import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { PageSpeedForm } from "./pagespeed-form";

const tool = getTool("pagespeed-checker")!;

export const metadata: Metadata = {
  title: "PageSpeed Checker — Real Core Web Vitals + Lighthouse",
  description:
    "Run a real PageSpeed Insights audit. Returns CrUX field data (real-user CWV: LCP, INP, CLS, FCP, TTFB) plus Lighthouse lab metrics, opportunities, and diagnostics.",
  alternates: { canonical: "/tools/pagespeed-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/pagespeed \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in", "strategy": "mobile"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Performance · CWV"
      howItWorks={[
        "Calls Google PageSpeed Insights v5 API directly",
        "Returns CrUX field data when Google has it (real users)",
        "Always returns Lighthouse lab metrics + opportunities",
        "Set PAGESPEED_API_KEY env for higher quota",
      ]}
      exampleCurl={exampleCurl}
    >
      <PageSpeedForm />
    </ToolShell>
  );
}
