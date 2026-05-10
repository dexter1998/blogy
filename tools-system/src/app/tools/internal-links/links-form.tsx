"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import type {
  ExtractedLink,
  InternalLinkResult,
  LinkScope,
  LinkSection,
} from "@/scrapers/internal-links/types";

const PAGE_SIZE = 500;

type ApiResp =
  | { ok: true; data: { result: InternalLinkResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

type SectionKey =
  | "navbar-internal"
  | "navbar-external"
  | "footer-internal"
  | "footer-external"
  | "body-internal"
  | "body-external";

const SECTION_TABS: Array<{
  key: SectionKey;
  section: LinkSection;
  scope: LinkScope;
  label: string;
}> = [
  { key: "navbar-internal", section: "navbar", scope: "internal", label: "Navbar · Internal" },
  { key: "navbar-external", section: "navbar", scope: "external", label: "Navbar · External" },
  { key: "footer-internal", section: "footer", scope: "internal", label: "Footer · Internal" },
  { key: "footer-external", section: "footer", scope: "external", label: "Footer · External" },
  { key: "body-internal", section: "body", scope: "internal", label: "Body · Internal" },
  { key: "body-external", section: "body", scope: "external", label: "Body · External" },
];

export function LinksForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<InternalLinkResult | null>(null);
  const [links, setLinks] = useState<ExtractedLink[]>([]);
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<SectionKey>("body-internal");

  const totalLoaded = links.length;
  const grandTotal = meta?.page.total ?? 0;
  const hasMore = totalLoaded < grandTotal;

  async function fetchSlice(nextOffset: number, append: boolean) {
    const res = await fetch("/api/v1/internal-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, offset: nextOffset, limit: PAGE_SIZE }),
    });
    const json = (await res.json()) as ApiResp;
    if (!json.ok) {
      setError(json.error.message);
      return;
    }
    const result = json.data.result;
    setMeta(result);
    setLinks((prev) => (append ? [...prev, ...result.page.links] : result.page.links));
    setOffset(result.page.offset + result.page.links.length);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMeta(null);
    setLinks([]);
    setOffset(0);
    setLoading(true);
    try {
      await fetchSlice(0, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onLoadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      await fetchSlice(offset, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoadingMore(false);
    }
  }

  const grouped = useMemo(() => {
    const map: Record<SectionKey, ExtractedLink[]> = {
      "navbar-internal": [],
      "navbar-external": [],
      "footer-internal": [],
      "footer-external": [],
      "body-internal": [],
      "body-external": [],
    };
    for (const l of links) {
      map[`${l.section}-${l.scope}` as SectionKey].push(l);
    }
    return map;
  }, [links]);

  const brokenLoaded = links.filter((l) => l.broken);

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Page URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/some-page"
              className="mt-1 w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-muted-fg">
              Extracts up to 500 links per request. Same domain (and subdomains) counts as internal.
            </p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Extracting links…" : "Extract links"}
          </Button>
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {meta && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total links" value={meta.totals.all.total} />
            <Stat label="Internal" value={meta.totals.all.internal} tone="good" />
            <Stat label="External" value={meta.totals.all.external} tone="neutral" />
            <Stat
              label="Broken"
              value={meta.totals.all.broken}
              tone={meta.totals.all.broken === 0 ? "good" : "bad"}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Navbar" value={meta.totals.navbar.total} />
            <Stat label="Footer" value={meta.totals.footer.total} />
            <Stat label="Body" value={meta.totals.body.total} />
          </div>

          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  Categorised links
                </h3>
                <p className="mt-1 text-xs text-muted-fg">
                  Loaded {totalLoaded.toLocaleString()} of {grandTotal.toLocaleString()} links
                  {hasMore && ` · ${(grandTotal - totalLoaded).toLocaleString()} remaining`}
                </p>
              </div>
              {hasMore && (
                <Button type="button" onClick={onLoadMore} disabled={loadingMore}>
                  {loadingMore
                    ? "Loading…"
                    : `Load next ${Math.min(PAGE_SIZE, grandTotal - totalLoaded)}`}
                </Button>
              )}
            </div>

            <div className="-mb-px flex flex-wrap gap-1 border-b border-app">
              {SECTION_TABS.map((t) => {
                const count = grouped[t.key].length;
                const sectionTotal =
                  t.scope === "internal"
                    ? meta.totals[t.section].internal
                    : meta.totals[t.section].external;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={
                      "rounded-t-md border-b-2 px-3 py-2 text-xs font-medium transition " +
                      (isActive
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-fg hover:text-app")
                    }
                  >
                    {t.label}{" "}
                    <span className="ml-1 rounded bg-app/60 px-1.5 py-0.5 font-mono text-[10px]">
                      {count}/{sectionTotal}
                    </span>
                  </button>
                );
              })}
            </div>

            <LinkList items={grouped[activeTab]} />
          </Card>

          {brokenLoaded.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Broken links ({meta.totals.all.broken} total · {brokenLoaded.length} loaded)
              </h3>
              <ul className="space-y-1 text-xs">
                {brokenLoaded.slice(0, 100).map((l, i) => (
                  <li
                    key={`${l.url}-${l.section}-${i}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-app py-1 last:border-0"
                  >
                    <code className="break-all">{l.url}</code>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{l.section}</Badge>
                      <Badge tone="bad">{l.status ?? "no resp"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
              {brokenLoaded.length > 100 && (
                <p className="mt-2 text-xs text-muted-fg">
                  Showing first 100 broken links. Use the Raw API response below for the full list.
                </p>
              )}
            </Card>
          )}

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Raw API response (current slice)
              </h3>
              <CopyButton text={JSON.stringify(meta, null, 2)} />
            </div>
            <pre className="code-block max-h-96 overflow-auto text-xs">
{JSON.stringify(meta, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}

function LinkList({ items }: { items: ExtractedLink[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-fg">
        No links in this category for the loaded slice.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-1 text-xs">
      {items.map((l, i) => (
        <li
          key={`${l.url}-${i}`}
          className="flex flex-wrap items-baseline justify-between gap-2 border-b border-app py-1 last:border-0"
        >
          <div className="min-w-0 flex-1">
            <code className="break-all">{l.url}</code>
            {l.text && (
              <span className="ml-2 text-muted-fg">— {l.text.slice(0, 80)}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {l.rel && <Badge tone="neutral">{l.rel}</Badge>}
            {l.broken ? (
              <Badge tone="bad">{l.status ?? "no resp"}</Badge>
            ) : (
              <Badge tone="good">{l.status}</Badge>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
