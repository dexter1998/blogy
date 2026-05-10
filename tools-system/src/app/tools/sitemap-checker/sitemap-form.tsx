"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SitemapResult, SitemapUrl } from "@/scrapers/sitemap/types";

type ApiResp =
  | { ok: true; data: { result: SitemapResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

function tone(n: number): "good" | "warn" | "bad" | "neutral" {
  if (n >= 80) return "good";
  if (n >= 50) return "warn";
  if (n > 0) return "neutral";
  return "bad";
}

type SortKey = "loc" | "lastmod" | "priority";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export function SitemapForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SitemapResult | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortKey, setSortKey] = useState<SortKey>("loc");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterSource, setFilterSource] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    setPage(1);
    setSearch("");
    setFilterSource("");
    try {
      const res = await fetch("/api/v1/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fresh: true }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) setError(json.error.message);
      else setResult(json.data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Derived view ───────────────────────────────────────────────────
  const filtered = useMemo<SitemapUrl[]>(() => {
    if (!result) return [];
    let rows = result.urls;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.loc.toLowerCase().includes(q));
    }
    if (filterSource) {
      rows = rows.filter((r) => r.source === filterSource);
    }
    rows = [...rows].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortKey === "loc") {
        va = a.loc;
        vb = b.loc;
      } else if (sortKey === "lastmod") {
        va = a.lastmod ?? "";
        vb = b.lastmod ?? "";
      } else {
        va = a.priority ?? -1;
        vb = b.priority ?? -1;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [result, search, filterSource, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  // ── Exports ────────────────────────────────────────────────────────
  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  function csvEscape(v: string | number | null | undefined): string {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportCsv(rows: SitemapUrl[], filename: string) {
    const header = "url,last_modified,priority,changefreq,source\n";
    const body = rows
      .map((r) =>
        [r.loc, r.lastmod, r.priority, r.changefreq, r.source].map(csvEscape).join(","),
      )
      .join("\n");
    download(filename, header + body, "text/csv");
  }
  function exportTxt(rows: SitemapUrl[], filename: string) {
    download(filename, rows.map((r) => r.loc).join("\n"), "text/plain");
  }
  function exportJson(rows: SitemapUrl[], filename: string) {
    download(filename, JSON.stringify(rows, null, 2), "application/json");
  }

  // ── Sub-sitemap split ──────────────────────────────────────────────
  const queued = result?.discovered ?? [];
  const done = result?.fetched ?? [];

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium">
            Domain, sitemap URL, or robots.txt
            <span className="ml-2 text-xs font-normal text-muted-fg">
              auto-discovers via robots.txt + common paths
            </span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com/sitemap.xml"
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Extracting…" : "Extract URLs and Sub-Sitemaps"}
          </Button>
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {result && (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total URLs" value={result.stats.totalUrls.toLocaleString()} />
            <Stat label="Sub-Sitemaps" value={result.fetched.length} />
            <Stat
              label="Overall"
              value={result.scores.overall}
              tone={tone(result.scores.overall)}
            />
            <Stat
              label="Freshness"
              value={result.scores.freshness}
              tone={tone(result.scores.freshness)}
            />
          </div>

          {/* Queue / Done split */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  Discovered
                </h3>
                <Badge>{queued.length}</Badge>
              </div>
              <ul className="max-h-64 space-y-1 overflow-auto text-xs">
                {queued.map((s, i) => (
                  <li key={i} className="break-all font-mono text-muted-fg">
                    {s}
                  </li>
                ))}
                {queued.length === 0 && (
                  <li className="italic text-muted-fg">None.</li>
                )}
              </ul>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  Extracted Sub-Sitemaps
                </h3>
                <Badge tone="good">{done.filter((d) => d.ok).length}</Badge>
              </div>
              <ul className="max-h-64 space-y-1 overflow-auto text-xs">
                {done.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge tone={f.ok ? "good" : "bad"}>
                      {f.ok ? f.type : "fail"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterSource(f.source);
                        setPage(1);
                      }}
                      className={cn(
                        "break-all text-left font-mono hover:text-accent",
                        filterSource === f.source && "text-accent",
                      )}
                    >
                      {f.source}
                    </button>
                    {f.ok && (
                      <span className="shrink-0 text-muted-fg">
                        · {f.rawUrlCount.toLocaleString()} URLs
                      </span>
                    )}
                    {f.error && (
                      <span className="shrink-0 text-rose-500">· {f.error}</span>
                    )}
                  </li>
                ))}
                {done.length === 0 && (
                  <li className="italic text-muted-fg">None.</li>
                )}
              </ul>
              {filterSource && (
                <button
                  type="button"
                  onClick={() => setFilterSource("")}
                  className="mt-2 text-xs text-accent hover:underline"
                >
                  Clear sitemap filter ({filterSource})
                </button>
              )}
            </Card>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Issues
              </h3>
              <ul className="space-y-2 text-sm">
                {result.issues.map((iss, i) => (
                  <li key={i} className="flex gap-2">
                    <Badge
                      tone={
                        iss.severity === "error"
                          ? "bad"
                          : iss.severity === "warning"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {iss.severity}
                    </Badge>
                    <span>{iss.message}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* URL table */}
          {result.urls.length > 0 && (
            <Card>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                  Extracted URLs{" "}
                  <Badge>{filtered.length.toLocaleString()}</Badge>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportCsv(filtered, "sitemap-urls.csv")}
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportTxt(filtered, "sitemap-urls.txt")}
                  >
                    Export TXT
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportJson(filtered, "sitemap-urls.json")}
                  >
                    Export JSON
                  </Button>
                  <CopyButton
                    text={filtered.map((r) => r.loc).join("\n")}
                    label="Copy URLs"
                  />
                </div>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search URLs…"
                  className="rounded-lg border border-app bg-app px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-app bg-app px-2 py-1.5 text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-xs text-muted-fg">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage(1)}
                    className="rounded border border-app px-2 py-1 disabled:opacity-40"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded border border-app px-2 py-1 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="px-2 tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded border border-app px-2 py-1 disabled:opacity-40"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(totalPages)}
                    className="rounded border border-app px-2 py-1 disabled:opacity-40"
                  >
                    »
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left uppercase tracking-wider text-muted-fg">
                    <tr>
                      <th
                        onClick={() => toggleSort("loc")}
                        className="cursor-pointer select-none px-2 py-1"
                      >
                        URL{" "}
                        {sortKey === "loc" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                      </th>
                      <th
                        onClick={() => toggleSort("lastmod")}
                        className="cursor-pointer select-none px-2 py-1"
                      >
                        Last Modified{" "}
                        {sortKey === "lastmod"
                          ? sortDir === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th
                        onClick={() => toggleSort("priority")}
                        className="cursor-pointer select-none px-2 py-1"
                      >
                        Pri{" "}
                        {sortKey === "priority"
                          ? sortDir === "asc"
                            ? "↑"
                            : "↓"
                          : ""}
                      </th>
                      <th className="px-2 py-1">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((s, i) => (
                      <tr key={i} className="border-t border-app">
                        <td className="break-all px-2 py-1 font-mono">
                          <a
                            href={s.loc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent"
                          >
                            {s.loc}
                          </a>
                          {(s.imageCount || s.videoCount || s.hreflangCount || s.hasNews) && (
                            <span className="ml-2 inline-flex gap-1">
                              {s.imageCount ? (
                                <Badge tone="neutral">img·{s.imageCount}</Badge>
                              ) : null}
                              {s.videoCount ? (
                                <Badge tone="neutral">vid·{s.videoCount}</Badge>
                              ) : null}
                              {s.hreflangCount ? (
                                <Badge tone="neutral">
                                  hreflang·{s.hreflangCount}
                                </Badge>
                              ) : null}
                              {s.hasNews ? <Badge tone="neutral">news</Badge> : null}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-muted-fg">{s.lastmod ?? "—"}</td>
                        <td className="px-2 py-1 tabular-nums">
                          {s.priority ?? "—"}
                        </td>
                        <td className="break-all px-2 py-1 font-mono text-muted-fg">
                          {s.source.replace(/^https?:\/\/[^/]+/, "")}
                        </td>
                      </tr>
                    ))}
                    {pageRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-6 text-center italic text-muted-fg"
                        >
                          No URLs match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Stats detail */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Coverage
              </h3>
              <Row
                label="With lastmod"
                value={`${result.stats.withLastmod.toLocaleString()} / ${result.stats.totalUrls.toLocaleString()}`}
              />
              <Row
                label="With changefreq"
                value={`${result.stats.withChangefreq.toLocaleString()} / ${result.stats.totalUrls.toLocaleString()}`}
              />
              <Row
                label="With priority"
                value={`${result.stats.withPriority.toLocaleString()} / ${result.stats.totalUrls.toLocaleString()}`}
              />
              <Row label="With images" value={result.stats.withImages.toLocaleString()} />
              <Row label="With videos" value={result.stats.withVideos.toLocaleString()} />
              <Row label="With hreflang" value={result.stats.withHreflang.toLocaleString()} />
              <Row label="With news" value={result.stats.withNews.toLocaleString()} />
              <Row label="Unique hosts" value={result.stats.uniqueHosts} />
              <Row label="Avg path depth" value={result.stats.avgPathDepth} />
              <Row
                label="Freshness median (days)"
                value={result.stats.freshnessDays.median ?? "—"}
              />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Top paths
              </h3>
              <ul className="space-y-1 text-sm">
                {result.stats.topPaths.map((p) => (
                  <li key={p.path} className="flex justify-between">
                    <code>{p.path}</code>
                    <span className="tabular-nums text-muted-fg">{p.count}</span>
                  </li>
                ))}
                {result.stats.topPaths.length === 0 && (
                  <li className="italic text-muted-fg">No paths.</li>
                )}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs text-muted-fg">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
