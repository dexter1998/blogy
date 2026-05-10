import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, CodeBlock } from "@/components/ui";
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
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-fg">
        <Link href="/tools" className="hover:text-fg">Tools</Link>
        <span>/</span>
        <span className="text-fg">{tool.name}</span>
      </div>

      <header className="mb-8 max-w-3xl">
        <Badge tone="accent">SEO · Authority</Badge>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          DA &amp; PA Checker
        </h1>
        <p className="mt-2 text-muted-fg">
          {tool.description}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <CheckerForm />

        <aside className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              How scoring works
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>• Domain age, TLD, HTTPS, DNS health</li>
              <li>• Robots, sitemap, indexable URL count</li>
              <li>• On-page trust pages &amp; schema</li>
              <li>• External link diversity (referring proxy)</li>
              <li>• Spam pattern detection</li>
            </ul>
            <p className="mt-3 text-xs text-muted-fg">
              Read the full{" "}
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
              Same engine. Same results. Available at <code>{tool.endpoint}</code>.
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
                <Badge>30 / min</Badge>
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
        </aside>
      </div>
    </div>
  );
}
