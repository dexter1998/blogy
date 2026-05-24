"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader } from "../../_shared/section-header";
import { INTEGRATIONS } from "../../mock-data";
import type { Integration } from "../../types";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type IntTab = "all" | "publishing" | "analytics" | "social" | "email" | "ai" | "requested";

const INT_TABS: { id: IntTab; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "publishing", label: "Publishing" },
  { id: "analytics",  label: "Analytics" },
  { id: "social",     label: "Social Media" },
  { id: "email",      label: "Email" },
  { id: "ai",         label: "AI Models" },
  { id: "requested",  label: "Requested" },
];

function categoryToTab(cat: Integration["category"]): IntTab {
  if (cat === "publishing")  return "publishing";
  if (cat === "analytics")   return "analytics";
  if (cat === "content_ai")  return "ai";
  if (cat === "communication") return "social";
  return "all";
}

// ─── Icon colors ──────────────────────────────────────────────────────────────

const ICON_COLORS: Record<string, string> = {
  wp:      "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  shopify: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
  wix:     "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  webflow: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  ga4:     "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  gsc:     "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  clarity: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  openai:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  gemini:  "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  claude:  "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  slack:   "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  discord: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  teams:   "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
};

// ─── Compact integration card with hover reveal ───────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const { id, name, description, status, lastSync, healthScore, icon } = integration;
  const iconClass = ICON_COLORS[id] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  const isComingSoon = status === "coming-soon";

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-app bg-card overflow-hidden transition-all",
        isComingSoon ? "opacity-60" : "hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm",
      )}
    >
      {/* Default visible content */}
      <div className="flex items-start gap-3 p-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0", iconClass)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-xs font-semibold text-fg leading-tight">{name}</p>
            {status === "connected" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
            {isComingSoon && <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 rounded-full px-1.5 py-0.5">Soon</span>}
          </div>
          <p className="text-[10px] text-muted-fg leading-snug line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Action button (always visible, small) */}
      <div className="px-3 pb-3 -mt-1">
        {status === "connected" && (
          <button className="text-[10px] font-medium text-muted-fg border border-app rounded-md px-2 py-0.5 hover:bg-muted transition">Manage</button>
        )}
        {status === "disconnected" && (
          <button className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-700 rounded-md px-2 py-0.5 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition">Connect →</button>
        )}
      </div>

      {/* Hover reveal */}
      {!isComingSoon && (
        <div className="absolute inset-0 bg-card border border-teal-200 dark:border-teal-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none group-hover:pointer-events-auto">
          <div className="flex items-start gap-2">
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0", iconClass)}>{icon}</div>
            <div>
              <p className="text-xs font-semibold text-fg">{name}</p>
              {status === "connected" && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Connected ✓</p>}
            </div>
          </div>
          <div className="space-y-1 mt-2">
            {lastSync && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-fg">Last sync</span>
                <span className="text-fg font-medium">{lastSync}</span>
              </div>
            )}
            {healthScore !== undefined && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-fg">Health</span>
                <span className={cn("font-semibold", healthScore >= 95 ? "text-emerald-600 dark:text-emerald-400" : healthScore >= 80 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
                  {healthScore}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-fg">Status</span>
              <span className={cn("font-medium capitalize", status === "connected" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-fg")}>{status}</span>
            </div>
          </div>
          <div className="mt-2">
            {status === "connected" && (
              <button className="w-full text-[10px] font-medium text-fg border border-app rounded-md py-1 hover:bg-muted transition">Manage</button>
            )}
            {status === "disconnected" && (
              <button className="w-full text-[10px] font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-md py-1 transition">Connect</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Requested tab empty state ────────────────────────────────────────────────

function RequestedTab() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">🔌</div>
      <div>
        <p className="text-sm font-semibold text-fg mb-1">Request an integration</p>
        <p className="text-xs text-muted-fg">Tell us what platform you&apos;d like Blogy to connect with. Top-requested integrations ship first.</p>
      </div>
      {submitted ? (
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/20 px-5 py-3 text-sm font-medium text-teal-700 dark:text-teal-300">
          ✓ Request submitted — thank you!
        </div>
      ) : (
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. HubSpot, Mailchimp, Notion..."
            className="flex-1 rounded-lg border border-app bg-card px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <button
            onClick={() => value.trim() && setSubmitted(true)}
            className="rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 py-2 transition"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

function StatsStrip() {
  const connected    = INTEGRATIONS.filter((i) => i.status === "connected").length;
  const available    = INTEGRATIONS.filter((i) => i.status === "disconnected").length;
  const comingSoon   = INTEGRATIONS.filter((i) => i.status === "coming-soon").length;

  return (
    <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-muted/40 border border-app text-center">
      <div><div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{connected}</div><div className="text-[10px] text-muted-fg">Connected</div></div>
      <div className="w-px h-6 bg-app" />
      <div><div className="text-base font-bold text-fg tabular-nums">{available}</div><div className="text-[10px] text-muted-fg">Available</div></div>
      <div className="w-px h-6 bg-app" />
      <div><div className="text-base font-bold text-muted-fg tabular-nums">{comingSoon}</div><div className="text-[10px] text-muted-fg">Coming Soon</div></div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function IntegrationsSection() {
  const [activeTab, setActiveTab] = useState<IntTab>("all");

  const filtered = activeTab === "all"       ? INTEGRATIONS
                 : activeTab === "requested" ? []
                 : INTEGRATIONS.filter((i) => categoryToTab(i.category) === activeTab);

  return (
    <div className="space-y-0">
      {/* Header */}
      <SectionHeader title="Integrations" subtitle="Connect your tools to unlock live data, auto-publishing, and AI content." />

      <div className="mt-4 mb-5">
        <StatsStrip />
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 bg-app -mx-6 px-6 border-b border-app">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {INT_TABS.map((tab) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pt-5">
        {activeTab === "requested" ? (
          <RequestedTab />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-fg">No integrations in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
