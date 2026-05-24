"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import { ScoreGauge } from "../../_shared/score-gauge";
import { SectionHeader } from "../../_shared/section-header";
import {
  COMPANY,
  AI_KNOWLEDGE,
  AI_LEARNING,
  SEO_HEALTH_TIMELINE,
  COMPETITORS,
  COMPETITOR_CHANGES,
  CONTENT_CLUSTERS,
  SEO_ISSUES,
  BRAND_COLORS,
  BRAND_FONTS,
  CONTENT_ROI,
} from "../../mock-data";

// ─── Accordion ────────────────────────────────────────────────────────────────

interface AccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: (id: string) => void;
}

function AccordionSection({ id, title, subtitle, badge, children, open, onToggle }: AccordionSectionProps) {
  return (
    <div className="border border-app rounded-xl overflow-hidden bg-card shadow-sm">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-fg">{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-muted-fg mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={cn("shrink-0 text-muted-fg transition-transform duration-200", open && "rotate-180")}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 pb-5 pt-1 border-t border-app">{children}</div>
      </div>
    </div>
  );
}

// ─── Section 1: Business DNA ──────────────────────────────────────────────────

const PERSONA_EMOJIS: Record<string, string> = {
  "Startup Founder": "🚀",
  "Salaried Professional": "👤",
  "HR Manager": "📋",
};

const VOICE_POSITION = 25; // percent along slider (0=professional, 100=casual)

function BusinessDnaSection() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6 pt-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-fg uppercase tracking-wider font-medium">Business Memory</span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
            editing
              ? "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
              : "border border-app bg-card text-muted-fg hover:text-fg hover:bg-muted"
          )}
        >
          {editing ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Save Memory
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 2l2 2L4 10H2V8L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Edit Memory
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Audience */}
        <div className="rounded-lg bg-muted/50 border border-app p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-2">Who do we sell to?</div>
          {editing ? (
            <textarea
              className="w-full text-sm text-fg bg-transparent resize-none outline-none leading-relaxed"
              defaultValue={AI_KNOWLEDGE.targetAudience}
              rows={2}
            />
          ) : (
            <p className="text-sm text-fg leading-relaxed">{AI_KNOWLEDGE.targetAudience}</p>
          )}
        </div>

        {/* USP */}
        <div className="rounded-lg bg-muted/50 border border-app p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-2">Why do customers buy from us?</div>
          {editing ? (
            <textarea
              className="w-full text-sm text-fg bg-transparent resize-none outline-none leading-relaxed"
              defaultValue={AI_KNOWLEDGE.usp}
              rows={2}
            />
          ) : (
            <p className="text-sm text-fg leading-relaxed">{AI_KNOWLEDGE.usp}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Must Mention */}
        <div className="rounded-lg border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/30 p-4">
          <div className="text-[10px] uppercase tracking-widest text-teal-700 dark:text-teal-400 font-semibold mb-2.5">What must content always mention?</div>
          <ul className="space-y-1.5">
            {AI_KNOWLEDGE.mustMention.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-fg">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 text-teal-500">
                  <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Must Avoid */}
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 p-4">
          <div className="text-[10px] uppercase tracking-widest text-rose-700 dark:text-rose-400 font-semibold mb-2.5">What must content never mention?</div>
          <div className="flex flex-wrap gap-2">
            {AI_KNOWLEDGE.mustAvoid.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-950 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                "{item}"
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Voice Slider */}
      <div className="rounded-lg bg-muted/50 border border-app p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-3">Brand Voice</div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-fg w-24 shrink-0">Professional</span>
          <div className="relative flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-teal-500/60 to-teal-500/20"
              style={{ width: `${VOICE_POSITION}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-500 shadow-md border-2 border-white dark:border-zinc-900"
              style={{ left: `${VOICE_POSITION}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-fg w-12 shrink-0 text-right">Casual</span>
        </div>
        <p className="text-xs text-muted-fg mt-2 italic">{AI_KNOWLEDGE.brandVoice}</p>
      </div>

      {/* Personas */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-3">Target Personas</div>
        <div className="flex flex-wrap gap-3">
          {AI_KNOWLEDGE.personas.map((p) => (
            <div
              key={p.name}
              className="flex-1 min-w-[160px] rounded-xl border border-app bg-card p-3.5 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{PERSONA_EMOJIS[p.name] || "👤"}</span>
                <span className="text-sm font-semibold text-fg">{p.name}</span>
              </div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium mb-1">Age {p.age}</div>
              <div className="text-xs text-muted-fg leading-relaxed">{p.need}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Colors + Fonts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-3">Brand Colors</div>
          <div className="flex gap-2.5 flex-wrap">
            {BRAND_COLORS.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-10 h-10 rounded-lg shadow-sm border border-black/10 dark:border-white/10 flex items-end justify-center pb-0.5"
                  style={{ backgroundColor: c.hex }}
                >
                </div>
                <span className="text-[9px] text-muted-fg font-mono">{c.hex}</span>
                <span className="text-[9px] text-muted-fg">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-3">Brand Fonts</div>
          <div className="space-y-2">
            {BRAND_FONTS.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-lg border border-app bg-muted/40 px-3 py-2">
                <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-fg">Aa</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-fg">{f.font}</div>
                  <div className="text-[10px] text-muted-fg">{f.name} · {f.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: SEO Health ────────────────────────────────────────────────────

const COMPETITOR_AVG_DA = 59;
const CONTENT_SCORES = {
  overall: COMPANY.healthScore,
  da: COMPANY.da,
  content: 54,
  technical: 89,
};

function SparklineChart() {
  const W = 280;
  const H = 60;
  const PAD = 8;
  const scores = SEO_HEALTH_TIMELINE.map((d) => d.score);
  const months = SEO_HEALTH_TIMELINE.map((d) => d.month);
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const n = scores.length;

  function px(i: number) {
    return PAD + (i / (n - 1)) * (W - PAD * 2);
  }
  function py(v: number) {
    return H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  }

  const points = scores.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const areaPoints = [
    `${px(0)},${H}`,
    ...scores.map((v, i) => `${px(i)},${py(v)}`),
    `${px(n - 1)},${H}`,
  ].join(" ");

  return (
    <div>
      <svg width={W} height={H} className="overflow-visible">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#spark-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {scores.map((v, i) => (
          <g key={i}>
            <circle cx={px(i)} cy={py(v)} r="3" fill="#14b8a6" />
            <text
              x={px(i)}
              y={py(v) - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#14b8a6"
              fontWeight="600"
            >
              {v}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex gap-0" style={{ width: W }}>
        {months.map((m, i) => (
          <div
            key={m}
            className="text-[10px] text-muted-fg text-center"
            style={{ width: W / n }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoHealthSection({ onNavigateMarketplace }: { onNavigateMarketplace?: () => void }) {
  const daGapPct = Math.round((COMPANY.da / COMPETITOR_AVG_DA) * 100);
  const criticalCount = SEO_ISSUES.filter((i) => i.severity === "critical").length;
  const highCount = SEO_ISSUES.filter((i) => i.severity === "high").length;

  const lifecycleSteps = [
    { label: "Published", value: CONTENT_ROI.total, color: "#6366f1" },
    { label: "Indexed", value: CONTENT_ROI.indexed, color: "#14b8a6" },
    { label: "Ranking", value: CONTENT_ROI.ranking, color: "#0ea5e9" },
    { label: "Traffic", value: CONTENT_ROI.trafficDrivers, color: "#f59e0b" },
    { label: "Leads", value: CONTENT_ROI.leadDrivers, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Score Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Overall Score", score: CONTENT_SCORES.overall, hint: "Health index" },
          { label: "DA Score", score: CONTENT_SCORES.da, hint: "Domain authority" },
          { label: "Content Score", score: CONTENT_SCORES.content, hint: "Quality & depth" },
          { label: "Technical Score", score: CONTENT_SCORES.technical, hint: "Site health" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-app bg-muted/40 p-4 flex flex-col items-center gap-2">
            <ScoreGauge score={item.score} size={72} />
            <div className="text-center">
              <div className="text-xs font-semibold text-fg">{item.label}</div>
              <div className="text-[10px] text-muted-fg">{item.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline Timeline */}
      <div className="rounded-xl border border-app bg-muted/40 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-fg">SEO Health Timeline</div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
              Score improving · +{SEO_HEALTH_TIMELINE[SEO_HEALTH_TIMELINE.length - 1]!.score - SEO_HEALTH_TIMELINE[0]!.score} points over {SEO_HEALTH_TIMELINE.length} months
            </div>
          </div>
          <Badge tone="good">Trending up</Badge>
        </div>
        <SparklineChart />
      </div>

      {/* Authority Gap */}
      <div className="rounded-xl border border-app bg-muted/40 p-4">
        <div className="text-xs font-semibold text-fg mb-3">Authority Gap</div>
        <div className="grid grid-cols-3 gap-4 mb-3 text-center">
          <div>
            <div className="text-[10px] text-muted-fg uppercase tracking-wider mb-1">Your DA</div>
            <div className="text-xl font-bold text-fg tabular-nums">{COMPANY.da}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-fg uppercase tracking-wider mb-1">Gap</div>
            <div className="text-xl font-bold text-rose-500 tabular-nums">−{COMPETITOR_AVG_DA - COMPANY.da}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-fg uppercase tracking-wider mb-1">Comp. Avg</div>
            <div className="text-xl font-bold text-fg tabular-nums">{COMPETITOR_AVG_DA}</div>
          </div>
        </div>
        <div className="relative h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${daGapPct}%` }}
          />
          <div
            className="absolute top-0 h-full border-r-2 border-dashed border-rose-400"
            style={{ left: "100%", marginLeft: "-2px" }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-fg">You're at {daGapPct}% of competitor authority</span>
          <button
            type="button"
            onClick={onNavigateMarketplace}
            className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            Close gap with backlinks →
          </button>
        </div>
      </div>

      {/* Content Lifecycle */}
      <div className="rounded-xl border border-app bg-muted/40 p-4">
        <div className="text-xs font-semibold text-fg mb-3">Content Lifecycle</div>
        <div className="flex items-stretch gap-1 mb-2">
          {lifecycleSteps.map((step, i) => {
            const pct = Math.round((step.value / (lifecycleSteps[0]?.value ?? 1)) * 100);
            return (
              <div key={step.label} className="flex-1 min-w-0">
                <div
                  className="rounded-lg py-2.5 text-center mb-1.5 relative"
                  style={{ backgroundColor: step.color + "22", borderLeft: i > 0 ? "none" : undefined }}
                >
                  <span className="text-sm font-bold tabular-nums" style={{ color: step.color }}>
                    {step.value}
                  </span>
                  {i < lifecycleSteps.length - 1 && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-muted-fg text-xs z-10">›</span>
                  )}
                </div>
                <div className="text-[9px] text-muted-fg text-center leading-tight">{step.label}</div>
                {i > 0 && (
                  <div className="text-[9px] text-center mt-0.5" style={{ color: step.color }}>
                    {pct}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SEO Debt */}
      <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-rose-500">
                <path d="M7 2v5M7 9.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">SEO Debt</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-fg">
              <span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{criticalCount} critical</span> · {highCount} high · {SEO_ISSUES.length} total issues
              </span>
              <span className="text-rose-500">·</span>
              <span>Est. traffic loss: <span className="font-semibold text-fg">8,400/month</span></span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
          >
            View Issues
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section 3: Content Coverage ─────────────────────────────────────────────

function ContentCoverageSection() {
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({});

  function toggleCluster(topic: string) {
    setExpandedClusters((prev) => ({ ...prev, [topic]: !prev[topic] }));
  }

  function getCoverageColor(coverage: number) {
    if (coverage >= 70) return "#14b8a6";
    if (coverage >= 40) return "#f59e0b";
    return "#f43f5e";
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-fg">
          {CONTENT_CLUSTERS.reduce((a, c) => a + c.subtopics.filter((s) => !s.published).length, 0)} missing articles across {CONTENT_CLUSTERS.length} clusters
        </span>
        <button
          type="button"
          className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
        >
          Expand all
        </button>
      </div>

      {CONTENT_CLUSTERS.map((cluster) => {
        const isExpanded = expandedClusters[cluster.topic];
        const missing = cluster.subtopics.filter((s) => !s.published).length;
        const color = getCoverageColor(cluster.coverage);
        const isUrgent = cluster.coverage <= 25;

        return (
          <div
            key={cluster.topic}
            className={cn(
              "rounded-xl border bg-card overflow-hidden transition-colors",
              isUrgent ? "border-rose-300 dark:border-rose-800" : "border-app"
            )}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-2.5">
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => toggleCluster(cluster.topic)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-fg">{cluster.topic}</span>
                    {isUrgent && <Badge tone="bad">URGENT</Badge>}
                    {missing > 0 && !isUrgent && (
                      <span className="text-[10px] text-muted-fg">{missing} missing</span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCluster(cluster.topic)}
                  className="shrink-0 flex items-center gap-1.5 text-xs text-muted-fg hover:text-fg transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
                  >
                    <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${cluster.coverage}%`, backgroundColor: color }}
                  />
                </div>
                <span
                  className="text-xs font-semibold tabular-nums w-8 text-right shrink-0"
                  style={{ color }}
                >
                  {cluster.coverage}%
                </span>
              </div>
            </div>

            {/* Subtopics */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out",
                isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-t border-app px-4 pb-3 pt-2 space-y-1.5">
                {cluster.subtopics.map((sub) => (
                  <div
                    key={sub.title}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs",
                      sub.published
                        ? "bg-teal-50/60 dark:bg-teal-950/20"
                        : "bg-rose-50/40 dark:bg-rose-950/20"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {sub.published ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-teal-500">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-rose-400">
                          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      <span className={cn("truncate", sub.published ? "text-fg" : "text-muted-fg")}>
                        {sub.title}
                      </span>
                    </div>
                    {!sub.published && (
                      <button
                        type="button"
                        className="shrink-0 rounded-md border border-teal-300 dark:border-teal-700 bg-white dark:bg-teal-950/30 px-2 py-0.5 text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                      >
                        Create →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section 4: Authority Gap + Competitor Intelligence ──────────────────────

const CHANGE_ICONS: Record<string, { icon: string; label: string }> = {
  pages_added: { icon: "📄", label: "pages added" },
  pages_removed: { icon: "🗑️", label: "pages removed" },
  homepage_messaging: { icon: "🏠", label: "changed homepage messaging" },
  new_service: { icon: "🚀", label: "launched" },
};

function CompetitorDots({ filled, total = 10 }: { filled: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full",
            i < filled ? "bg-teal-500" : "bg-zinc-200 dark:bg-zinc-700"
          )}
        />
      ))}
    </div>
  );
}

function CompetitorIntelSection() {
  return (
    <div className="space-y-6 pt-2">
      {/* Competitor Distance */}
      <div>
        <div className="text-xs font-semibold text-fg mb-3">Competitor Distance</div>
        <div className="space-y-2.5">
          {COMPETITORS.map((comp) => {
            const filledDots = Math.round((comp.contentGapPct / 100) * 10);
            const isAchievable = comp.distanceMonths <= 3;
            return (
              <div
                key={comp.domain}
                className={cn(
                  "rounded-xl border p-4 flex flex-col gap-2.5",
                  isAchievable
                    ? "border-teal-300 dark:border-teal-700 bg-teal-50/40 dark:bg-teal-950/20"
                    : "border-app bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fg">{comp.name}</span>
                    {isAchievable && (
                      <Badge tone="good">achievable!</Badge>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-muted-fg">DA {comp.da}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-muted-fg mb-1">
                      ~{comp.distanceMonths} month{comp.distanceMonths !== 1 ? "s" : ""} behind
                      <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                      Content gap: <span className="font-semibold text-fg">{comp.contentGapPct}%</span>
                    </div>
                  </div>
                  <CompetitorDots filled={Math.round((1 - comp.contentGapPct / 100) * 10)} />
                </div>
                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${100 - comp.contentGapPct}%`,
                      backgroundColor: isAchievable ? "#14b8a6" : "#6366f1",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor Activity Feed */}
      <div>
        <div className="text-xs font-semibold text-fg mb-3">Competitor Activity</div>
        <div className="rounded-xl border border-app bg-card overflow-hidden">
          {COMPETITOR_CHANGES.map((change, i) => {
            const meta = CHANGE_ICONS[change.type] || { icon: "📌", label: change.type };
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm",
                  i < COMPETITOR_CHANGES.length - 1 && "border-b border-app"
                )}
              >
                <span className="text-base shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-fg">{change.competitor}</span>
                  <span className="text-muted-fg">
                    {" "}
                    {meta.label}
                    {change.count ? ` ${change.count} pages` : ""}
                    {change.detail ? `: ${change.detail}` : ""}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] text-muted-fg whitespace-nowrap">{change.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section 5: Technical Specs ───────────────────────────────────────────────

const TECH_SPECS = [
  { label: "CMS", value: COMPANY.cms },
  { label: "Hosting", value: COMPANY.hosting },
  { label: "CDN", value: COMPANY.cdn },
  { label: "Framework", value: COMPANY.framework },
  { label: "SSL", value: COMPANY.ssl ? "Valid ✓" : "Invalid ✗", tone: COMPANY.ssl ? "good" : "bad" },
  { label: "Domain Age", value: COMPANY.domainAge },
];

function TechnicalSpecsSection() {
  return (
    <div className="pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {TECH_SPECS.map((spec) => (
          <div key={spec.label} className="rounded-xl border border-app bg-muted/40 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-1">{spec.label}</div>
            <div
              className={cn(
                "text-sm font-semibold",
                spec.tone === "good"
                  ? "text-teal-600 dark:text-teal-400"
                  : spec.tone === "bad"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-fg"
              )}
            >
              {spec.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-app bg-muted/40 p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-fg font-semibold mb-3">Site Footprint</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Sitemap URLs", value: COMPANY.sitemapUrls },
            { label: "Indexed Pages", value: COMPANY.indexedPages.toLocaleString() },
            { label: "Referring Domains", value: COMPANY.referringDomains },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-xl font-bold tabular-nums text-fg">{stat.value}</div>
              <div className="text-[10px] text-muted-fg mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section 6: AI Learning Memory ───────────────────────────────────────────

const LEARNING_EMOJIS = ["📊", "🔍", "❓", "📅", "🎯"];

function AiLearningSection() {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-fg">What Blogy Learned This Week</div>
        <div className="text-[11px] text-muted-fg">Based on 47 published blogs · Last updated today</div>
      </div>

      <div className="space-y-2.5">
        {AI_LEARNING.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl border border-app bg-muted/40 px-4 py-3 hover:bg-muted/70 transition-colors"
          >
            <span className="text-base shrink-0 mt-0.5">{LEARNING_EMOJIS[i % LEARNING_EMOJIS.length]}</span>
            <div className="min-w-0">
              <p className="text-sm text-fg leading-relaxed">{item.insight}</p>
              <p className="text-[10px] text-muted-fg mt-1">{item.source}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">AI keeps learning as you publish</div>
          <div className="text-[11px] text-teal-600/80 dark:text-teal-400/80 mt-0.5">
            Every published blog updates your site's content fingerprint and refines future recommendations.
          </div>
        </div>
        <div className="shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-teal-600 dark:text-teal-400">
            <path d="M9 3v3M9 12v3M3 9h3M12 9h3M5.1 5.1l2.1 2.1M10.8 10.8l2.1 2.1M12.9 5.1l-2.1 2.1M7.2 10.8l-2.1 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── CMO Brain tabs ───────────────────────────────────────────────────────────

type CmoBrainTab = "dna" | "seo" | "coverage" | "competitors" | "technical" | "ai-learning";

const TABS: { id: CmoBrainTab; label: string; badge?: React.ReactNode }[] = [
  { id: "dna",          label: "Business DNA" },
  { id: "seo",          label: "SEO Health",      badge: <Badge tone="good">+9 pts</Badge> },
  { id: "coverage",     label: "Content Coverage" },
  { id: "competitors",  label: "Competitors" },
  { id: "technical",    label: "Technical" },
  { id: "ai-learning",  label: "AI Learning",     badge: <Badge tone="accent">5 new</Badge> },
];

export function CmoBrainSection() {
  const [activeTab, setActiveTab] = useState<CmoBrainTab>("dna");

  const totalIssues = SEO_ISSUES.length;
  const missingArticles = CONTENT_CLUSTERS.reduce(
    (acc, c) => acc + c.subtopics.filter((s) => !s.published).length,
    0
  );

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-fg">CMO Brain</h2>
          <p className="text-xs text-muted-fg mt-0.5">{`Everything Blogy knows about ${COMPANY.name} — ${COMPANY.domain}`}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Live · Updated 2 hrs ago
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {[
          { label: "Health Score", value: `${COMPANY.healthScore}/100`, tone: "good" as const },
          { label: "Domain Authority", value: `DA ${COMPANY.da}`, tone: "warn" as const },
          { label: "SEO Issues", value: `${totalIssues} issues`, tone: "bad" as const },
          { label: "Content Gaps", value: `${missingArticles} missing`, tone: "warn" as const },
        ].map((stat) => {
          const tones = {
            good: "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300",
            warn: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
            bad: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
          };
          return (
            <div key={stat.label} className={cn("rounded-xl border px-4 py-3", tones[stat.tone])}>
              <div className="text-[10px] font-medium opacity-70 uppercase tracking-wider mb-0.5">{stat.label}</div>
              <div className="text-base font-bold tabular-nums">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 bg-app -mx-6 px-6 border-b border-app">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-teal-500 text-teal-700 dark:text-teal-300"
                  : "border-transparent text-muted-fg hover:text-fg hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              {tab.label}
              {tab.badge && <span className="hidden sm:flex">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-5">
        {activeTab === "dna"         && <BusinessDnaSection />}
        {activeTab === "seo"         && <SeoHealthSection />}
        {activeTab === "coverage"    && <ContentCoverageSection />}
        {activeTab === "competitors" && <CompetitorIntelSection />}
        {activeTab === "technical"   && <TechnicalSpecsSection />}
        {activeTab === "ai-learning" && <AiLearningSection />}
      </div>
    </div>
  );
}

// Legacy export for any remaining references
export { CmoBrainSection as WiSection };
