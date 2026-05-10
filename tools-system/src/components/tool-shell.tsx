/**
 * Reusable shell for every /tools/<slug> page. Wraps the form area with
 * a consistent header, breadcrumb, "How it works" sidebar, "Use as API"
 * snippet and pricing card. Each tool only writes its specific form +
 * result components.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, Card, CodeBlock } from "@/components/ui";
import { env } from "@/lib/env";
import type { ToolEntry } from "@/lib/registry";

export function ToolShell({
  tool,
  badge,
  howItWorks,
  exampleCurl,
  children,
}: {
  tool: ToolEntry;
  badge: string;
  howItWorks: string[];
  exampleCurl: string;
  children: ReactNode;
}) {
  return (
    <div className="container w-full max-w-full min-w-0 overflow-x-hidden py-10">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-fg">
        <Link href="/tools" className="hover:text-fg">
          Tools
        </Link>
        <span>/</span>
        <span className="text-fg">{tool.name}</span>
      </div>

      <header className="mb-8 max-w-3xl">
        <Badge tone="accent">{badge}</Badge>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{tool.name}</h1>
        <p className="mt-2 text-muted-fg">{tool.description}</p>
      </header>

      {/* `min-w-0` on the children track is the critical fix: without it,
          a wide child (long URL, JSON pre, table) expands the `1fr` track
          beyond its column and pushes the entire page sideways. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 max-w-full">{children}</div>

        <aside className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              How it works
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {howItWorks.map((line, i) => (
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
        </aside>
      </div>
    </div>
  );
}
