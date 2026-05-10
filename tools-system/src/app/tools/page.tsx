import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { tools } from "@/lib/registry";

export const metadata = { title: "All Tools" };

export default function ToolsIndex() {
  const byCategory = tools.reduce<Record<string, typeof tools>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Tools</h1>
        <p className="mt-1 text-muted-fg">
          Free public tools, each backed by a documented API.
        </p>
      </header>

      <div className="space-y-10">
        {Object.entries(byCategory).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
              {cat}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => (
                <Card key={t.slug}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
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
                  <p className="mt-1 text-sm text-muted-fg">{t.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-fg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <Link
                      href={t.toolPath}
                      className="font-medium text-accent hover:underline"
                    >
                      Open tool →
                    </Link>
                    <Link
                      href={t.docsPath}
                      className="text-muted-fg hover:text-fg"
                    >
                      API
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
