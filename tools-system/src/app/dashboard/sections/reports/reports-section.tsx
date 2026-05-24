"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import { Tabs } from "../../_shared/tabs";
import { SectionHeader } from "../../_shared/section-header";
import {
  CONTENT_ROI,
  RANKING_WINNERS,
  RANKING_LOSERS,
  WIN_LOSS_REASONS,
  GSC_WEEKS,
  GSC_IMPRESSIONS,
  GSC_CLICKS,
  GSC_CTR,
  GSC_KEYWORDS,
  GA4_DAYS,
  GA4_USERS,
  GA4_PREV_USERS,
} from "../../mock-data";
import type { ReportsTab, GscKeyword } from "../../types";

interface ReportsSectionProps {
  activeTab: ReportsTab;
  onTabChange: (t: ReportsTab) => void;
}

// ─── Utility: normalize array to 0-180 pixel range ───────────────────────────
function normalize(arr: number[], maxPx = 180): number[] {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min || 1;
  return arr.map((v) => ((v - min) / range) * maxPx);
}

// ─── SVG polyline helper ──────────────────────────────────────────────────────
function buildPolyline(
  normalizedY: number[],
  width: number,
  height: number,
  padX = 40,
  padTop = 10
): string {
  const n = normalizedY.length;
  const stepX = (width - padX * 2) / (n - 1);
  return normalizedY
    .map((y, i) => `${padX + i * stepX},${padTop + (height - padTop - 20) - y}`)
    .join(" ");
}

// ─── Why panel (inline expanding) ────────────────────────────────────────────
function WhyPanel({ title, onClose }: { title: string; onClose: () => void }) {
  const data = WIN_LOSS_REASONS[title as keyof typeof WIN_LOSS_REASONS];
  if (!data) return null;
  const isWin = data.type === "win";
  return (
    <div
      className={cn(
        "mt-2 rounded-lg border p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200",
        isWin
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
          : "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("font-medium text-xs uppercase tracking-wide", isWin ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
          {isWin ? "Why it won" : "Why it dropped"}
        </span>
        <button onClick={onClose} className="text-muted-fg hover:text-fg text-xs">
          Close
        </button>
      </div>
      <ul className="space-y-1">
        {data.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-fg/80">
            <span className="mt-0.5">{isWin ? "✓" : "✗"}</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Blogy Tab ────────────────────────────────────────────────────────────────
function BlogyTab() {
  const [openWhy, setOpenWhy] = useState<string | null>(null);
  const [highlightedStat, setHighlightedStat] = useState<string | null>(null);

  const roiRows: Array<{ label: string; value: number; key: string }> = [
    { label: "Published", value: CONTENT_ROI.total, key: "published" },
    { label: "Indexed", value: CONTENT_ROI.indexed, key: "indexed" },
    { label: "Ranking", value: CONTENT_ROI.ranking, key: "ranking" },
    { label: "Traffic", value: CONTENT_ROI.trafficDrivers, key: "traffic" },
    { label: "Leads", value: CONTENT_ROI.leadDrivers, key: "leads" },
  ];

  const toggleWhy = (title: string) => {
    setOpenWhy((prev) => (prev === title ? null : title));
  };

  const toggleStat = (key: string) => {
    setHighlightedStat((prev) => (prev === key ? null : key));
    console.log("Stat clicked:", key);
  };

  const decayDrops = [
    { title: "ULIP vs Mutual Fund 2025", drop: "-67%", from: 890, to: 290 },
    { title: "Travel Insurance 2025", drop: "-68%", from: 980, to: 310 },
  ];

  return (
    <div className="space-y-5 pt-4">
      {/* ── This Week's Performance ── */}
      <div className="rounded-xl border border-app bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-3">
          This Week's Performance
        </p>

        {/* Best Win */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-emerald-500 text-base flex-shrink-0">↑</span>
              <div className="min-w-0">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wide">Best Win</span>
                <p className="text-sm font-medium text-fg truncate">{RANKING_WINNERS[0]!.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone="good">#{RANKING_WINNERS[0]!.from} → #{RANKING_WINNERS[0]!.to}</Badge>
              <button
                onClick={() => toggleWhy(RANKING_WINNERS[0]!.title)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline whitespace-nowrap"
              >
                Why? →
              </button>
            </div>
          </div>
          {openWhy === RANKING_WINNERS[0]!.title && (
            <WhyPanel title={RANKING_WINNERS[0]!.title} onClose={() => setOpenWhy(null)} />
          )}
        </div>

        {/* Biggest Loss */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/20 px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-rose-500 text-base flex-shrink-0">↓</span>
              <div className="min-w-0">
                <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase tracking-wide">Biggest Loss</span>
                <p className="text-sm font-medium text-fg truncate">{RANKING_LOSERS[0]!.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone="bad">#{RANKING_LOSERS[0]!.from} → #{RANKING_LOSERS[0]!.to}</Badge>
              <button
                onClick={() => toggleWhy(RANKING_LOSERS[0]!.title)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline whitespace-nowrap"
              >
                Why? →
              </button>
            </div>
          </div>
          {openWhy === RANKING_LOSERS[0]!.title && (
            <WhyPanel title={RANKING_LOSERS[0]!.title} onClose={() => setOpenWhy(null)} />
          )}
        </div>

        {/* Top Recommendation */}
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 px-3.5 py-2.5">
          <span className="text-amber-500 flex-shrink-0">→</span>
          <p className="text-sm text-fg">
            <span className="font-medium">Top Recommendation:</span>{" "}
            Update ULIP article to recover traffic
          </p>
        </div>
      </div>

      {/* ── Content Inventory ── */}
      <div className="rounded-xl border border-app bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-3">Content Inventory</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Published", value: 67, key: "pub-total" },
            { label: "Indexed", value: "58 (87%)", key: "indexed" },
            { label: "Ranking", value: "29 (43%)", key: "ranking" },
            { label: "Traffic-Driving", value: "14 (21%)", key: "traffic" },
            { label: "Leads", value: 6, key: "leads" },
            { label: "Decaying", value: 12, key: "decaying", warn: true },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => toggleStat(s.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition",
                highlightedStat === s.key
                  ? s.warn
                    ? "border-amber-400 bg-amber-100 text-amber-700 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-teal-400 bg-teal-100 text-teal-700 dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-300"
                  : s.warn
                  ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400 hover:border-amber-400"
                  : "border-app bg-muted/40 text-fg hover:bg-muted"
              )}
            >
              <span className={cn("font-semibold", s.warn ? "text-amber-600 dark:text-amber-400" : "text-fg")}>
                {s.value}
              </span>
              <span className="text-muted-fg text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Decay Callout ── */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <h3 className="font-semibold text-fg">12 Blogs Losing Traffic</h3>
        </div>

        <div className="space-y-2 mb-3">
          {decayDrops.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-800/40 border border-amber-100 dark:border-amber-900/40 px-3 py-2"
            >
              <p className="text-sm text-fg truncate mr-3">{d.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-fg tabular-nums">{d.from.toLocaleString()} → {d.to.toLocaleString()}</span>
                <Badge tone="bad">{d.drop}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-sm font-medium transition">
            → Update these blogs
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-app bg-card px-3 py-1.5 text-sm text-muted-fg hover:text-fg transition">
            Auto-Update
            <Badge tone="accent">Premium</Badge>
          </button>
        </div>
      </div>

      {/* ── Content ROI Funnel ── */}
      <div className="rounded-xl border border-app bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-4">Blog Performance Funnel</p>
        <div className="space-y-2.5">
          {roiRows.map((row) => {
            const pct = Math.round((row.value / CONTENT_ROI.total) * 100);
            return (
              <div key={row.key} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-muted-fg font-medium">{row.label}</span>
                <span className="w-7 shrink-0 text-sm font-semibold text-fg tabular-nums text-right">{row.value}</span>
                <div className="flex-1 h-5 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded transition-all bg-teal-500"
                    style={{ width: `${pct}%`, opacity: 0.75 + pct * 0.0025 }}
                  />
                </div>
                <span className="w-8 shrink-0 text-xs text-muted-fg tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rankings: Winners / Losers ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Rising */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
            Rising Pages
          </p>
          <div className="space-y-2">
            {RANKING_WINNERS.map((w, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <p className="text-sm text-fg truncate flex-1">{w.title}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{w.change}</span>
                  <span className="text-xs text-muted-fg">#{w.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3">
            Declining Pages
          </p>
          <div className="space-y-2">
            {RANKING_LOSERS.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <p className="text-sm text-fg truncate flex-1">{l.title}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{l.change}</span>
                  <span className="text-xs text-muted-fg">#{l.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GSC Tab ──────────────────────────────────────────────────────────────────
type GscDateFilter = "24h" | "7d" | "28d" | "3m";
type GscSubTab = "queries" | "pages" | "countries" | "devices";
type SortDir = "asc" | "desc";
type SortCol = keyof GscKeyword;

function GscTab() {
  const [dateFilter, setDateFilter] = useState<GscDateFilter>("28d");
  const [subTab, setSubTab] = useState<GscSubTab>("queries");
  const [sortCol, setSortCol] = useState<SortCol>("clicks");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const chartW = 780;
  const chartH = 200;
  const padX = 44;
  const padTop = 12;
  const innerH = chartH - padTop - 28; // leave bottom for labels

  const normImpressions = normalize(GSC_IMPRESSIONS, innerH);
  const normClicks = normalize(GSC_CLICKS, innerH);
  const normCTR = normalize(GSC_CTR.map((v) => v * 1000), innerH);

  const polyImpressions = buildPolyline(normImpressions, chartW, chartH, padX, padTop);
  const polyClicks = buildPolyline(normClicks, chartW, chartH, padX, padTop);
  const polyCTR = buildPolyline(normCTR, chartW, chartH, padX, padTop);

  const stepX = (chartW - padX * 2) / (GSC_WEEKS.length - 1);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const sortedKeywords = useMemo(() => {
    return [...GSC_KEYWORDS].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return sortDir === "desc"
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }, [sortCol, sortDir]);

  const dateFilters: { id: GscDateFilter; label: string }[] = [
    { id: "24h", label: "24 hours" },
    { id: "7d", label: "7 days" },
    { id: "28d", label: "28 days" },
    { id: "3m", label: "3 months" },
  ];

  const metricBoxes = [
    {
      label: "Total Clicks",
      value: "840",
      sub: "last 12 weeks",
      bg: "bg-blue-600",
    },
    {
      label: "Total Impressions",
      value: "28,400",
      sub: "last 12 weeks",
      bg: "bg-violet-600",
    },
    {
      label: "Average CTR",
      value: "2.9%",
      sub: "last 12 weeks",
      bg: "bg-teal-600",
    },
    {
      label: "Average Position",
      value: "14.2",
      sub: "last 12 weeks",
      bg: "bg-amber-500",
    },
  ];

  const colDefs: { key: SortCol; label: string; align: string }[] = [
    { key: "keyword", label: "Top queries", align: "text-left" },
    { key: "clicks", label: "Clicks", align: "text-right" },
    { key: "impressions", label: "Impressions", align: "text-right" },
    { key: "ctr", label: "CTR", align: "text-right" },
    { key: "position", label: "Position", align: "text-right" },
  ];

  const subTabs: { id: GscSubTab; label: string }[] = [
    { id: "queries", label: "QUERIES" },
    { id: "pages", label: "PAGES" },
    { id: "countries", label: "COUNTRIES" },
    { id: "devices", label: "DEVICES" },
  ];

  return (
    <div className="pt-4 space-y-4">
      {/* Date filter bar */}
      <div className="flex items-center gap-0 border-b border-app">
        {dateFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition",
              dateFilter === f.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-muted-fg hover:text-fg"
            )}
          >
            {f.label}
          </button>
        ))}
        <button className="px-4 py-2.5 text-sm text-muted-fg hover:text-fg border-b-2 border-transparent -mb-px transition">
          More ▾
        </button>
      </div>

      {/* 4 metric boxes */}
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-app">
        {metricBoxes.map((m) => (
          <div key={m.label} className={cn("relative p-5 text-white", m.bg)}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-white/80 text-sm">☑</span>
              <span className="text-sm font-medium text-white/90">{m.label}</span>
            </div>
            <p className="text-3xl font-bold tabular-nums">{m.value}</p>
            <p className="text-xs text-white/60 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* SVG multi-line chart */}
      <div className="rounded-xl border border-app bg-card p-4 overflow-hidden">
        <div className="flex items-center gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-violet-500">
            <span className="w-4 h-0.5 bg-violet-500 inline-block" />
            Impressions
          </span>
          <span className="flex items-center gap-1.5 text-xs text-blue-500">
            <span className="w-4 h-0.5 bg-blue-500 inline-block" />
            Clicks
          </span>
          <span className="flex items-center gap-1.5 text-xs text-teal-500">
            <span className="w-4 h-0.5 bg-teal-500 inline-block" />
            CTR (×1000)
          </span>
        </div>

        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          style={{ height: chartH }}
          preserveAspectRatio="none"
        >
          {/* Gridlines */}
          {[0.25, 0.5, 0.75, 1].map((frac, i) => {
            const y = padTop + (innerH - frac * innerH);
            return (
              <line
                key={i}
                x1={padX}
                x2={chartW - padX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Impressions polyline */}
          <polyline
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyImpressions}
          />
          {/* Clicks polyline */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyClicks}
          />
          {/* CTR polyline */}
          <polyline
            fill="none"
            stroke="#14b8a6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 3"
            points={polyCTR}
          />

          {/* X-axis labels (every other week) */}
          {GSC_WEEKS.map((label, i) => {
            if (i % 2 !== 0) return null;
            return (
              <text
                key={i}
                x={padX + i * stepX}
                y={chartH - 6}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                fillOpacity={0.45}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-app">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold tracking-wider border-b-2 -mb-px transition",
              subTab === t.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-muted-fg hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Queries table */}
      {subTab === "queries" && (
        <div className="rounded-xl border border-app bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app bg-muted/40">
                {colDefs.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "px-4 py-2.5 font-medium text-muted-fg cursor-pointer select-none hover:text-fg transition",
                      col.align
                    )}
                  >
                    {col.label}
                    {sortCol === col.key && (
                      <span className="ml-1 text-teal-500">
                        {sortDir === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedKeywords.map((kw, i) => (
                <tr
                  key={i}
                  className="border-b border-app/60 last:border-0 hover:bg-muted/30 transition"
                >
                  <td className="px-4 py-2.5 text-fg">{kw.keyword}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-fg font-medium">
                    {kw.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-fg">
                    {kw.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-fg">
                    {kw.ctr.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                    {kw.position.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab !== "queries" && (
        <div className="rounded-xl border border-app bg-card p-8 text-center text-muted-fg text-sm">
          {subTab.charAt(0).toUpperCase() + subTab.slice(1)} data coming soon
        </div>
      )}
    </div>
  );
}

// ─── GA4 Tab ──────────────────────────────────────────────────────────────────
function Ga4Tab() {
  const [activeMetric, setActiveMetric] = useState(0);

  const chartW = 780;
  const chartH = 180;
  const padX = 40;
  const padTop = 10;
  const innerH = chartH - padTop - 24;

  const normUsers = normalize(GA4_USERS, innerH);
  const normPrev = normalize(GA4_PREV_USERS, innerH);

  const polyUsers = buildPolyline(normUsers, chartW, chartH, padX, padTop);
  const polyPrev = buildPolyline(normPrev, chartW, chartH, padX, padTop);

  const stepX = (chartW - padX * 2) / (GA4_DAYS.length - 1);

  const metrics = [
    {
      label: "Total users",
      value: "212",
      delta: "-4.9%",
      declining: true,
    },
    {
      label: "Active users",
      value: "209",
      delta: "-4.6%",
      declining: true,
    },
    {
      label: "Event count",
      value: "4.3K",
      delta: "-2.9%",
      declining: true,
    },
    {
      label: "Key events",
      value: "0",
      delta: "—",
      declining: false,
    },
  ];

  const recentCards = [
    { icon: "⚙", label: "Tasks", time: "Just now" },
    { icon: "📄", label: "Pages & Screens", time: "Just now" },
    { icon: "🔍", label: "Explorations", time: "Today" },
  ];

  return (
    <div className="pt-4 space-y-4">
      {/* Metric dropdowns row */}
      <div className="grid grid-cols-4 gap-0.5 rounded-xl overflow-hidden border border-app">
        {metrics.map((m, i) => (
          <button
            key={i}
            onClick={() => setActiveMetric(i)}
            className={cn(
              "p-4 text-left transition",
              activeMetric === i
                ? "bg-teal-50 dark:bg-teal-950/30 border-b-2 border-teal-500"
                : "bg-card hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium text-muted-fg">{m.label}</span>
              <span className="text-muted-fg text-xs">▾</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-fg">{m.value}</p>
            <p
              className={cn(
                "text-xs font-medium mt-0.5",
                m.declining
                  ? "text-rose-500"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {m.delta}
            </p>
          </button>
        ))}
      </div>

      {/* SVG line chart */}
      <div className="rounded-xl border border-app bg-card p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-teal-500">
              <span className="w-4 h-0.5 bg-teal-500 inline-block" />
              Last 7 days
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span
                className="w-4 inline-block border-t border-dashed border-zinc-400"
                style={{ height: 0, verticalAlign: "middle" }}
              />
              Previous period
            </span>
          </div>
          <a
            href="#"
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
          >
            View reports snapshot →
          </a>
        </div>

        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          style={{ height: chartH }}
          preserveAspectRatio="none"
        >
          {/* Gridlines */}
          {[0.33, 0.66, 1].map((frac, i) => {
            const y = padTop + (innerH - frac * innerH);
            return (
              <line
                key={i}
                x1={padX}
                x2={chartW - padX}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Previous period (dashed zinc) */}
          <polyline
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyPrev}
          />

          {/* Current period (solid teal) */}
          <polyline
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyUsers}
          />

          {/* X-axis labels */}
          {GA4_DAYS.map((label, i) => (
            <text
              key={i}
              x={padX + i * stepX}
              y={chartH - 4}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              fillOpacity={0.45}
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      {/* Recently accessed cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg mb-2">
          Recently accessed
        </p>
        <div className="grid grid-cols-3 gap-3">
          {recentCards.map((c, i) => (
            <button
              key={i}
              className="flex items-center gap-3 rounded-xl border border-app bg-card p-3.5 text-left hover:bg-muted/40 transition"
            >
              <span className="text-xl">{c.icon}</span>
              <div>
                <p className="text-sm font-medium text-fg">{c.label}</p>
                <p className="text-xs text-muted-fg">{c.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function ReportsSection({ activeTab, onTabChange }: ReportsSectionProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionHeader
        title="Reports"
        subtitle="Performance overview across Blogy, Google Search Console, and Analytics"
      />

      <Tabs
        tabs={[
          { id: "blogy", label: "Blogy" },
          { id: "gsc", label: "Search Console" },
          { id: "ga4", label: "Analytics (GA4)" },
        ]}
        active={activeTab}
        onChange={(id) => onTabChange(id as ReportsTab)}
        variant="underline"
      />

      {activeTab === "blogy" && <BlogyTab />}
      {activeTab === "gsc" && <GscTab />}
      {activeTab === "ga4" && <Ga4Tab />}
    </div>
  );
}
