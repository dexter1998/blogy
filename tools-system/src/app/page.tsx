import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { tools } from "@/lib/registry";

export default function Home() {
  return (
    <div>
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent">Tools + APIs Platform</Badge>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Honest SEO tools.{" "}
            <span className="text-accent">Developer-grade APIs.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-fg">
            Use the tools in your browser. Ship the APIs in your product. One
            transparent scoring engine, derived from public signals only —
            no proprietary metrics emulated, no random outputs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools/da-pa-checker">
              <Button size="lg">Try Authority Checker →</Button>
            </Link>
            <Link href="/docs-api">
              <Button size="lg" variant="ghost">
                View API docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Available tools</h2>
            <p className="text-sm text-muted-fg">Each tool ships with a UI, an API, and full docs.</p>
          </div>
          <Link
            href="/tools"
            className="text-sm font-medium text-accent hover:underline"
          >
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Card key={t.slug}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-fg">{t.tagline}</p>
                </div>
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
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={t.toolPath}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Open tool →
                </Link>
                <Link
                  href={t.docsPath}
                  className="text-sm text-muted-fg hover:text-fg"
                >
                  API docs
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
