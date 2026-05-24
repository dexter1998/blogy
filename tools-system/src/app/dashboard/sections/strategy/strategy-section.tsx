import { cn } from "@/lib/cn";
import { Badge, Card } from "@/components/ui";
import { SectionHeader } from "../../_shared/section-header";
import { HorizontalBar } from "../../_shared/mini-bar-chart";
import { STRATEGY, COMPANY, CONTENT_CLUSTERS, PUBLISHING_VELOCITY } from "../../mock-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function goalEmoji(goal: string) {
  const map: Record<string, string> = {
    "Lead Generation": "🎯",
    traffic: "📈",
    sales: "💰",
    authority: "🏆",
  };
  return map[goal] ?? "🎯";
}

function clusterColor(tier: "primary" | "secondary" | "tertiary") {
  if (tier === "primary") return "#14b8a6"; // teal
  if (tier === "secondary") return "#f59e0b"; // amber
  return "#8b5cf6"; // violet
}

// ─── Strategy Overview ────────────────────────────────────────────────────────

function StrategyOverviewCard() {
  const trafficPct = Math.round(
    (STRATEGY.currentTraffic / STRATEGY.targetTraffic) * 100
  );

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-fg mb-1">
            Current Strategy
          </p>
          <h2 className="text-base font-semibold text-fg">
            {goalEmoji(STRATEGY.goal)} {STRATEGY.goal} Mode
          </h2>
        </div>
        <button className="flex-shrink-0 text-xs font-semibold text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 px-3.5 py-1.5 rounded-lg transition-colors">
          Edit Strategy
        </button>
      </div>

      <div className="rounded-xl border border-teal-100 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/10 px-4 py-3.5 mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
          North Star Goal
        </p>
        <p className="text-sm font-semibold text-fg">{STRATEGY.northStar}</p>
      </div>

      <div className="mb-2 flex items-end justify-between gap-3">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-0.5">
              Current Traffic
            </p>
            <p className="text-xl font-bold tabular-nums text-fg">
              {STRATEGY.currentTraffic.toLocaleString()}
            </p>
          </div>
          <span className="text-2xl text-muted-fg pb-0.5">→</span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-0.5">
              Target Traffic
            </p>
            <p className="text-xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
              {STRATEGY.targetTraffic.toLocaleString()}
            </p>
          </div>
        </div>
        <Badge tone="accent">{trafficPct}% of the way there</Badge>
      </div>

      <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-700"
          style={{ width: `${trafficPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-fg">
          {STRATEGY.currentTraffic.toLocaleString()} visitors
        </span>
        <span className="text-[10px] text-muted-fg">
          {STRATEGY.targetTraffic.toLocaleString()} target
        </span>
      </div>
    </Card>
  );
}

// ─── Content Clusters ─────────────────────────────────────────────────────────

function ClusterTierRow({
  tier,
  topic,
  coverage,
  label,
  isPriority,
}: {
  tier: "primary" | "secondary" | "tertiary";
  topic: string;
  coverage: number;
  label: string;
  isPriority?: boolean;
}) {
  const cluster = CONTENT_CLUSTERS.find((c) => c.topic === topic);
  const subtopicCount = cluster?.subtopics.length ?? 0;
  const publishedCount = cluster?.subtopics.filter((s) => s.published).length ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            tier === "primary"
              ? "text-teal-600 dark:text-teal-400"
              : tier === "secondary"
              ? "text-amber-600 dark:text-amber-400"
              : "text-violet-600 dark:text-violet-400"
          )}
        >
          {label}
        </span>
        {isPriority && (
          <Badge tone="bad">Priority!</Badge>
        )}
      </div>
      <HorizontalBar
        label={topic}
        value={coverage}
        max={100}
        color={clusterColor(tier)}
        unit="%"
      />
      <p className="text-xs text-muted-fg pl-[9.5rem]">
        {publishedCount}/{subtopicCount} subtopics published
      </p>
    </div>
  );
}

function ContentClustersCard() {
  return (
    <Card className="h-full">
      <h3 className="text-sm font-semibold text-fg mb-5">Content Clusters</h3>
      <div className="space-y-6">
        <ClusterTierRow
          tier="primary"
          label="Primary Cluster"
          topic={STRATEGY.primaryCluster}
          coverage={
            CONTENT_CLUSTERS.find((c) => c.topic === STRATEGY.primaryCluster)
              ?.coverage ?? 72
          }
        />
        <ClusterTierRow
          tier="secondary"
          label="Secondary Cluster"
          topic={STRATEGY.secondaryCluster}
          coverage={
            CONTENT_CLUSTERS.find((c) => c.topic === STRATEGY.secondaryCluster)
              ?.coverage ?? 30
          }
          isPriority
        />
        <ClusterTierRow
          tier="tertiary"
          label="Tertiary Cluster"
          topic={STRATEGY.tertiaryCluster}
          coverage={
            CONTENT_CLUSTERS.find((c) => c.topic === STRATEGY.tertiaryCluster)
              ?.coverage ?? 85
          }
        />
      </div>
    </Card>
  );
}

// ─── Publishing Frequency ─────────────────────────────────────────────────────

function PublishingFrequencyCard() {
  const { keywordMix, contentMix } = STRATEGY;
  const vel = PUBLISHING_VELOCITY;
  const currentPct = Math.round((vel.current / vel.recommended) * 100);

  return (
    <Card className="h-full">
      <h3 className="text-sm font-semibold text-fg mb-5">
        Publishing Frequency
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-fg w-16 flex-shrink-0">Current</span>
          <div className="flex-1 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${currentPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-fg tabular-nums w-20 text-right flex-shrink-0">
            {vel.current} blogs/wk
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-fg w-16 flex-shrink-0">Target</span>
          <div className="flex-1 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-zinc-300 dark:bg-zinc-600 w-full" />
          </div>
          <span className="text-xs font-semibold text-muted-fg tabular-nums w-20 text-right flex-shrink-0">
            {vel.recommended} blogs/wk
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
          Keyword Mix
        </h4>
        <HorizontalBar
          label="Commercial Intent"
          value={keywordMix.commercial}
          color="#14b8a6"
        />
        <HorizontalBar
          label="Informational"
          value={keywordMix.informational}
          color="#8b5cf6"
        />
        <HorizontalBar
          label="Transactional"
          value={keywordMix.transactional}
          color="#f59e0b"
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-3">
          Content Mix
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            {
              label: "Comparison",
              count: contentMix.comparison,
              color: "bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
            },
            {
              label: "Pillar",
              count: contentMix.pillar,
              color: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
            },
            {
              label: "Cluster",
              count: contentMix.cluster,
              color: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                item.color
              )}
            >
              <span className="tabular-nums">{item.count}</span>
              <span className="opacity-70">·</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────

function RoadmapTimeline() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-fg mb-6">12-Month Roadmap</h3>

      {/* Desktop: horizontal, Mobile: vertical */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-0 relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-zinc-200 dark:bg-zinc-700 z-0" />

        {STRATEGY.roadmap.map((step, i) => {
          const isNow = i === 0;
          return (
            <div key={i} className="relative flex flex-col items-center text-center px-2">
              {/* Node */}
              <div
                className={cn(
                  "z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold mb-3 transition-all",
                  isNow
                    ? "border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/40"
                    : "border-zinc-300 dark:border-zinc-600 bg-card text-muted-fg"
                )}
              >
                {i + 1}
              </div>

              {/* Month label */}
              <div className="flex items-center gap-1.5 mb-1">
                <p
                  className={cn(
                    "text-xs font-bold",
                    isNow
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-muted-fg"
                  )}
                >
                  {step.month}
                </p>
                {isNow && (
                  <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                    Now
                  </span>
                )}
              </div>

              {/* Milestone */}
              <p
                className={cn(
                  "text-sm font-semibold mb-1.5",
                  isNow ? "text-fg" : "text-fg/80"
                )}
              >
                {step.milestone}
              </p>

              {/* Detail */}
              <p className="text-[11px] text-muted-fg leading-relaxed">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical list */}
      <div className="sm:hidden space-y-0">
        {STRATEGY.roadmap.map((step, i) => {
          const isNow = i === 0;
          const isLast = i === STRATEGY.roadmap.length - 1;
          return (
            <div key={i} className="flex gap-4">
              {/* Left: node + line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                    isNow
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-zinc-300 dark:border-zinc-600 bg-card text-muted-fg"
                  )}
                >
                  {i + 1}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 my-1" />
                )}
              </div>

              {/* Right: content */}
              <div className={cn("pb-5", isLast ? "pb-0" : "")}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className={cn(
                      "text-xs font-bold",
                      isNow
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-muted-fg"
                    )}
                  >
                    {step.month}
                  </p>
                  {isNow && (
                    <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                      Now
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-fg mb-0.5">
                  {step.milestone}
                </p>
                <p className="text-xs text-muted-fg leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export function StrategySection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Strategy"
        subtitle="What are we trying to achieve?"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-fg">
              Domain Authority: <span className="font-semibold text-fg">{COMPANY.da}</span>
            </span>
            <span className="text-muted-fg/40">·</span>
            <span className="text-xs text-muted-fg">
              Goal Mode:{" "}
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {STRATEGY.goal}
              </span>
            </span>
          </div>
        }
      />

      {/* Full-width: Strategy Overview */}
      <StrategyOverviewCard />

      {/* Two columns: Clusters + Publishing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ContentClustersCard />
        <PublishingFrequencyCard />
      </div>

      {/* Full-width: Roadmap */}
      <RoadmapTimeline />
    </div>
  );
}
