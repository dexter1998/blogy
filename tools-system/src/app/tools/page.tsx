import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card } from "@/components/ui";
import { tools } from "@/lib/registry";

export const metadata: Metadata = {
  title: "All Tools — Blogy",
  description:
    "Every Blogy SEO and content tool, with a free public UI and a documented REST API for each.",
  alternates: { canonical: "/tools" },
};

const CATEGORY_ORDER: Array<
  "SEO" | "Content" | "Research" | "Technical" | "AI" | "Performance" | "Intelligence"
> = ["Intelligence", "SEO", "Technical", "Content", "Research", "Performance", "AI"];

const METHOD_TONE: Record<string, string> = {
  GET: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  POST: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function ToolsIndex() {
  const byCategory = tools.reduce<Record<string, typeof tools>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter(
      (c) => !CATEGORY_ORDER.includes(c as (typeof CATEGORY_ORDER)[number]),
    ),
  ];

  return (
    <div className="container py-12">
      <header className="mb-10 max-w-3xl">
        <Badge tone="accent">{tools.length} tools · {tools.length} APIs</Badge>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          All tools &amp; APIs
        </h1>
        <p className="mt-2 text-muted-fg">
          Every tool ships with a free public UI for quick checks and a
          documented REST API for production use. Click <strong>Open tool</strong>{" "}
          to test live, or <strong>API docs</strong> to jump straight to the
          playground.
        </p>
      </header>

      <div className="space-y-12">
        {orderedCategories.map((cat) => {
          const items = byCategory[cat]!;
          return (
            <section key={cat}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  {cat}
                </h2>
                <span className="text-xs text-muted-fg">
                  {items.length} {items.length === 1 ? "tool" : "tools"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <Card
                    key={t.slug}
                    className="flex flex-col transition hover:border-fg/20 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold leading-tight">
                        {t.name}
                      </h3>
                      <Badge
                        tone={
                          t.status === "live"
                            ? "good"
                            : t.status === "beta"
                              ? "accent"
                              : "neutral"
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>

                    <p className="mt-1.5 text-sm text-muted-fg">{t.tagline}</p>

                    <div className="mt-3 flex items-center gap-2 rounded-md border border-app bg-app px-2.5 py-1.5 font-mono text-[11px]">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${METHOD_TONE[t.method] ?? METHOD_TONE.POST}`}
                      >
                        {t.method}
                      </span>
                      <span className="truncate text-muted-fg">{t.endpoint}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-fg"
                        >
                          {tag}
                        </span>
                      ))}
                      {t.tags.length > 3 && (
                        <span className="text-[10px] text-muted-fg">
                          +{t.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={t.toolPath}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        Open tool →
                      </Link>
                      <Link
                        href={`${t.docsPath}#playground`}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-app bg-card px-3 text-xs font-semibold text-fg transition hover:bg-muted"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                        API docs
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-16 rounded-xl border border-app bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Building with the APIs?</h2>
            <p className="mt-1 text-sm text-muted-fg">
              All endpoints share one envelope, one auth model, and one rate-limit
              header. Start at the API reference index.
            </p>
          </div>
          <Link
            href="/docs-api"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-app bg-app px-4 text-sm font-medium text-fg transition hover:bg-muted"
          >
            Browse all API docs →
          </Link>
        </div>
      </section>
    </div>
  );
}
