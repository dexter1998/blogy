"use client";

import { cn } from "@/lib/cn";
import { Badge, Card } from "@/components/ui";
import { ScoreGauge } from "../../_shared/score-gauge";
import { SectionHeader } from "../../_shared/section-header";
import {
  COMPANY,
  GROWTH_SCORE_ACTIONS,
  CHANGED_SINCE_LOGIN,
  AUTOPILOT_STATUS,
  AI_FEED,
  RISK_ALERTS,
  TODOS,
} from "../../mock-data";
import type { SectionId, AiFeedItem, RiskAlert } from "../../types";

interface HomeSectionProps {
  onNavigate: (s: SectionId) => void;
  onNewBlog: () => void;
}

const FEED_CONFIG: Record<
  AiFeedItem["type"],
  { icon: string; colorClass: string }
> = {
  keyword: { icon: "🔍", colorClass: "text-teal-600 dark:text-teal-400" },
  rank_drop: { icon: "📉", colorClass: "text-rose-600 dark:text-rose-400" },
  rank_rise: { icon: "📈", colorClass: "text-emerald-600 dark:text-emerald-400" },
  backlink: { icon: "🔗", colorClass: "text-blue-600 dark:text-blue-400" },
  trend: { icon: "🔥", colorClass: "text-amber-600 dark:text-amber-400" },
  competitor: { icon: "👁", colorClass: "text-purple-600 dark:text-purple-400" },
  index: { icon: "📄", colorClass: "text-zinc-600 dark:text-zinc-400" },
};

function NorthStarCard({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const totalAvailable = GROWTH_SCORE_ACTIONS.reduce((s, a) => s + a.points, 0);
  const progressToTarget =
    Math.round(
      ((COMPANY.growthScore - 0) / (COMPANY.growthTarget - 0)) * 100
    );

  return (
    <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/10">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-0.5">
            North Star
          </p>
          <h2 className="text-base font-semibold text-fg">
            Organic Growth Score
          </h2>
        </div>
        <Badge tone="neutral">Target: {COMPANY.growthTarget}/100</Badge>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <ScoreGauge score={COMPANY.growthScore} size={80} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
              {COMPANY.growthScore}
            </span>
            <span className="text-lg text-muted-fg font-medium">/100</span>
          </div>
          <p className="text-sm text-muted-fg">
            +{totalAvailable} points available this week
          </p>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        {GROWTH_SCORE_ACTIONS.map((action, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-lg border border-teal-100 dark:border-teal-900/60 bg-white/60 dark:bg-teal-950/20 px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-teal-500 text-sm flex-shrink-0">✦</span>
              <span className="text-sm text-fg truncate">{action.action}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                +{action.points} pts
              </span>
              <button
                onClick={() => onNavigate("integrations")}
                className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 whitespace-nowrap transition-colors"
              >
                {action.cta} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-fg">Progress to target</span>
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 tabular-nums">
            {progressToTarget}% there
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-700"
            style={{ width: `${progressToTarget}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-fg">
            {COMPANY.growthScore}
          </span>
          <span className="text-[10px] text-muted-fg">
            {COMPANY.growthTarget}
          </span>
        </div>
      </div>
    </Card>
  );
}

function ChangedSinceLoginCard() {
  const c = CHANGED_SINCE_LOGIN;
  const items = [
    { text: `${c.indexedPages} pages indexed`, positive: true },
    { text: `${c.newKeywords} new keywords ranked`, positive: true },
    {
      text: `${c.competitorChanges} competitor launched a new service`,
      positive: false,
    },
    { text: `${c.opportunities} content opportunities discovered`, positive: true },
    { text: `Traffic up ${c.trafficChange}`, positive: true },
  ];

  return (
    <Card className="border-l-4 border-l-teal-500 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-fg">
            Since Your Last Visit
          </h3>
          <p className="text-xs text-muted-fg mt-0.5">{c.daysAgo} days ago</p>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                item.positive
                  ? "bg-teal-500"
                  : "bg-amber-500"
              )}
            />
            <span className="text-sm text-fg leading-snug">{item.text}</span>
          </li>
        ))}
      </ul>
      <button className="mt-4 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
        View Details →
      </button>
    </Card>
  );
}

function AutopilotCard({
  onNavigate,
}: {
  onNavigate: (s: SectionId) => void;
}) {
  const ap = AUTOPILOT_STATUS;

  const activeItems = [
    { label: "Sitemap Monitoring", active: ap.sitemapMonitoring },
    { label: "Competitor Tracking", active: ap.competitorTracking },
    { label: "Trend Discovery", active: ap.trendDiscovery },
    { label: "Publish Detection", active: ap.publishDetection },
  ];

  const warningItems = [
    {
      label: "GSC Not Connected",
      active: ap.gscConnected,
      cta: "Connect",
      section: "integrations" as SectionId,
    },
    {
      label: "Auto Publishing",
      active: ap.autoPublishing,
      cta: "Enable",
      section: "settings" as SectionId,
    },
  ];

  return (
    <Card className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-fg">Blogy Autopilot</h3>
      </div>
      <div className="space-y-2.5">
        {activeItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 text-sm font-bold">✓</span>
              <span className="text-sm text-fg">{item.label}</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              active
            </span>
          </div>
        ))}

        <div className="border-t border-app my-1" />

        {warningItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-sm">⚠</span>
              <span className="text-sm text-amber-700 dark:text-amber-400">
                {item.label}
              </span>
            </div>
            <button
              onClick={() => onNavigate(item.section)}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-2.5 py-0.5 rounded-full transition-colors"
            >
              {item.cta}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PriorityTaskCard({ onNewBlog }: { onNewBlog: () => void }) {
  const task = TODOS[0];
  if (!task) return null;

  const trafficK =
    task.trafficPotential && task.trafficPotential >= 1000
      ? `${(task.trafficPotential / 1000).toFixed(1)}k`
      : task.trafficPotential;

  return (
    <Card className="border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/10">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">
            #1
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">
              Do This First
            </p>
            <h3 className="text-base font-semibold text-fg leading-tight">
              {task.title}
            </h3>
          </div>
        </div>
        {task.confidence && (
          <Badge tone="good">Confidence: {task.confidence}%</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {task.trafficPotential !== undefined && (
          <div className="rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-app px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-1">
              Traffic Potential
            </p>
            <p className="text-sm font-semibold text-fg tabular-nums">
              {trafficK}/month
            </p>
          </div>
        )}
        <div className="rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-app px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-1">
            Lead Potential
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
            High
          </p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-app px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-1">
            Effort
          </p>
          <p className="text-sm font-semibold text-fg capitalize">
            {task.effort} (2–3 hrs)
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 px-4 py-3 mb-5 text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
        <span className="font-semibold">Why: </span>
        {task.reason}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewBlog}
          className="flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          Create Now →
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-app bg-card hover:bg-muted text-sm font-medium text-fg px-4 py-2 transition-colors">
          Schedule
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-app bg-card hover:bg-muted text-sm font-medium text-muted-fg px-4 py-2 transition-colors">
          Dismiss
        </button>
      </div>
    </Card>
  );
}

function FeedItem({ item }: { item: AiFeedItem }) {
  const cfg = FEED_CONFIG[item.type];
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-default group">
      <span className={cn("text-base flex-shrink-0 mt-0.5", cfg.colorClass)}>
        {cfg.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-fg leading-snug">{item.text}</p>
      </div>
      <span className="text-[11px] text-muted-fg flex-shrink-0 mt-0.5 tabular-nums">
        {item.time}
      </span>
    </div>
  );
}

function RiskAlertBar({ alert }: { alert: RiskAlert }) {
  const isBad = alert.severity === "bad";
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3",
        isBad
          ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300"
          : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
      )}
    >
      <span className="text-base flex-shrink-0 mt-0.5">
        {isBad ? "🚨" : "⚠️"}
      </span>
      <p className="text-sm leading-snug">{alert.text}</p>
    </div>
  );
}

export function HomeSection({ onNavigate, onNewBlog }: HomeSectionProps) {
  const potentialGain =
    COMPANY.potentialTraffic - COMPANY.trafficEstimate;
  const revenueImpact = potentialGain * 2;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Home"
        subtitle="What should you do right now?"
      />

      {/* Above fold: 4 core elements */}
      <NorthStarCard onNavigate={onNavigate} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChangedSinceLoginCard />
        <AutopilotCard onNavigate={onNavigate} />
      </div>

      <PriorityTaskCard onNewBlog={onNewBlog} />

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-app" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-app px-3 text-[11px] font-medium uppercase tracking-widest text-muted-fg">
            More Signals
          </span>
        </div>
      </div>

      {/* Below fold: AI Feed */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-app">
          <div>
            <h3 className="text-sm font-semibold text-fg">AI Feed</h3>
            <p className="text-xs text-muted-fg mt-0.5">
              Live signals from your website and competitors
            </p>
          </div>
          <button
            onClick={() => onNavigate("cmo-brain")}
            className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex-shrink-0 mt-0.5"
          >
            View All →
          </button>
        </div>
        <div className="px-2 py-2">
          {AI_FEED.map((item) => (
            <FeedItem key={item.id} item={item} />
          ))}
        </div>
      </Card>

      {/* Revenue Impact */}
      <Card>
        <h3 className="text-sm font-semibold text-fg mb-4">
          Revenue Impact Estimate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-teal-100 dark:border-teal-900/50 bg-teal-50/40 dark:bg-teal-950/20 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
              Potential Monthly Traffic Gain
            </p>
            <p className="text-3xl font-bold tabular-nums text-teal-700 dark:text-teal-300">
              +{potentialGain.toLocaleString()}
            </p>
            <p className="text-xs text-muted-fg mt-1">
              from current {COMPANY.trafficEstimate.toLocaleString()} visitors
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Potential Revenue Impact
            </p>
            <p className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              ₹{revenueImpact.toLocaleString()}/mo
            </p>
            <p className="text-xs text-muted-fg mt-1">
              estimated at ₹2/visitor
            </p>
          </div>
        </div>
      </Card>

      {/* Risk Alerts */}
      {RISK_ALERTS.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-fg mb-3">Risk Alerts</h3>
          <div className="space-y-2.5">
            {RISK_ALERTS.map((alert, i) => (
              <RiskAlertBar key={i} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
