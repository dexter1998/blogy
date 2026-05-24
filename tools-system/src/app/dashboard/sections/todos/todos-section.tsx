"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { SectionHeader } from "../../_shared/section-header";
import { ScoreGauge } from "../../_shared/score-gauge";
import { Tabs } from "../../_shared/tabs";
import { TODOS, SUGGESTIONS, ACHIEVEMENTS, STREAK } from "../../mock-data";
import type { TodosTab, Todo, Suggestion, Achievement } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceBadgeClass(confidence: number) {
  if (confidence >= 80) return "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300";
  if (confidence >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
}

function impactChipClass(impact: string) {
  if (impact === "high") return "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300";
  if (impact === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
}

function effortChipClass(effort: string) {
  if (effort === "low") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
  if (effort === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
  return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300";
}

function effortLabel(effort: string) {
  if (effort === "low") return "Low (30 min)";
  if (effort === "medium") return "Medium (2–3 hrs)";
  return "High (1–2 days)";
}

function leadEstimate(trafficPotential: number) {
  const rate = 0.007;
  const leads = Math.round(trafficPotential * rate);
  return leads > 0 ? `~${leads}/mo` : "Indirect";
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}>
      {children}
    </span>
  );
}

// ─── Expanded Todo Card (shared by #1 and expanded secondary items) ───────────

function TodoCard({
  todo,
  rank,
  isTop,
  onMarkDone,
}: {
  todo: Todo;
  rank: number;
  isTop: boolean;
  onMarkDone: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-app bg-card border-l-4 border-l-rose-500 overflow-hidden",
        todo.done && "opacity-60",
      )}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-fg uppercase tracking-widest">
              #{rank}
            </span>
            {isTop && !todo.done && (
              <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                Do This First
              </span>
            )}
            {todo.done && (
              <span className="rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                Done
              </span>
            )}
          </div>
          {todo.confidence != null && (
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0", confidenceBadgeClass(todo.confidence))}>
              Confidence: {todo.confidence}%
            </span>
          )}
        </div>

        {/* Title */}
        <p className={cn("text-base font-semibold text-fg mb-4", todo.done && "line-through text-muted-fg")}>
          {todo.title}
        </p>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] text-muted-fg uppercase tracking-wide font-medium mb-0.5">Traffic Potential</p>
            <p className="text-sm font-bold text-fg tabular-nums">
              {todo.trafficPotential && todo.trafficPotential > 0
                ? `${todo.trafficPotential.toLocaleString()}/mo`
                : "Unlocks data"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] text-muted-fg uppercase tracking-wide font-medium mb-0.5">Lead Potential</p>
            <p className="text-sm font-bold text-fg">
              {todo.impact === "high" ? "High" : todo.impact === "medium" ? "Medium" : "Low"}
              {todo.trafficPotential && todo.trafficPotential > 0 && (
                <span className="ml-1 text-muted-fg font-normal">({leadEstimate(todo.trafficPotential)})</span>
              )}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] text-muted-fg uppercase tracking-wide font-medium mb-0.5">Effort</p>
            <p className="text-sm font-bold text-fg capitalize">{effortLabel(todo.effort)}</p>
          </div>
        </div>

        {/* Why callout */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/20 px-3.5 py-2.5 mb-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-0.5">
            Why
          </p>
          <p className="text-sm text-amber-900 dark:text-amber-200/80">{todo.reason}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" disabled={todo.done}>
            {todo.id === "td6" ? "Connect Now" : isTop ? "Create Now" : "Start Now"}
          </Button>
          <Button variant="ghost" size="sm" disabled={todo.done}>
            Schedule
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkDone(todo.id)}
            className={cn(todo.done && "text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-700")}
          >
            {todo.done ? "✓ Done" : "Mark Done"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Compact row for todos #2–6 ───────────────────────────────────────────────

function TodoRow({
  todo,
  rank,
  expanded,
  onToggle,
  onMarkDone,
}: {
  todo: Todo;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
  onMarkDone: (id: string) => void;
}) {
  return (
    <div className={cn("border-b border-app/60 last:border-0", todo.done && "opacity-60")}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition group"
      >
        {/* Rank */}
        <span className="text-xs font-bold text-muted-fg w-6 shrink-0">#{rank}</span>

        {/* Checkbox / done indicator */}
        <span
          onClick={(e) => { e.stopPropagation(); onMarkDone(todo.id); }}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition cursor-pointer",
            todo.done
              ? "bg-teal-500 border-teal-500 text-white"
              : "border-zinc-300 dark:border-zinc-600 hover:border-teal-400",
          )}
        >
          {todo.done && <span className="text-[10px] font-bold">✓</span>}
        </span>

        {/* Title */}
        <span className={cn("flex-1 text-sm font-medium text-fg min-w-0 truncate", todo.done && "line-through text-muted-fg")}>
          {todo.title}
        </span>

        {/* Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Chip className={impactChipClass(todo.impact)}>
            Impact: {todo.impact.charAt(0).toUpperCase() + todo.impact.slice(1)}
          </Chip>
          <Chip className={effortChipClass(todo.effort)}>
            Effort: {todo.effort.charAt(0).toUpperCase() + todo.effort.slice(1)}
          </Chip>
        </div>

        {/* Expand arrow */}
        <span className={cn("text-muted-fg text-xs transition-transform shrink-0", expanded && "rotate-90")}>
          →
        </span>
      </button>

      {/* Expanded state */}
      {expanded && (
        <div className="px-4 pb-4">
          <TodoCard todo={todo} rank={rank} isTop={false} onMarkDone={onMarkDone} />
        </div>
      )}
    </div>
  );
}

// ─── Tab 1: Priority Engine ───────────────────────────────────────────────────

function PriorityEngineTab() {
  const [doneIds, setDoneIds] = useState<Set<string>>(
    () => new Set(TODOS.filter((t) => t.done).map((t) => t.id)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const todos = TODOS.map((t) => ({ ...t, done: doneIds.has(t.id) }));
  const [top, ...rest] = todos;

  const highImpactPending = todos.filter((t) => t.impact === "high" && !t.done).length;

  function markDone(id: string) {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Engine header callout */}
      <div className="rounded-xl border border-app bg-muted/30 px-4 py-3 flex items-center gap-2">
        <span className="text-teal-500 text-base">◈</span>
        <p className="text-sm text-muted-fg">
          <span className="font-semibold text-fg">
            {highImpactPending} high-impact task{highImpactPending !== 1 ? "s" : ""} this week
          </span>
          {" — start with the highest ROI action."}
        </p>
      </div>

      {/* #1 card — always expanded */}
      {top && <TodoCard todo={top} rank={1} isTop={true} onMarkDone={markDone} />}

      {/* #2–6 compact rows */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-app bg-card overflow-hidden">
          {rest.map((todo, idx) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              rank={idx + 2}
              expanded={expandedId === todo.id}
              onToggle={() => setExpandedId((prev) => (prev === todo.id ? null : todo.id))}
              onMarkDone={markDone}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Suggestions ───────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 tabular-nums w-8 shrink-0">
        {value}%
      </span>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-app bg-card p-5 space-y-3">
      {/* Top: confidence bar + impact chip */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-muted-fg font-medium uppercase tracking-wide">Confidence</span>
            <Chip className={impactChipClass(suggestion.impact)}>
              Impact: {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)}
            </Chip>
          </div>
          <ConfidenceBar value={suggestion.confidence} />
        </div>
      </div>

      {/* Title + description */}
      <div>
        <p className="text-sm font-semibold text-fg mb-0.5">{suggestion.title}</p>
        <p className="text-sm text-muted-fg">{suggestion.description}</p>
      </div>

      {/* Traffic potential */}
      {suggestion.trafficPotential != null && suggestion.trafficPotential > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-fg uppercase tracking-wide font-medium">Traffic Potential:</span>
          <span className="text-sm font-semibold text-fg tabular-nums">
            {suggestion.trafficPotential.toLocaleString()}/month
          </span>
        </div>
      )}

      {/* Why this? inline box */}
      {whyOpen && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-800/60 p-3">
          <p className="text-sm text-teal-900 dark:text-teal-200/80">{suggestion.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="primary" size="sm">Create Content</Button>
        <Button variant="ghost" size="sm">Schedule</Button>
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
        <button
          onClick={() => setWhyOpen((v) => !v)}
          className={cn(
            "ml-auto inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
            whyOpen
              ? "border-teal-300 bg-teal-100 text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
              : "border-app bg-card text-muted-fg hover:text-fg",
          )}
        >
          <span className="text-[13px]">ⓘ</span> Why this?
        </button>
      </div>
    </div>
  );
}

function SuggestionsTab() {
  return (
    <div className="space-y-4 pt-4">
      <div className="rounded-xl border border-app bg-muted/30 px-4 py-3 flex items-center gap-2">
        <span className="text-amber-500 text-base">◎</span>
        <p className="text-sm text-muted-fg">
          <span className="font-semibold text-fg">{SUGGESTIONS.length} AI-surfaced opportunities</span>
          {" — ranked by traffic impact and competitive timing."}
        </p>
      </div>
      {SUGGESTIONS.map((s) => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </div>
  );
}

// ─── Tab 3: Achievements ──────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric", day: "numeric" });
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const isComplete = achievement.pct === 100;
  const isLocked = achievement.pct === 0;
  const isInProgress = !isComplete && !isLocked;

  return (
    <div className="flex items-center gap-4 p-4 border-b border-app/60 last:border-0 hover:bg-muted/20 transition">
      {/* Score gauge */}
      <ScoreGauge
        score={achievement.pct}
        size={40}
        strokeWidth={4}
        showLabel={false}
      />

      {/* Icon */}
      <span className="text-2xl shrink-0 select-none">{achievement.icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold text-fg", isLocked && "text-muted-fg")}>{achievement.title}</p>
        <p className="text-xs text-muted-fg mt-0.5 truncate">{achievement.description}</p>
      </div>

      {/* Status */}
      <div className="shrink-0 text-right">
        {isComplete && achievement.completedAt && (
          <div className="flex items-center gap-1.5">
            <span className="text-teal-500 text-sm font-bold">✓</span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              {formatDate(achievement.completedAt)}
            </span>
          </div>
        )}
        {isInProgress && (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-600 dark:text-amber-400 text-sm font-bold tabular-nums">
              {achievement.pct}%
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">ongoing</span>
          </div>
        )}
        {isLocked && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            🔒 Locked
          </span>
        )}
      </div>
    </div>
  );
}

function AchievementsTab() {
  const completed = ACHIEVEMENTS.filter((a) => a.pct === 100);
  const inProgress = ACHIEVEMENTS.filter((a) => a.pct > 0 && a.pct < 100);
  const locked = ACHIEVEMENTS.filter((a) => a.pct === 0);

  const ordered = [...completed, ...inProgress, ...locked];

  return (
    <div className="space-y-5 pt-4">
      {/* Streak banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/60 p-4 flex items-center gap-3">
        <span className="text-3xl select-none">🔥</span>
        <div>
          <p className="text-base font-bold text-amber-800 dark:text-amber-300">
            {STREAK.weeks} Weeks Consistent Publishing Streak
          </p>
          <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
            Keep publishing weekly to maintain your streak and authority signal.
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip className="bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {completed.length} Completed
        </Chip>
        <Chip className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          {inProgress.length} In Progress
        </Chip>
        {locked.length > 0 && (
          <Chip className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {locked.length} Locked
          </Chip>
        )}
      </div>

      {/* Achievement list */}
      <div className="rounded-xl border border-app bg-card overflow-hidden">
        {ordered.map((a) => (
          <AchievementRow key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "suggestions", label: "Suggestions" },
  { id: "achievements", label: "Achievements" },
];

export function TodosSection({
  activeTab,
  onTabChange,
}: {
  activeTab: TodosTab;
  onTabChange: (tab: TodosTab) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeader
        title="Priority Engine"
        subtitle="Your highest-ROI SEO actions, ranked by impact and confidence."
      />

      <Tabs
        tabs={TABS}
        active={activeTab}
        onChange={(id) => onTabChange(id as TodosTab)}
        variant="underline"
      />

      {activeTab === "todos" && <PriorityEngineTab />}
      {activeTab === "suggestions" && <SuggestionsTab />}
      {activeTab === "achievements" && <AchievementsTab />}
    </div>
  );
}
