"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { SectionHeader } from "../../_shared/section-header";
import { HorizontalBar } from "../../_shared/mini-bar-chart";
import { CREDIT_FORECAST } from "../../mock-data";

// ─── Constants ─────────────────────────────────────────────────────────────────

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

// ─── Credit Exhaustion Warning ─────────────────────────────────────────────────

function ExhaustionWarning() {
  const { exhaustionDays } = CREDIT_FORECAST;
  if (exhaustionDays >= 30) return null;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="text-amber-500 text-lg flex-shrink-0 mt-0.5">⚠</span>
        <p className="text-sm text-amber-900 dark:text-amber-300 leading-snug">
          At current usage, credits exhaust in{" "}
          <strong className="font-semibold">{exhaustionDays} days</strong>. Upgrade or add credits to avoid interruption.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
        <Button
          size="sm"
          className="bg-amber-600 hover:opacity-90 text-white border-0"
        >
          Upgrade Plan
        </Button>
        <Button size="sm" variant="ghost" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40">
          Buy Add-on Credits
        </Button>
      </div>
    </div>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard() {
  const { used, total } = CREDIT_FORECAST;
  const pct = Math.round((used / total) * 100);

  return (
    <div className="rounded-xl border border-app bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">👑</span>
        <div>
          <h3 className="text-sm font-semibold text-fg">Starter Plan</h3>
          <p className="text-xs text-muted-fg mt-0.5">
            {used.toLocaleString()} / {total.toLocaleString()} credits used this month
          </p>
        </div>
        <span className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-fg">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-fg">0</span>
          <span className="text-[10px] text-muted-fg">{total.toLocaleString()}</span>
        </div>
      </div>

      <Button
        className="w-full mt-auto bg-teal-500 hover:opacity-90 text-white border-0"
        size="sm"
      >
        Upgrade to Pro →
      </Button>
    </div>
  );
}

// ─── Credit Breakdown Card ──────────────────────────────────────────────────────

function CreditBreakdownCard() {
  const { used } = CREDIT_FORECAST;

  return (
    <div className="rounded-xl border border-app bg-card p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-fg">Credit Breakdown</h3>
        <p className="text-xs text-muted-fg mt-0.5">By category this month</p>
      </div>
      <div className="space-y-3 flex-1">
        {CREDIT_BREAKDOWN.map((item) => (
          <HorizontalBar
            key={item.label}
            label={item.label}
            value={item.value}
            max={used}
            color="#14b8a6"
            unit=" cr"
          />
        ))}
      </div>
    </div>
  );
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────

function RoiCalculator() {
  const [blogs, setBlogs] = useState(12);

  const traffic = blogs * 360;
  const keywords = Math.round(blogs * 2.3);
  const leads = Math.round(traffic * 0.007);
  const revenue = leads * 1440;
  const time = blogs >= 8 ? "~90 days" : "~120 days";

  const stats = [
    { label: "Expected Traffic Gain", value: `+${traffic.toLocaleString()} visitors` },
    { label: "Expected New Keywords", value: `+${keywords} ranked` },
    { label: "Expected Leads", value: `+${leads}/month` },
    { label: "Time to Results", value: time },
  ];

  return (
    <div className="rounded-xl border border-app bg-card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-fg">Impact Simulator</h3>
        <p className="text-xs text-muted-fg mt-0.5">Estimate your ROI based on publishing volume</p>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-fg font-medium">Blogs per month</label>
          <span className="text-sm font-bold tabular-nums text-teal-600 dark:text-teal-400">
            {blogs}
          </span>
        </div>
        <input
          type="range"
          min={4}
          max={40}
          step={1}
          value={blogs}
          onChange={(e) => setBlogs(Number(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full appearance-none cursor-pointer",
            "bg-zinc-100 dark:bg-zinc-800",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-teal-500",
            "[&::-webkit-slider-thumb]:shadow-sm",
            "[&::-webkit-slider-thumb]:cursor-pointer",
          )}
          style={{
            background: `linear-gradient(to right, #14b8a6 ${((blogs - 4) / 36) * 100}%, rgb(244 244 245) ${((blogs - 4) / 36) * 100}%)`,
          }}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-fg">4</span>
          <span className="text-[10px] text-muted-fg">40</span>
        </div>
      </div>

      {/* Stats grid */}
      <p className="text-xs text-muted-fg mb-3">
        If you publish <strong className="text-fg">{blogs} blogs/month</strong>:
      </p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-app bg-zinc-50/60 dark:bg-zinc-900/40 px-3.5 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-fg mb-1">
              {stat.label}
            </p>
            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue impact highlight */}
      <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 px-4 py-3.5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Estimated Revenue Impact
          </p>
          <p className="text-2xl font-bold tabular-nums text-teal-700 dark:text-teal-300 mt-0.5">
            +₹{revenue.toLocaleString()}/month
          </p>
        </div>
        <span className="text-3xl flex-shrink-0">📈</span>
      </div>
    </div>
  );
}

// ─── Invoice Table ─────────────────────────────────────────────────────────────

function InvoiceTable() {
  return (
    <div className="rounded-xl border border-app bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-fg">Recent Invoices</h3>
          <p className="text-xs text-muted-fg mt-0.5">Your billing history</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app">
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                Date
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                Plan
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                Amount
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {INVOICES.map((inv, i) => (
              <tr key={i} className="hover:bg-muted/40 transition-colors">
                <td className="py-3 text-fg tabular-nums">{inv.date}</td>
                <td className="py-3 text-muted-fg">{inv.plan}</td>
                <td className="py-3 font-medium text-fg tabular-nums">{inv.amount}</td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5">
                    {inv.status} ✓
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-app">
        <button className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
          View all invoices →
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function BillingSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Billing & Credits"
        subtitle="Manage your plan, track usage, and forecast ROI"
        action={
          <Button size="sm" className="bg-teal-500 hover:opacity-90 text-white border-0">
            Upgrade Plan
          </Button>
        }
      />

      {/* 1. Credit exhaustion warning */}
      <ExhaustionWarning />

      {/* 2. Plan + Credits row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PlanCard />
        <CreditBreakdownCard />
      </div>

      {/* 3. ROI Calculator */}
      <RoiCalculator />

      {/* 4. Invoice Table */}
      <InvoiceTable />
    </div>
  );
}
