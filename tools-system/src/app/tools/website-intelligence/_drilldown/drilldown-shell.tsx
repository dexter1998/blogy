"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";

export type Row = { primary: string; secondary?: string; href?: string; meta?: string };

export function DrilldownShell({
  title,
  subtitle,
  url,
  fetchRows,
}: {
  title: string;
  subtitle: string;
  url: string;
  fetchRows: (url: string) => Promise<{ rows: Row[]; total?: number; error?: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRows(url)
      .then((r) => {
        if (cancelled) return;
        if (r.error) setError(r.error);
        setRows(r.rows);
        setTotal(r.total ?? r.rows.length);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, fetchRows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.primary.toLowerCase().includes(q) ||
        (r.secondary && r.secondary.toLowerCase().includes(q)) ||
        (r.meta && r.meta.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container py-10">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-fg">
        <Link href="/tools/website-intelligence" className="hover:text-fg">
          Website Intelligence
        </Link>
        <span>/</span>
        <span className="text-fg">{title}</span>
      </div>
      <header className="mb-6 max-w-3xl">
        <Badge tone="accent">Drilldown</Badge>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-fg">{subtitle}</p>
        <div className="mt-1 break-all text-xs text-muted-fg">{url}</div>
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Filter…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 flex-1 min-w-[200px] rounded-md border border-app bg-app px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Badge>{loading ? "loading…" : `${filtered.length.toLocaleString()} rows`}</Badge>
          {total !== null && total !== rows.length && <Badge tone="warn">total: {total.toLocaleString()}</Badge>}
        </div>

        {error && <div className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</div>}

        <div className="mt-4 divide-y divide-app overflow-hidden rounded-md border border-app">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted/40" />
          ))}
          {!loading && slice.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-fg">No rows.</div>
          )}
          {!loading && slice.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-3 p-3 text-xs hover:bg-muted/30">
              <div className="min-w-0">
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="block break-all font-medium text-accent hover:underline">{r.primary}</a>
                ) : (
                  <div className="break-all font-medium">{r.primary}</div>
                )}
                {r.secondary && <div className="mt-0.5 break-all text-muted-fg">{r.secondary}</div>}
              </div>
              {r.meta && <div className="text-[11px] text-muted-fg">{r.meta}</div>}
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</Button>
            <div className="text-xs text-muted-fg">Page {page} / {pageCount}</div>
            <Button variant="ghost" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Next →</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
