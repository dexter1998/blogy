import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CodeBlock } from "@/components/ui";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { PageSpeedTool } from "./pagespeed-form";

const tool = getTool("pagespeed-checker")!;

export const metadata: Metadata = {
  title: "PageSpeed Checker — Real Core Web Vitals + Lighthouse",
  description:
    "Run a real PageSpeed Insights audit. Returns CrUX field data (real-user CWV: LCP, INP, CLS, FCP, TTFB) plus full Lighthouse Performance, SEO, Accessibility and Best-Practices scores with every audit detail.",
  alternates: { canonical: "/tools/pagespeed-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/pagespeed \\
  -H "Content-Type: application/json" \\
  -d '{"url": "blogy.in", "strategy": "mobile"}'`;

const HOW_IT_WORKS = [
  "Calls Google PageSpeed Insights v5 directly with all 4 categories",
  "Returns CrUX field data when Google has it (real users)",
  "Renders the live page in a device mockup while scanning",
  "Surfaces every Lighthouse audit — failing, passed, manual & N/A",
];

export default function Page() {
  return (
    <>
      <PageSpeedTool />

      {/* Sidebar content kept consistent with the other tools, but rendered
          below the hero/dashboard so the scanner can take the full width. */}
      <div className="container mx-auto w-full max-w-full min-w-0 overflow-x-hidden px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              How it works
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {HOW_IT_WORKS.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-fg">
              Read the{" "}
              <Link href="/methodology" className="text-accent hover:underline">
                methodology
              </Link>
              .
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Use this as an API
            </h3>
            <p className="mt-2 text-sm text-muted-fg">
              Same engine. Same results. <code>{tool.endpoint}</code>.
            </p>
            <div className="mt-3">
              <CodeBlock language="bash" code={exampleCurl} />
            </div>
            <Link
              href={tool.docsPath}
              className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
            >
              Full API docs →
            </Link>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Pricing
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Free (anonymous)</span>
                <Badge>{env.rateLimitPerMin} / min</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span>API key (developer)</span>
                <Badge tone="accent">soon</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span>Bulk / commercial</span>
                <Badge tone="accent">soon</Badge>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
