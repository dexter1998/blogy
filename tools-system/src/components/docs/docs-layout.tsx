import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui";

export type DocsSection = { id: string; title: string };

export function DocsLayout({
  apiName,
  endpoint,
  method,
  status = "live",
  sections,
  content,
  rightRail,
}: {
  apiName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status?: "live" | "beta";
  sections: DocsSection[];
  content: ReactNode;
  rightRail: ReactNode;
}) {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)_440px]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-1 text-sm">
            <Link href="/docs-api" className="block text-muted-fg hover:text-fg">
              ← All APIs
            </Link>
            <div className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-fg">
              On this page
            </div>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded px-2 py-1 text-muted-fg hover:bg-muted hover:text-fg"
              >
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-fg">
              <Link href="/docs-api" className="hover:text-fg">API</Link>
              <span>/</span>
              <span>{apiName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">{apiName}</h1>
              <Badge tone={status === "live" ? "good" : "accent"}>{status}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-app bg-card px-3 py-2 font-mono text-sm">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {method}
              </span>
              <span className="truncate">{endpoint}</span>
            </div>
          </header>
          <div className="prose-docs space-y-10">{content}</div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">{rightRail}</aside>
      </div>
    </div>
  );
}
