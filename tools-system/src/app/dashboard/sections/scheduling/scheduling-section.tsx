"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader } from "../../_shared/section-header";
import { SCHEDULE_EVENTS, PUBLISHING_VELOCITY } from "../../mock-data";
import type { CalView, ContentType } from "../../types";

interface SchedulingSectionProps {
  view: CalView;
  onViewChange: (v: CalView) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  onCreateContent: (d: Date) => void;
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────
interface CalCell {
  date: Date | null;
  current: boolean;
}

function buildMonthGrid(anchor: Date): CalCell[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalCell[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ date: null, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true });
  while (cells.length < 42) cells.push({ date: null, current: false });
  return cells;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Event color map ──────────────────────────────────────────────────────────
const EVENT_COLORS: Record<ContentType, string> = {
  blog: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  social: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  video: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  image: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
};

const EVENT_DOT: Record<ContentType, string> = {
  blog: "bg-teal-500",
  social: "bg-purple-500",
  video: "bg-orange-500",
  image: "bg-pink-500",
};

// ─── Content gap detection ────────────────────────────────────────────────────
function getGapCells(cells: CalCell[]): Set<string> {
  const eventDates = new Set(SCHEDULE_EVENTS.map((e) => e.date));
  const gaps = new Set<string>();
  let streak = 0;
  const streakCells: string[] = [];

  for (const cell of cells) {
    if (!cell.date || !cell.current) {
      streak = 0;
      streakCells.length = 0;
      continue;
    }
    const ymd = toYMD(cell.date);
    if (!eventDates.has(ymd)) {
      streak++;
      streakCells.push(ymd);
      if (streak >= 6) {
        streakCells.forEach((s) => gaps.add(s));
      }
    } else {
      streak = 0;
      streakCells.length = 0;
    }
  }
  return gaps;
}

// ─── Mini calendar (left panel) ──────────────────────────────────────────────
function MiniCalendar({ date, onDateChange }: { date: Date; onDateChange: (d: Date) => void }) {
  const [mini, setMini] = useState(new Date(date));
  const today = new Date();
  const cells = buildMonthGrid(mini);

  const prevMonth = () => setMini(new Date(mini.getFullYear(), mini.getMonth() - 1, 1));
  const nextMonth = () => setMini(new Date(mini.getFullYear(), mini.getMonth() + 1, 1));

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 text-muted-fg hover:text-fg transition rounded">
          ‹
        </button>
        <span className="text-xs font-semibold text-fg">
          {MONTH_NAMES[mini.getMonth()]!.slice(0, 3)} {mini.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-1 text-muted-fg hover:text-fg transition rounded">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-fg py-0.5 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, date);
          return (
            <button
              key={i}
              onClick={() => onDateChange(cell.date!)}
              className={cn(
                "flex items-center justify-center rounded-full text-[11px] w-6 h-6 mx-auto transition",
                isToday
                  ? "bg-teal-500 text-white font-semibold"
                  : isSelected
                  ? "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 font-medium"
                  : "text-fg hover:bg-muted"
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Content Type Filter ──────────────────────────────────────────────────────
const CONTENT_TYPES: { type: ContentType; label: string; color: string }[] = [
  { type: "blog", label: "Blog", color: "bg-teal-500" },
  { type: "social", label: "Social", color: "bg-purple-500" },
  { type: "video", label: "Video", color: "bg-orange-500" },
  { type: "image", label: "Image", color: "bg-pink-500" },
];

function ContentTypeFilter({
  enabled,
  onToggle,
}: {
  enabled: Set<ContentType>;
  onToggle: (t: ContentType) => void;
}) {
  return (
    <div className="px-3 py-2 border-t border-app">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-fg mb-2">
        Content Types
      </p>
      <div className="space-y-1.5">
        {CONTENT_TYPES.map((ct) => (
          <label
            key={ct.type}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={enabled.has(ct.type)}
              onChange={() => onToggle(ct.type)}
              className="sr-only"
            />
            <span
              className={cn(
                "w-3.5 h-3.5 rounded flex items-center justify-center border transition shrink-0",
                enabled.has(ct.type)
                  ? `${ct.color} border-transparent`
                  : "border-app bg-muted"
              )}
            >
              {enabled.has(ct.type) && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-xs text-fg group-hover:text-fg transition">{ct.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Month Grid ───────────────────────────────────────────────────────────────
function MonthGrid({
  date,
  enabledTypes,
  onCreateContent,
}: {
  date: Date;
  enabledTypes: Set<ContentType>;
  onCreateContent: (d: Date) => void;
}) {
  const today = new Date();
  const cells = useMemo(() => buildMonthGrid(date), [date]);
  const gapCells = useMemo(() => getGapCells(cells), [cells]);

  // Build map: ymd → events
  const eventMap = useMemo(() => {
    const map = new Map<string, typeof SCHEDULE_EVENTS>();
    for (const ev of SCHEDULE_EVENTS) {
      if (!enabledTypes.has(ev.type)) continue;
      const arr = map.get(ev.date) ?? [];
      arr.push(ev);
      map.set(ev.date, arr);
    }
    return map;
  }, [enabledTypes]);

  return (
    <div className="flex-1 overflow-hidden">
      {/* Day header row */}
      <div className="grid grid-cols-7 border-b border-app">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="px-2 py-2 text-xs font-semibold text-muted-fg uppercase tracking-wider border-r border-app last:border-r-0"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7" style={{ gridAutoRows: "minmax(100px, 1fr)" }}>
        {cells.map((cell, i) => {
          const isToday = cell.date ? isSameDay(cell.date, today) : false;
          const isCurrentMonth = cell.current;
          const ymd = cell.date ? toYMD(cell.date) : null;
          const events = ymd ? (eventMap.get(ymd) ?? []) : [];
          const isGap = ymd ? gapCells.has(ymd) : false;

          return (
            <div
              key={i}
              onClick={() => cell.date && onCreateContent(cell.date)}
              className={cn(
                "min-h-[100px] border-b border-r border-app p-1 cursor-pointer transition relative",
                isCurrentMonth ? "hover:bg-muted/50" : "bg-muted/20 opacity-50",
                isGap && isCurrentMonth && events.length === 0
                  ? "bg-amber-50/60 dark:bg-amber-950/10"
                  : ""
              )}
            >
              {/* Date number */}
              {cell.date && (
                <div className="flex justify-end mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                      isToday
                        ? "bg-teal-500 text-white"
                        : "text-muted-fg"
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                </div>
              )}

              {/* Gap tooltip indicator */}
              {isGap && isCurrentMonth && events.length === 0 && (
                <div
                  title="No content scheduled"
                  className="absolute top-1 left-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                </div>
              )}

              {/* Events */}
              <div className="space-y-0.5">
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium truncate mb-0.5 flex items-center gap-1",
                      EVENT_COLORS[ev.type]
                    )}
                    title={ev.title}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", EVENT_DOT[ev.type])} />
                    {ev.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-[10px] text-muted-fg px-1">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── View Stub ────────────────────────────────────────────────────────────────
function ViewStub({ view }: { view: "week" | "day" }) {
  return (
    <div className="flex-1 flex items-center justify-center rounded-xl border border-app bg-muted/20 text-muted-fg text-sm min-h-[400px]">
      {view === "week" ? "Week view coming soon" : "Day view coming soon"}
    </div>
  );
}

// ─── Publishing Velocity Banner ───────────────────────────────────────────────
function VelocityBanner() {
  const { current, recommended, unit } = PUBLISHING_VELOCITY;
  const pct = Math.min((current / recommended) * 100, 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/10 px-4 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-amber-500 flex-shrink-0 text-sm">⚡</span>
        <span className="text-sm text-fg">
          <span className="font-medium">Publishing Velocity:</span>{" "}
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Current {current}/{unit.split("/")[1]}
          </span>
          <span className="text-muted-fg mx-1">→</span>
          <span className="text-teal-600 dark:text-teal-400 font-semibold">
            Recommended {recommended}/{unit.split("/")[1]}
          </span>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <div className="w-24 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline whitespace-nowrap">
          Update Schedule
        </button>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function SchedulingSection({
  view,
  onViewChange,
  date,
  onDateChange,
  onCreateContent,
}: SchedulingSectionProps) {
  const [enabledTypes, setEnabledTypes] = useState<Set<ContentType>>(
    new Set(["blog", "social", "video", "image"] as ContentType[])
  );

  const toggleType = (t: ContentType) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const prevMonth = () => onDateChange(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => onDateChange(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  const goToday = () => onDateChange(new Date());

  // Count events this month for category badge
  const thisMonthCount = useMemo(() => {
    const y = date.getFullYear();
    const m = date.getMonth();
    return SCHEDULE_EVENTS.filter((ev) => {
      const d = new Date(ev.date);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [date]);

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Content Calendar"
        subtitle="Plan and track your publishing schedule"
        action={
          <button
            onClick={() => onCreateContent(new Date())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 text-sm font-medium transition"
          >
            + New Content
          </button>
        }
      />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Nav + title */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-app bg-card hover:bg-muted transition text-muted-fg hover:text-fg"
          >
            ←
          </button>
          <h2 className="text-base font-semibold text-fg min-w-[120px] text-center">
            {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-app bg-card hover:bg-muted transition text-muted-fg hover:text-fg"
          >
            →
          </button>
          <button
            onClick={goToday}
            className="flex items-center gap-1.5 rounded-lg border border-app bg-card px-2.5 py-1.5 text-xs font-medium text-muted-fg hover:text-fg hover:bg-muted transition"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            Today
          </button>
        </div>

        {/* View switcher */}
        <div className="flex rounded-lg border border-app overflow-hidden">
          {(["month", "week", "day"] as CalView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition border-r border-app last:border-r-0",
                view === v
                  ? "bg-teal-500 text-white"
                  : "bg-card text-muted-fg hover:bg-muted hover:text-fg"
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity banner */}
      <div className="mb-4">
        <VelocityBanner />
      </div>

      {/* ── Main layout: Left panel + Calendar ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel — 240px */}
        <div className="w-60 flex-shrink-0 rounded-xl border border-app bg-card overflow-hidden flex flex-col">
          {/* Mini calendar */}
          <MiniCalendar date={date} onDateChange={onDateChange} />

          {/* Content types */}
          <ContentTypeFilter enabled={enabledTypes} onToggle={toggleType} />

          {/* Categories */}
          <div className="px-3 py-2 border-t border-app">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-fg">
                This Month
              </p>
              <span className="rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[10px] font-semibold px-1.5 py-0.5">
                {thisMonthCount}
              </span>
            </div>
            <div className="space-y-1">
              {CONTENT_TYPES.map((ct) => {
                const count = SCHEDULE_EVENTS.filter(
                  (e) =>
                    e.type === ct.type &&
                    new Date(e.date).getMonth() === date.getMonth() &&
                    new Date(e.date).getFullYear() === date.getFullYear()
                ).length;
                return (
                  <div key={ct.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", ct.color)} />
                      <span className="text-xs text-muted-fg capitalize">{ct.label}</span>
                    </div>
                    <span className="text-xs font-medium text-fg">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="px-3 py-2 border-t border-app mt-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-fg mb-1.5">
              Legend
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-fg">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Content gap detected
            </div>
          </div>
        </div>

        {/* Calendar area */}
        <div className="flex-1 rounded-xl border border-app bg-card overflow-hidden flex flex-col">
          {view === "month" && (
            <MonthGrid
              date={date}
              enabledTypes={enabledTypes}
              onCreateContent={onCreateContent}
            />
          )}
          {view === "week" && <ViewStub view="week" />}
          {view === "day" && <ViewStub view="day" />}
        </div>
      </div>
    </div>
  );
}
