import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { LinksForm } from "./links-form";

const tool = getTool("internal-links")!;

export const metadata: Metadata = {
  title: "Internal Link Extractor — Internal / External / Broken Links",
  description:
    "Pull every link off a single page. Categorises navbar, footer, and body links into internal vs external (subdomains count as internal) and live-checks each one for broken targets. Paginated 500-at-a-time.",
  alternates: { canonical: "/tools/internal-links" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/internal-links \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/", "offset": 0, "limit": 500}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="SEO · On-Page"
      howItWorks={[
        "Fetches the one page you supply (no crawling of other pages)",
        "Walks every <a href> and buckets it into navbar / footer / body by ancestor",
        "Same domain or subdomain = internal · everything else = external",
        "Pings each unique link and flags 4xx/5xx/timeouts as broken",
        "Returns 500 links per request — use the Load next 500 button for more",
      ]}
      exampleCurl={exampleCurl}
    >
      <LinksForm />
    </ToolShell>
  );
}
