"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader } from "../../_shared/section-header";
import { TRENDS, COMPETITOR_CHANGES } from "../../mock-data";
import type { Trend, CompetitorChange } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CARD_GRADIENTS = [
  "from-teal-500 to-teal-700",
  "from-violet-500 to-violet-700",
  "from-amber-500 to-amber-700",
  "from-blue-500 to-blue-700",
  "from-rose-500 to-rose-700",
  "from-emerald-500 to-emerald-700",
  "from-indigo-500 to-indigo-700",
  "from-orange-500 to-orange-700",
];

function maturityLabel(maturity: Trend["maturity"]) {
  if (maturity === "emerging") return { label: "Emerging", cls: "bg-teal-500 text-white" };
  if (maturity === "growing")  return { label: "Growing",  cls: "bg-amber-500 text-white" };
  return                              { label: "Saturated", cls: "bg-zinc-500 text-white" };
}

function potentialDot(level: "high" | "medium" | "low") {
  if (level === "high")   return "bg-teal-500";
  if (level === "medium") return "bg-amber-500";
  return "bg-zinc-400";
}

function windowLabel(windowDays: number | null) {
  if (windowDays === null) return null;
  const cls = windowDays <= 7 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400";
  return <span className={cn("text-[10px] font-semibold", cls)}>Act in {windowDays}d</span>;
}

// ─── News-style trend card ─────────────────────────────────────────────────────

function TrendCard({ trend, index, onCreateContent, onDismiss }: {
  trend: Trend;
  index: number;
  onCreateContent: () => void;
  onDismiss: (id: string) => void;
}) {
  const { id, keyword, volume, maturity, windowDays, trafficPotential, difficulty, confidence, competitorsCovering, youCovering } = trend;
  const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length]!;
  const mat  = maturityLabel(maturity);
  const win  = windowLabel(windowDays);

  return (
    <div className="group relative rounded-xl border border-app bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Image area with gradient */}
      <div className={cn("relative h-[120px] bg-gradient-to-br flex items-end p-3", grad)}>
        {/* Maturity badge */}
        <span className={cn("absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full", mat.cls)}>
          {mat.label}
        </span>
        {/* Window */}
        {win && (
          <span className="absolute top-2.5 right-2.5 bg-white/90 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {win}
          </span>
        )}
        {/* Keyword overlay */}
        <h3 className="text-white font-bold text-sm leading-tight capitalize line-clamp-2 drop-shadow">{keyword}</h3>
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">
        {/* Volume + confidence */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-fg">{volume.toLocaleString()} /mo</span>
          <span className="text-[10px] text-muted-fg font-medium">Conf. {confidence}%</span>
        </div>

        {/* Potential dots */}
        <div className="flex items-center gap-3 text-[10px] text-muted-fg">
          <span className="flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", potentialDot(trafficPotential))} />
            Traffic
          </span>
          <span className="flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", difficulty === "low" ? "bg-emerald-500" : difficulty === "medium" ? "bg-amber-500" : "bg-rose-500")} />
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} diff
          </span>
          <span className="ml-auto text-[10px]">
            {competitorsCovering}c · {youCovering}y
          </span>
        </div>
      </div>

      {/* Hover action overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
        <button
          onClick={onCreateContent}
          className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-xs font-semibold py-2 transition"
        >
          Create Content
        </button>
        <button className="w-full rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-1.5 transition">
          Schedule Later
        </button>
        <button
          onClick={() => onDismiss(id)}
          className="text-white/60 hover:text-white text-[11px] transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Zero Click Opportunity Center ────────────────────────────────────────────

const ZERO_CLICK_DATA = {
  featured_snippet: { label: "Featured Snippet",  icon: "⭐", count: "3 opportunities", action: "View",     items: ["how to compare health insurance plans", "term insurance tax benefit 80C", "cashless insurance process"] },
  paa:              { label: "People Also Ask",   icon: "❓", count: "12 opportunities", action: "View",     items: ["what is group health insurance", "how does cashless claim work", "which term plan is best in India"] },
  ai_overview:      { label: "AI Overview Ready", icon: "🤖", count: "5 pages",          action: "View",     items: ["Best Term Insurance Plans 2025", "Health Insurance Comparison Guide", "Cashless Claim Process Explained"] },
  knowledge_panel:  { label: "Knowledge Panel",   icon: "🏛",  count: "0",               action: "Optimize", items: [] },
};
type ZeroClickKey = keyof typeof ZERO_CLICK_DATA;

function ZeroClickSection() {
  const [expanded, setExpanded] = useState<ZeroClickKey | null>(null);
  const toggle = (key: ZeroClickKey) => setExpanded((p) => p === key ? null : key);

  return (
    <div className="rounded-xl border border-app bg-card p-5 space-y-1">
      <h3 className="text-sm font-semibold text-fg mb-4">Zero Click Opportunities</h3>
      {(Object.keys(ZERO_CLICK_DATA) as ZeroClickKey[]).map((key) => {
        const { label, icon, count, action, items } = ZERO_CLICK_DATA[key];
        const isExpanded = expanded === key;
        return (
          <div key={key}>
            <div className="flex items-center gap-3 py-2.5 rounded-lg px-2 hover:bg-muted/60 transition-colors">
              <span className="text-base w-6 text-center shrink-0">{icon}</span>
              <span className="flex-1 text-sm text-fg font-medium">{label}</span>
              <span className="text-xs text-muted-fg mr-3">{count}</span>
              <button
                onClick={() => toggle(key)}
                className={cn("text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors shrink-0",
                  items.length === 0 ? "border border-app text-muted-fg hover:bg-muted"
                  : isExpanded ? "bg-teal-500 text-white"
                  : "border border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                )}
              >
                {isExpanded ? "Hide" : action}
              </button>
            </div>
            {isExpanded && items.length > 0 && (
              <div className="ml-9 mb-2 rounded-lg bg-muted/40 border border-app px-3 py-2 space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-fg">
                    <span className="text-teal-500 shrink-0">›</span>
                    <span className="capitalize">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Competitor Activity Feed ──────────────────────────────────────────────────

function changeIcon(type: CompetitorChange["type"]) {
  if (type === "pages_added")        return "📄";
  if (type === "pages_removed")      return "📄";
  if (type === "homepage_messaging") return "🏠";
  if (type === "new_service")        return "🚀";
  return "📌";
}

function changeText(change: CompetitorChange) {
  if (change.type === "pages_added")        return `${change.competitor} added ${change.count} new pages`;
  if (change.type === "pages_removed")      return `${change.competitor} removed ${change.count} pages`;
  if (change.type === "homepage_messaging") return `${change.competitor} changed homepage: "${change.detail}"`;
  if (change.type === "new_service")        return `${change.competitor} launched: ${change.detail}`;
  return change.competitor;
}

function CompetitorFeed() {
  return (
    <div className="rounded-xl border border-app bg-card p-5">
      <h3 className="text-sm font-semibold text-fg mb-4">Competitor Moves (Last 7 Days)</h3>
      <div className="space-y-1">
        {COMPETITOR_CHANGES.map((change, i) => (
          <div key={i} className={cn("flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 transition-colors", change.type === "pages_removed" && "opacity-60")}>
            <span className="text-base shrink-0 mt-px">{changeIcon(change.type)}</span>
            <span className="flex-1 text-sm text-fg leading-snug">{changeText(change)}</span>
            <span className="text-[11px] text-muted-fg whitespace-nowrap shrink-0 mt-px tabular-nums">{change.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function TrendsSection({ onCreateContent }: { onCreateContent: () => void }) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const dismiss = (id: string) => setDismissedIds((p) => new Set([...p, id]));
  const visible = TRENDS.filter((t) => !dismissedIds.has(t.id));
  const displayed = showAll ? visible : visible.slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionHeader title="Trend Discovery" subtitle="Emerging opportunities ranked by traffic potential" />

      {/* News grid */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-app bg-card p-10 text-center text-sm text-muted-fg">
          All trends dismissed. Check back tomorrow.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((trend, i) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                index={i}
                onCreateContent={onCreateContent}
                onDismiss={dismiss}
              />
            ))}
          </div>

          {visible.length > 8 && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="rounded-lg border border-app hover:bg-muted text-xs font-medium text-muted-fg px-5 py-2 transition"
              >
                {showAll ? "Show less" : `Show more (${visible.length - 8} more)`}
              </button>
            </div>
          )}
        </>
      )}

      <ZeroClickSection />
      <CompetitorFeed />
    </div>
  );
}
