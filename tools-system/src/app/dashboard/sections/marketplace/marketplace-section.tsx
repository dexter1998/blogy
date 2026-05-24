"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Badge, Button } from "@/components/ui";
import { SectionHeader } from "../../_shared/section-header";
import { MARKETPLACE_ITEMS, COMPANY, COMPETITORS } from "../../mock-data";
import type { MarketplaceItem } from "../../types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<MarketplaceItem["type"], string> = {
  backlink: "Backlink",
  guest_post: "Guest Post",
  pr: "PR Package",
  social: "Social Promotion",
  geo: "GEO Package",
};

const TYPE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Guest Post", value: "guest_post" },
  { label: "Backlink", value: "backlink" },
  { label: "PR", value: "pr" },
  { label: "GEO", value: "geo" },
  { label: "Social", value: "social" },
];

const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevant" },
  { label: "Lowest Price", value: "price_asc" },
  { label: "Highest DA", value: "da_desc" },
];

function avgCompetitorDa(): number {
  const total = COMPETITORS.reduce((s, c) => s + c.da, 0);
  return Math.round(total / COMPETITORS.length);
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

// ─── Recommended Header Card ───────────────────────────────────────────────────

function RecommendedCard() {
  const topItem = MARKETPLACE_ITEMS[0]!; // startupindiastory.com
  const avgDa = avgCompetitorDa();
  const daGap = avgDa - COMPANY.da;

  const gaps = [
    `You need backlinks — competitors avg DA ${avgDa}, you have DA ${COMPANY.da}`,
    `Authority gap: ${daGap} DA points below competitor average`,
    `Health Insurance cluster needs 3rd-party citations`,
  ];

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-5">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">
          Recommended For FinShield Right Now
        </p>
        <h2 className="text-base font-semibold text-fg">
          Based on your current gaps:
        </h2>
      </div>

      <ul className="space-y-2 mb-5">
        {gaps.map((gap, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="text-teal-500 font-bold flex-shrink-0 mt-0.5 text-sm">↗</span>
            <span className="text-sm text-fg leading-snug">{gap}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-teal-200 dark:border-teal-700 bg-white/60 dark:bg-teal-950/30 px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
          Top Recommendation: Guest Post
        </p>
        <p className="text-sm font-semibold text-fg mb-1">
          on{" "}
          <span className="text-teal-600 dark:text-teal-400">
            {topItem.site}
          </span>{" "}
          (DA {topItem.da})
        </p>
        <p className="text-sm text-muted-fg leading-snug mb-3">
          Reason: {topItem.upsellReason}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-fg tabular-nums">
            {formatPrice(topItem.price)}
          </span>
          <Button
            size="sm"
            className="bg-teal-500 hover:opacity-90 text-white border-0"
          >
            View Package →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort + Filter Bar ─────────────────────────────────────────────────────────

interface FilterBarProps {
  sort: string;
  filter: string;
  onSort: (v: string) => void;
  onFilter: (v: string) => void;
}

function FilterBar({ sort, filter, onSort, onFilter }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      {/* Sort */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-fg font-medium mr-1">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSort(opt.value)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
              sort === opt.value
                ? "border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                : "border-app bg-card text-muted-fg hover:text-fg hover:bg-muted",
            )}
          >
            {opt.label}
            {sort === opt.value && <span className="ml-1 text-teal-500">✓</span>}
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted-fg font-medium mr-1">Filter:</span>
        {TYPE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilter(opt.value)}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
              filter === opt.value
                ? "border-zinc-400 dark:border-zinc-500 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                : "border-app bg-card text-muted-fg hover:text-fg hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Marketplace Card ──────────────────────────────────────────────────────────

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const initial = item.site.charAt(0).toUpperCase();
  const showDa = item.da > 0;

  return (
    <div className="rounded-2xl border border-app bg-card p-5 flex flex-col gap-3 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-zinc-600 dark:text-zinc-300">
            {initial}
          </span>
        </div>

        {/* Site info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg leading-snug truncate">
            {item.site}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {showDa ? (
              <span className="inline-flex items-center bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-full px-2 py-0.5 text-xs font-semibold">
                DA {item.da}
              </span>
            ) : (
              <span className="inline-flex items-center bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-full px-2 py-0.5 text-xs font-semibold">
                —
              </span>
            )}
            <span className="inline-flex items-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full px-2 py-0.5 text-xs font-medium">
              {item.category}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-2xl font-bold text-fg tabular-nums">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Why this matters */}
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
          Why this matters for you:
        </p>
        <p className="text-xs text-muted-fg leading-relaxed">
          {item.upsellReason}
        </p>
      </div>

      {/* CTA */}
      <Button
        size="sm"
        className="w-full bg-teal-500 hover:opacity-90 text-white border-0 mt-auto"
      >
        Get Started →
      </Button>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function MarketplaceSection() {
  const [sort, setSort] = useState("relevant");
  const [filter, setFilter] = useState("all");

  const displayItems = useMemo(() => {
    let items = [...MARKETPLACE_ITEMS];

    // Filter
    if (filter !== "all") {
      items = items.filter((item) => item.type === filter);
    }

    // Sort
    if (sort === "price_asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "da_desc") {
      items.sort((a, b) => b.da - a.da);
    }
    // "relevant" = original order (no re-sort)

    return items;
  }, [sort, filter]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marketplace"
        subtitle="Curated backlinks, PR, and growth packages — selected for FinShield's authority gaps"
        action={
          <Badge tone="accent">
            {MARKETPLACE_ITEMS.length} packages available
          </Badge>
        }
      />

      {/* 1. Recommended header card */}
      <RecommendedCard />

      {/* 2. Sort + Filter bar */}
      <FilterBar
        sort={sort}
        filter={filter}
        onSort={setSort}
        onFilter={setFilter}
      />

      {/* 3. Marketplace grid */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map((item) => (
            <MarketplaceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-app bg-card p-10 text-center">
          <p className="text-sm text-muted-fg">
            No packages match the selected filter. Try{" "}
            <button
              onClick={() => setFilter("all")}
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              viewing all
            </button>
            .
          </p>
        </div>
      )}

      {/* 4. Footer — Request Integration */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-sm text-muted-fg">
          Can&apos;t find what you need?
        </p>
        <button className="inline-flex items-center gap-2 rounded-xl border border-dashed border-app bg-transparent text-muted-fg hover:text-fg hover:border-zinc-400 dark:hover:border-zinc-500 px-5 py-2.5 text-sm font-medium transition-colors">
          + Request a Partnership
        </button>
      </div>
    </div>
  );
}
