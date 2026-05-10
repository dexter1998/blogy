"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SitemapUrl } from "@/scrapers/sitemap/types";
import type { DiscoverResult } from "@/scrapers/sitemap/discover";
import type { ExtractResult } from "@/scrapers/sitemap/extract";

type DiscoverResp =
  | { ok: true; data: { result: DiscoverResult } }
  | { ok: false; error: { message: string } };

type ExtractResp =
  | { ok: true; data: { result: ExtractResult } }
  | { ok: false; error: { message: string } };

type SubStatus = "queued" | "running" | "done" | "failed";

type SubSitemapState = {
  loc: string;
  lastmod: string | null;
  status: SubStatus;
  urlCount: number;
  error: string | null;
  durationMs: number | null;
};

type SortKey = "loc" | "lastmod" | "priority";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];
const EXTRACT_CONCURRENCY = 5;

function shortPath(url: string): string {
  try {
    return new URL(url).pathname || url;
  } catch {
    return url;
  }
}

export function SitemapForm() {
  const [url, setUrl] = useState("blogy.in");
  const [phase, setPhase] = useState<"idle" | "discovering" | "extracting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const [discover, setDiscover] = useState<DiscoverResult | null>(null);
  const [subs, setSubs] = useState<SubSitemapState[]>([]);
  const [urls, setUrls] = useState<SitemapUrl[]>([]);

  // Table state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortKey, setSortKey] = useState<SortKey>("loc");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterSource, setFilterSource] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  function reset() {
    setError(null);
    setDiscover(null);
    setSubs([]);
    setUrls([]);
    setSearch("");
    setFilterSource("");
    setPage(1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    reset();
    setPhase("discovering");

    try {
      const res = await fetch("/api/v1/sitemap/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, fresh: true }),
        signal: abortRef.current.signal,
      });
      const json = (await res.json()) as DiscoverResp;
      if (!json.ok) {
        setError(json.error.message);
        setPhase("idle");
        return;
      }
      const d = json.data.result;
      setDiscover(d);
      const initial: SubSitemapState[] = d.subSitemaps.map((s) => ({
        loc: s.loc,
        lastmod: s.lastmod,
        status: "queued" as SubStatus,
        urlCount: 0,
        error: null,
        durationMs: null,
      }));
      setSubs(initial);

      if (initial.length === 0) {
        setPhase("done");
        return;
      }

      setPhase("extracting");
      await runExtraction(initial.map((s) => s.loc), abortRef.current.signal);
      setPhase("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Request failed");
      setPhase("idle");
    }
  }

  async function runExtraction(locs: string[], signal: AbortSignal) {
    let cursor = 0;
    const workers = Array.from({ length: Math.min(EXTRACT_CONCURRENCY, locs.length) }, async () => {
      while (!signal.aborted) {
        const i = cursor++;
        if (i >= locs.length) return;
        const loc = locs[i]!;
        await extractOne(loc, signal);
      }
    });
    await Promise.all(workers);
  }

  async function extractOne(loc: string, signal: AbortSignal) {
    setSubs((prev) => prev.map((s) => (s.loc === loc ? { ...s, status: "running" } : s)));
    try {
      const res = await fetch("/api/v1/sitemap/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: loc, fresh: true }),
        signal,
      });
      const json = (await res.json()) as ExtractResp;
      if (!json.ok) {
        setSubs((prev) =>
          prev.map((s) =>
            s.loc === loc ? { ...s, status: "failed", error: json.error.message } : s,
          ),
        );
        return;
      }
      const r = json.data.result;
      // If a sub-sitemap is itself an index (rare nested case), enqueue its children.
      if (r.type === "sitemapindex" && r.childSitemaps.length > 0) {
        const newChildren = r.childSitemaps;
        setSubs((prev) => {
          const seen = new Set(prev.map((s) => s.loc));
          const additions = newChildren
            .filter((c) => !seen.has(c.loc))
            .map<SubSitemapState>((c) => ({
              loc: c.loc,
              lastmod: c.lastmod,
              status: "queued",
              urlCount: 0,
              error: null,
              durationMs: null,
            }));
          return prev
            .map<SubSitemapState>((s) =>
              s.loc === loc
                ? { ...s, status: "done" as SubStatus, urlCount: 0, durationMs: r.durationMs }
                : s,
            )
            .concat(additions);
        });
        // Recursively extract the newly discovered children with the same controller.
        await runExtraction(newChildren.map((c) => c.loc), signal);
        return;
      }

      setSubs((prev) =>
        prev.map((s) =>
          s.loc === loc
            ? {
                ...s,
                status: r.ok ? "done" : "failed",
                urlCount: r.urls.length,
                error: r.error,
                durationMs: r.durationMs,
              }
            : s,
        ),
      );
      if (r.urls.length > 0) {
        setUrls((prev) => {
          const seen = new Set(prev.map((u) => u.loc));
          const additions = r.urls.filter((u) => !seen.has(u.loc));
          return additions.length ? prev.concat(additions) : prev;
        });
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setSubs((prev) =>
        prev.map((s) =>
          s.loc === loc
            ? { ...s, status: "failed", error: e instanceof Error ? e.message : "fetch_failed" }
            : s,
        ),
      );
    }
  }

  function onStop() {
    abortRef.current?.abort();
    setPhase("done");
    setSubs((prev) => prev.map((s) => (s.status === "running" || s.status === "queued" ? { ...s, status: "failed", error: "stopped" } : s)));
  }

  // ── Derived view ───────────────────────────────────────────────────
  const queued = subs.filter((s) => s.status === "queued" || s.status === "running");
  const done = subs.filter((s) => s.status === "done" || s.status === "failed");
  const completedSubs = subs.filter((s) => s.status === "done" && s.urlCount > 0);

  const filtered = useMemo<SitemapUrl[]>(() => {
    let rows = urls;
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
  }, [urls, search, filterSource, sortKey, sortDir]);

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
      .map((r) => [r.loc, r.lastmod, r.priority, r.changefreq, r.source].map(csvEscape).join(","))
      .join("\n");
    download(filename, header + body, "text/csv");
  }
  function exportTxt(rows: SitemapUrl[], filename: string) {
    download(filename, rows.map((r) => r.loc).join("\n"), "text/plain");
  }
  function exportJson(rows: SitemapUrl[], filename: string) {
    download(filename, JSON.stringify(rows, null, 2), "application/json");
  }

  const isWorking = phase === "discovering" || phase === "extracting";
  const totalSubs = subs.length;
  const doneOk = subs.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium">
            Domain or sitemap URL
            <span className="ml-2 text-xs font-normal text-muted-fg">
              auto-discovers via robots.txt + /sitemap.xml fallback
            </span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com/sitemap.xml"
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isWorking} className="w-full sm:w-auto">
              {phase === "discovering"
                ? "Discovering…"
                : phase === "extracting"
                  ? `Extracting… ${doneOk}/${totalSubs}`
                  : "Extract URLs and Sub-Sitemaps"}
            </Button>
            {isWorking && (
              <Button type="button" variant="ghost" onClick={onStop}>
                Stop
              </Button>
            )}
          </div>
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {/* Discovery output: Box A — robots.txt sitemaps */}
      {discover && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Robots.txt sitemap
            </h3>
            <Badge tone={discover.fromRobotsTxt.length ? "good" : "neutral"}>
              {discover.directSitemap
                ? "direct input"
                : discover.fromRobotsTxt.length
                  ? `${discover.fromRobotsTxt.length} declared`
                  : "not found"}
            </Badge>
          </div>
          {discover.directSitemap ? (
            <p className="text-xs text-muted-fg">
              Direct sitemap URL provided — skipped robots.txt lookup.
            </p>
          ) : discover.fromRobotsTxt.length > 0 ? (
            <ul className="space-y-1 text-xs font-mono">
              {discover.fromRobotsTxt.map((s) => (
                <li key={s} className="break-all text-fg">
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-fg">
                No sitemaps in robots.txt. Falling back to common paths:
              </p>
              <ul className="space-y-1 text-xs font-mono">
                {discover.fromCommonPaths.map((s) => (
                  <li key={s} className="break-all text-fg">
                    {s}
                  </li>
                ))}
                {discover.fromCommonPaths.length === 0 && (
                  <li className="italic text-muted-fg">None found.</li>
                )}
              </ul>
            </div>
          )}
          {discover.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {discover.errors.map((e) => (
                <li key={e.source} className="text-rose-500">
                  ✕ {e.source} — {e.error}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Box B + Box C — Queue / Done split */}
      {subs.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  QUEUE
                </span>{" "}
                Sub-Sitemaps
              </h3>
              <Badge>{queued.length} pending</Badge>
            </div>
            <ul className="max-h-72 space-y-1 overflow-auto text-xs">
              {queued.map((s) => (
                <li key={s.loc} className="flex items-center gap-2">
                  <Badge tone={s.status === "running" ? "warn" : "neutral"}>
                    {s.status === "running" ? "fetching" : "queued"}
                  </Badge>
                  <span className="break-all font-mono text-muted-fg">{s.loc}</span>
                </li>
              ))}
              {queued.length === 0 && (
                <li className="italic text-muted-fg">All sub-sitemaps processed.</li>
              )}
            </ul>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  DONE
                </span>{" "}
                Extracted
              </h3>
              <Badge tone="good">
                {doneOk} / {totalSubs}
              </Badge>
            </div>
            <ul className="max-h-72 space-y-1 overflow-auto text-xs">
              {done.map((s) => (
                <li key={s.loc} className="flex items-center gap-2">
                  <Badge tone={s.status === "done" ? "good" : "bad"}>
                    {s.status === "done" ? "ok" : "fail"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => {
                      if (s.status === "done") {
                        setFilterSource(s.loc);
                        setPage(1);
                      }
                    }}
                    className={cn(
                      "break-all text-left font-mono hover:text-accent",
                      filterSource === s.loc && "text-accent",
                    )}
                  >
                    {s.loc}
                  </button>
                  {s.status === "done" && (
                    <span className="shrink-0 text-muted-fg">
                      · {s.urlCount.toLocaleString()} URLs
                    </span>
                  )}
                  {s.error && (
                    <span className="shrink-0 text-rose-500">· {s.error}</span>
                  )}
                </li>
              ))}
              {done.length === 0 && (
                <li className="italic text-muted-fg">Nothing extracted yet.</li>
              )}
            </ul>
            {filterSource && (
              <button
                type="button"
                onClick={() => setFilterSource("")}
                className="mt-2 text-xs text-accent hover:underline"
              >
                Clear sub-sitemap filter
              </button>
            )}
          </Card>
        </div>
      )}

      {/* Stats summary — show as soon as we have any URLs */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total URLs" value={urls.length.toLocaleString()} />
          <Stat label="Sub-Sitemaps" value={`${doneOk} / ${totalSubs}`} />
          <Stat
            label="With lastmod"
            value={urls.filter((u) => u.lastmod).length.toLocaleString()}
          />
          <Stat
            label="Phase"
            value={phase === "extracting" ? "running" : phase}
            tone={phase === "done" ? "good" : "neutral"}
          />
        </div>
      )}

      {/* URL table */}
      {urls.length > 0 && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
              Extracted URLs <Badge>{filtered.length.toLocaleString()}</Badge>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => exportCsv(filtered, "sitemap-urls.csv")}>
                Export CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportTxt(filtered, "sitemap-urls.txt")}>
                Export TXT
              </Button>
              <Button size="sm" variant="ghost" onClick={() => exportJson(filtered, "sitemap-urls.json")}>
                Export JSON
              </Button>
              <CopyButton
                text={filtered.map((r) => r.loc).join("\n")}
                label="Copy URLs"
              />
            </div>
          </div>

          {/* Sub-sitemap filter dropdown — dynamic */}
          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_minmax(0,18rem)_auto_auto]">
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
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-app bg-app px-2 py-1.5 text-sm font-mono"
              title="Filter by sub-sitemap"
            >
              <option value="">All sub-sitemaps ({completedSubs.length})</option>
              {completedSubs.map((s) => (
                <option key={s.loc} value={s.loc}>
                  {shortPath(s.loc)} · {s.urlCount.toLocaleString()}
                </option>
              ))}
            </select>
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

          {filterSource && (
            <div className="mb-2 flex items-center gap-2 text-xs">
              <Badge tone="neutral">filter</Badge>
              <span className="font-mono text-muted-fg">{filterSource}</span>
              <button
                type="button"
                onClick={() => exportCsv(filtered, `${shortPath(filterSource).replace(/[^\w]+/g, "-")}.csv`)}
                className="ml-auto text-accent hover:underline"
              >
                Download this sub-sitemap CSV
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left uppercase tracking-wider text-muted-fg">
                <tr>
                  <th
                    onClick={() => toggleSort("loc")}
                    className="cursor-pointer select-none px-2 py-1"
                  >
                    URL {sortKey === "loc" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => toggleSort("lastmod")}
                    className="cursor-pointer select-none px-2 py-1"
                  >
                    Last Modified{" "}
                    {sortKey === "lastmod" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    onClick={() => toggleSort("priority")}
                    className="cursor-pointer select-none px-2 py-1"
                  >
                    Pri {sortKey === "priority" ? (sortDir === "asc" ? "↑" : "↓") : ""}
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
                            <Badge tone="neutral">hreflang·{s.hreflangCount}</Badge>
                          ) : null}
                          {s.hasNews ? <Badge tone="neutral">news</Badge> : null}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 text-muted-fg">{s.lastmod ?? "—"}</td>
                    <td className="px-2 py-1 tabular-nums">{s.priority ?? "—"}</td>
                    <td className="break-all px-2 py-1 font-mono text-muted-fg">
                      {shortPath(s.source)}
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-center italic text-muted-fg">
                      No URLs match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
