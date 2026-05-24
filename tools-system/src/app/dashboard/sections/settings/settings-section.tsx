"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { ToggleSwitch } from "../../_shared/toggle-switch";
import { HorizontalBar } from "../../_shared/mini-bar-chart";
import type { DashboardSettings } from "../../types";
import { CREDIT_FORECAST } from "../../mock-data";

type SettingsTab = "general" | "billing" | "automation" | "brand" | "team";

// ─── Inner nav ─────────────────────────────────────────────────────────────────

const SETTINGS_NAV: { id: SettingsTab; label: string }[] = [
  { id: "general",    label: "General" },
  { id: "billing",    label: "Billing & Usage" },
  { id: "automation", label: "Automation" },
  { id: "brand",      label: "Brand Voice" },
  { id: "team",       label: "Team" },
];

// ─── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-fg mb-3">{children}</p>;
}

interface ToggleCardProps {
  title: string;
  description: string;
  on: boolean;
  onChange: (v: boolean) => void;
  premium?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

function ToggleCard({ title, description, on, onChange, premium, disabled, disabledLabel }: ToggleCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-app bg-card px-5 py-4 gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm text-fg">{title}</span>
          {premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold">
              ⭐ Premium
            </span>
          )}
        </div>
        <p className="text-xs text-muted-fg leading-snug">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {disabled && disabledLabel && (
          <span className="text-[11px] text-muted-fg border border-app rounded-lg px-2 py-1 bg-card">{disabledLabel}</span>
        )}
        <ToggleSwitch on={on} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

// ─── Tab: General ──────────────────────────────────────────────────────────────

const GOAL_OPTIONS: { key: DashboardSettings["goalMode"]; label: string; icon: string }[] = [
  { key: "traffic",   label: "Grow Traffic",    icon: "📈" },
  { key: "leads",     label: "Generate Leads",  icon: "🎯" },
  { key: "sales",     label: "Drive Sales",     icon: "💰" },
  { key: "authority", label: "Build Authority", icon: "🏆" },
];

function GeneralTab({ settings, onUpdate }: { settings: DashboardSettings; onUpdate: <K extends keyof DashboardSettings>(k: K, v: DashboardSettings[K]) => void }) {
  return (
    <div className="space-y-6">
      {/* Profile */}
      <div>
        <SectionLabel>Profile</SectionLabel>
        <div className="rounded-xl border border-app bg-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white text-lg font-bold shrink-0">TK</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-fg">Tarun Kumar</div>
              <div className="text-xs text-muted-fg mt-0.5">kumartarun276@gmail.com</div>
              <div className="text-xs text-muted-fg mt-0.5">Founder · Pro plan</div>
            </div>
            <button className="shrink-0 rounded-lg border border-app px-3 py-1.5 text-xs font-medium text-fg hover:bg-muted transition">Edit</button>
          </div>
        </div>
      </div>

      {/* Goal mode */}
      <div>
        <SectionLabel>Primary Goal Mode</SectionLabel>
        <div className="rounded-xl border border-app bg-card px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GOAL_OPTIONS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onUpdate("goalMode", key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold transition-all border",
                  settings.goalMode === key
                    ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                    : "border-app bg-card text-fg hover:border-teal-400 dark:hover:border-teal-600 hover:bg-muted",
                )}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Billing & Usage ──────────────────────────────────────────────────────

const CREDIT_BREAKDOWN = [
  { label: "Content Generation", value: 1240 },
  { label: "SEO Analysis", value: 340 },
  { label: "Trend Monitoring", value: 180 },
  { label: "Competitor Tracking", value: 80 },
];

const INVOICES = [
  { date: "May 1, 2025", plan: "Starter", amount: "₹1,999", status: "Paid" },
  { date: "Apr 1, 2025", plan: "Starter", amount: "₹1,999", status: "Paid" },
  { date: "Mar 1, 2025", plan: "Starter", amount: "₹1,999", status: "Paid" },
];

function BillingTab() {
  const { used, total, exhaustionDays } = CREDIT_FORECAST;
  const pct = Math.round((used / total) * 100);

  return (
    <div className="space-y-6">
      {exhaustionDays < 30 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <span className="text-amber-500 text-lg shrink-0">⚠</span>
          <p className="text-sm text-amber-900 dark:text-amber-300 leading-snug">
            Credits exhaust in <strong>{exhaustionDays} days</strong>. Upgrade to avoid interruption.
          </p>
          <button className="shrink-0 ml-auto rounded-lg bg-amber-600 hover:opacity-90 text-white text-xs font-semibold px-3 py-1.5 transition">Upgrade</button>
        </div>
      )}

      {/* Plan card */}
      <div>
        <SectionLabel>Current Plan</SectionLabel>
        <div className="rounded-xl border border-app bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <div className="text-sm font-semibold text-fg">Starter Plan</div>
              <div className="text-xs text-muted-fg">{used.toLocaleString()} / {total.toLocaleString()} credits used</div>
            </div>
            <span className="ml-auto text-[11px] font-medium text-muted-fg bg-muted rounded-full px-2 py-0.5">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <button className="w-full rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2 transition">Upgrade to Pro →</button>
        </div>
      </div>

      {/* Credit breakdown */}
      <div>
        <SectionLabel>Credit Breakdown</SectionLabel>
        <div className="rounded-xl border border-app bg-card p-5 space-y-3">
          {CREDIT_BREAKDOWN.map((item) => (
            <HorizontalBar key={item.label} label={item.label} value={item.value} max={used} color="#14b8a6" unit=" cr" />
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <SectionLabel>Recent Invoices</SectionLabel>
        <div className="rounded-xl border border-app bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app">
                {["Date", "Plan", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {INVOICES.map((inv, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 text-fg tabular-nums">{inv.date}</td>
                  <td className="px-4 py-3 text-muted-fg">{inv.plan}</td>
                  <td className="px-4 py-3 font-medium text-fg tabular-nums">{inv.amount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                      {inv.status} ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Automation ───────────────────────────────────────────────────────────

function AutomationTab({ settings, onUpdate }: { settings: DashboardSettings; onUpdate: <K extends keyof DashboardSettings>(k: K, v: DashboardSettings[K]) => void }) {
  return (
    <div className="space-y-3">
      <ToggleCard title="Auto Update Blogs" description="Automatically refresh decaying content every 90 days" on={settings.autoUpdateBlogs} onChange={(v) => onUpdate("autoUpdateBlogs", v)} premium />
      {settings.autoUpdateBlogs && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 -mt-1">
          <span className="text-base shrink-0 mt-0.5">⚠</span>
          <p>Auto-update uses <span className="font-semibold">~200 credits per blog</span>. Credits exhaust in <span className="font-semibold">22 days</span> at current pace.</p>
        </div>
      )}
      <ToggleCard title="Auto Publish" description="Push approved blogs directly to WordPress" on={settings.autoPublish} onChange={(v) => onUpdate("autoPublish", v)} premium />
      <ToggleCard title="Auto Internal Linking" description="Automatically suggest internal links during generation" on={settings.autoInternalLinking} onChange={(v) => onUpdate("autoInternalLinking", v)} />
      <ToggleCard title="Backlink Exchange" description="Participate in curated backlink swap with similar-niche sites" on={settings.backlinkExchange} onChange={(v) => onUpdate("backlinkExchange", v)} />
      <ToggleCard title="Weekly CEO Report" description="Send weekly PDF summary to kumartarun276@gmail.com" on={settings.weeklyReport} onChange={(v) => onUpdate("weeklyReport", v)} />
    </div>
  );
}

// ─── Tab: Brand Voice ──────────────────────────────────────────────────────────

const RULES_ALWAYS = ["Always mention claim settlement time", "Always include plan comparison"];
const RULES_NEVER = ['Never use "cheap", "budget", "affordable"'];

function BrandTab() {
  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Content Rules</SectionLabel>
        <div className="rounded-xl border border-app bg-card px-5 py-4 space-y-2">
          {RULES_ALWAYS.map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm text-fg"><span className="text-emerald-500 font-bold shrink-0">✓</span>{r}</div>
          ))}
          {RULES_NEVER.map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm text-fg"><span className="text-rose-500 font-bold shrink-0">✗</span>{r}</div>
          ))}
          <button className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">+ Add rule</button>
        </div>
      </div>
      <div>
        <SectionLabel>Weekly Report Schedule</SectionLabel>
        <div className="rounded-xl border border-app bg-card px-5 py-4 flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-fg">Day</label>
            <select defaultValue="Monday" className="rounded-lg border border-app bg-card text-sm text-fg px-3 py-2 appearance-none cursor-pointer hover:bg-muted focus:outline-none">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wider text-muted-fg">Time</label>
            <select defaultValue="9:00 AM" className="rounded-lg border border-app bg-card text-sm text-fg px-3 py-2 appearance-none cursor-pointer hover:bg-muted focus:outline-none">
              {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Team ─────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { initial: "T", name: "Tarun Kumar", role: "Admin", color: "bg-teal-500" },
  { initial: "R", name: "Rachit",      role: "Writer", color: "bg-purple-500" },
  { initial: "P", name: "Priya",       role: "Editor", color: "bg-amber-500" },
];

function TeamTab() {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Members</SectionLabel>
        <div className="rounded-xl border border-app bg-card divide-y divide-app overflow-hidden">
          {TEAM_MEMBERS.map(({ initial, name, role, color }) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", color)}>{initial}</div>
              <span className="flex-1 text-sm font-medium text-fg">{name}</span>
              <span className="rounded-full bg-muted text-muted-fg text-[11px] font-medium px-2.5 py-0.5">{role}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
              <button className="text-muted-fg hover:text-fg text-sm px-1 rounded transition-colors">···</button>
            </div>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-2 rounded-xl border-2 border-dashed border-app hover:border-teal-400 dark:hover:border-teal-600 text-sm font-semibold text-muted-fg hover:text-teal-600 px-5 py-2.5 transition-all">
        + Invite Member
      </button>
      <div>
        <SectionLabel>Agency Mode</SectionLabel>
        <div className="rounded-xl border border-app bg-card px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-fg">Agency Mode</div>
            <div className="text-xs text-muted-fg mt-0.5">Manage multiple client workspaces</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-fg border border-app rounded-lg px-2 py-1 bg-card">Upgrade required</span>
            <ToggleSwitch on={false} onChange={() => {}} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function SettingsSection({
  settings,
  onUpdate,
}: {
  settings: DashboardSettings;
  onUpdate: <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="flex gap-0 min-h-[calc(100vh-80px)] -m-6">
      {/* Inner left sidebar */}
      <div className="w-[200px] shrink-0 border-r border-app bg-card py-6 px-3 sticky top-0 self-start min-h-[calc(100vh-80px)]">
        <p className="text-xs font-bold text-fg px-3 mb-3">Settings</p>
        <nav className="space-y-0.5">
          {SETTINGS_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === item.id
                  ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium border-l-2 border-teal-500"
                  : "text-muted-fg hover:bg-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-base font-bold text-fg mb-6">
          {SETTINGS_NAV.find((n) => n.id === activeTab)?.label}
        </h2>

        {activeTab === "general"    && <GeneralTab settings={settings} onUpdate={onUpdate} />}
        {activeTab === "billing"    && <BillingTab />}
        {activeTab === "automation" && <AutomationTab settings={settings} onUpdate={onUpdate} />}
        {activeTab === "brand"      && <BrandTab />}
        {activeTab === "team"       && <TeamTab />}
      </div>
    </div>
  );
}
