"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { COMPANY } from "../mock-data";

type ReviewTab = "analysis" | "brand" | "business";

interface StepReviewProps {
  data: { name: string; website: string; goalMode: string };
  onComplete: () => void;
}

const SITE_CARDS = [
  { label: "Domain Age",        value: COMPANY.domainAge,                              icon: "📅" },
  { label: "Sitemap URLs",      value: `${COMPANY.sitemapUrls} pages`,                 icon: "🗺" },
  { label: "Domain Authority",  value: `DA ${COMPANY.da}`,                             icon: "⭐" },
  { label: "Monthly Traffic",   value: `${COMPANY.trafficEstimate.toLocaleString()}/mo`, icon: "📊" },
  { label: "CMS",               value: COMPANY.cms,                                    icon: "🔧" },
  { label: "SSL Certificate",   value: "Valid ✓",                                      icon: "🔒" },
  { label: "Health Score",      value: `${COMPANY.healthScore}/100`,                   icon: "💪" },
  { label: "Indexed Pages",     value: COMPANY.indexedPages.toLocaleString(),          icon: "🔍" },
];

const BRAND_COLORS = ["#14b8a6", "#0f766e", "#134e4a", "#fbbf24", "#f0fdf4"];

const BUSINESS_ROWS = [
  { label: "Niche",                  value: "SaaS / AI Tools" },
  { label: "Primary audience",       value: "Founders, marketers, content teams" },
  { label: "Primary goal",           value: "Grow organic traffic & leads" },
  { label: "Content opportunities",  value: "47 identified" },
  { label: "Competitors tracked",    value: "4 domains" },
  { label: "Top keyword gap",        value: "ai content writing tool" },
];

export function StepReview({ data, onComplete }: StepReviewProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>("analysis");

  const rawDomain = (data.website || "blogy.in").replace(/^https?:\/\/|^www\./g, "");
  const displayName = rawDomain.split(".")[0]!;
  const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const TABS: { id: ReviewTab; label: string }[] = [
    { id: "analysis", label: "Site Analysis" },
    { id: "brand",    label: "Brand Overview" },
    { id: "business", label: "Business Details" },
  ];

  return (
    <div className="w-full max-w-5xl flex gap-5 items-stretch">
      {/* ── Main card ────────────────────────────────────────────────────────── */}
      <div className="flex-1 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm overflow-hidden flex flex-col shadow-xl dark:shadow-2xl">

        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 mb-3">
            <span>🧬</span> Business DNA Generated
          </div>
          <h2 className="text-3xl font-serif italic text-gray-900 dark:text-white leading-snug mb-1">
            Your Business DNA
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
            Unlock the power to generate blogs, marketing campaigns, and more
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id
                    ? "border-gray-800 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8 flex-1">

          {/* Site Analysis tab */}
          {activeTab === "analysis" && (
            <div className="grid grid-cols-4 gap-3">
              {SITE_CARDS.map((card, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-800/50 p-3"
                >
                  <div className="text-lg mb-1">{card.icon}</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-500 mb-0.5">{card.label}</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-zinc-100">{card.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Brand Overview tab */}
          {activeTab === "brand" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-100 dark:border-zinc-700/50 bg-gray-50 dark:bg-zinc-800/40 p-5">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{capitalized}.com</h3>
                <p className="text-gray-400 dark:text-zinc-400 text-sm mt-0.5">{data.website || "www.blogy.in"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 dark:border-zinc-700/50 bg-gray-50 dark:bg-zinc-800/40 p-5">
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Logo</p>
                  <div className="w-24 h-14 rounded-lg bg-teal-500 flex items-center justify-center shadow-md shadow-teal-200 dark:shadow-teal-900/40">
                    <span className="text-white font-bold text-2xl">{capitalized[0]}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-zinc-700/50 bg-gray-50 dark:bg-zinc-800/40 p-5">
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Fonts</p>
                  <div className="text-3xl text-gray-800 dark:text-zinc-100 leading-none mb-1" style={{ fontFamily: "Georgia, serif" }}>Aa</div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Open Sans / Inter</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-zinc-700/50 bg-gray-50 dark:bg-zinc-800/40 p-5">
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Colors</p>
                <div className="flex items-center gap-5">
                  {BRAND_COLORS.map((color, i) => (
                    <div key={i} className="text-center">
                      <div
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-600 mb-1.5 shadow-sm"
                        style={{ background: color }}
                      />
                      <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-mono">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Business Details tab */}
          {activeTab === "business" && (
            <div>
              {BUSINESS_ROWS.map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4 py-3.5 border-b border-gray-100 dark:border-zinc-800/80 last:border-0">
                  <div className="text-xs text-gray-400 dark:text-zinc-500 w-44 shrink-0 pt-0.5">{label}</div>
                  <div className="text-sm text-gray-800 dark:text-zinc-200 font-medium">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: progress */}
        <div className="px-8 pb-7 flex items-center gap-3 border-t border-gray-100 dark:border-zinc-800 pt-5">
          <div className="h-1 w-28 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-full bg-teal-500 rounded-full" />
          </div>
          <p className="text-xs text-gray-400 dark:text-zinc-500">100% complete</p>
        </div>
      </div>

      {/* ── AI Growth Copilot panel ───────────────────────────────────────────── */}
      <div className="w-72 shrink-0 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm flex flex-col shadow-xl dark:shadow-2xl">
        {/* Panel header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shadow-sm shadow-teal-200 dark:shadow-teal-900">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2a4.5 4.5 0 00-3 7.85V11l1.5-.75 1.5.75V9.85A4.5 4.5 0 006.5 2z" stroke="white" strokeWidth="1.1" strokeLinejoin="round" />
              <path d="M4.5 6h4M6.5 4.5v3" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Your Growth Copilot</span>
        </div>

        {/* Main message */}
        <div className="flex-1 p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            Your site has launched{" "}
            <span className="font-bold text-gray-900 dark:text-white">120 pages</span> in the
            last 28 days.
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            With Blogy's content engine, you can achieve{" "}
            <span className="font-bold text-teal-600 dark:text-teal-400">40K+ monthly traffic</span>{" "}
            in no time.
          </p>

          {/* Growth stats */}
          <div className="rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Content opportunities</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">47</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Competitor gaps</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">18 uncovered</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-zinc-400">Traffic potential</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{COMPANY.potentialTraffic.toLocaleString()}/mo</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
            Blogy's AI will build and execute your content roadmap — so you can focus on running
            your business.
          </p>
        </div>

        {/* Proceed CTA */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Dashboard
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
