import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { tools } from "@/lib/registry";

export const metadata = { title: "API Documentation" };

export default function DocsIndex() {
  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold">API Reference</h1>
        <p className="mt-2 text-muted-fg">
          Production REST APIs for every Blogy tool. JSON in, JSON out.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tools.map((t) => (
          <Card key={t.slug}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{t.name} API</h3>
                <p className="mt-1 text-sm text-muted-fg">{t.tagline}</p>
              </div>
              <Badge tone={t.status === "live" ? "good" : "neutral"}>
                {t.status}
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-app bg-app px-3 py-1.5 font-mono text-xs">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {t.method}
              </span>
              <span className="truncate">{t.endpoint}</span>
            </div>
            <Link
              href={t.docsPath}
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              Open reference →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
