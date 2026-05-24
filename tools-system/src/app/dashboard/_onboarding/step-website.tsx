"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { COMPANY } from "../mock-data";

type Phase = "input" | "analyzing" | "revealed" | "impressed";

interface StepWebsiteProps {
  data: { website: string };
  onUpdate: (p: { website: string }) => void;
  onNext: () => void;
}

const SITE_CARDS = [
  { label: "Domain Age",       value: COMPANY.domainAge,                             icon: "📅" },
  { label: "Sitemap URLs",     value: `${COMPANY.sitemapUrls} pages`,                icon: "🗺" },
  { label: "Domain Authority", value: `DA ${COMPANY.da}`,                            icon: "⭐" },
  { label: "Monthly Traffic",  value: `${COMPANY.trafficEstimate.toLocaleString()}/mo`, icon: "📊" },
  { label: "CMS",              value: COMPANY.cms,                                   icon: "🔧" },
  { label: "SSL Certificate",  value: "Valid ✓",                                     icon: "🔒" },
  { label: "Health Score",     value: `${COMPANY.healthScore}/100`,                  icon: "💪" },
  { label: "Indexed Pages",    value: COMPANY.indexedPages.toLocaleString(),         icon: "🔍" },
];

const AI_IMPRESSIONS = [
  "You sell insurance products (Health, Car, Travel, Life)",
  "Your audience is primarily SME owners and salaried professionals",
  "Your strongest page is Health Insurance (most internal links)",
  "Top opportunity: Group Health Insurance — 2,900 searches/mo, you rank #94",
];

export function StepWebsite({ data, onUpdate, onNext }: StepWebsiteProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [url, setUrl] = useState(data.website || "");
  const [visibleCards, setVisibleCards] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [visibleAI, setVisibleAI] = useState(0);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    onUpdate({ website: url });
    setPhase("analyzing");
    setTimeout(() => {
      setPhase("revealed");
      setVisibleCards(0);
    }, 2000);
  };

  useEffect(() => {
    if (phase !== "revealed") return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setVisibleCards(i);
      if (i >= SITE_CARDS.length) {
        clearInterval(t);
        setTimeout(() => setPhase("impressed"), 300);
      }
    }, 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "impressed") return;
    const delay = setTimeout(() => {
      setShowAI(true);
      let i = 0;
      const t = setInterval(() => {
        i++;
        setVisibleAI(i);
        if (i >= AI_IMPRESSIONS.length) clearInterval(t);
      }, 280);
      return () => clearInterval(t);
    }, 200);
    return () => clearTimeout(delay);
  }, [phase]);

  // ── Input ─────────────────────────────────────────────────────────────────
  if (phase === "input") {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm p-8 text-center shadow-xl dark:shadow-2xl">
          <h2 className="text-3xl font-serif italic text-gray-900 dark:text-white mb-2 leading-snug">
            Enter your website
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-7 leading-relaxed">
            We'll analyze your business and generate
            <br />
            your Business DNA
          </p>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="www.example.com"
            className="w-full bg-gray-100 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 mb-4 text-center transition-colors"
          />

          <div className="flex gap-2.5">
            <button
              onClick={onNext}
              className="flex-1 rounded-xl py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: "#3d4a28" }}
            >
              No website yet?
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!url.trim()}
              className="flex-1 rounded-xl py-3 text-sm font-medium text-white bg-gray-500 dark:bg-zinc-600 hover:bg-gray-600 dark:hover:bg-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Analyzing — rotating blurred glow border ─────────────────────────────
  if (phase === "analyzing") {
    return (
      <div className="w-full max-w-md">
        {/* Outer clips the overflow of the spinning gradient */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Oversized spinning element — centered so rotation is stable */}
          <div
            style={{
              position: "absolute",
              width: "300%",
              height: "300%",
              top: "-100%",
              left: "-100%",
              background:
                "conic-gradient(from 0deg, transparent 55%, rgba(20,184,166,0.65) 67%, rgba(94,234,212,0.8) 73%, rgba(20,184,166,0.5) 81%, transparent 88%)",
              animation: "spin 2.5s linear infinite",
              filter: "blur(14px)",
            }}
          />
          {/* Inner card — 2px margin reveals the blurred glow as soft border */}
          <div className="relative z-10 m-[2px] rounded-[14px] bg-white dark:bg-zinc-900/98 backdrop-blur-sm px-8 py-10 text-center">
            <div className="w-9 h-9 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-2xl font-serif italic text-gray-900 dark:text-white mb-2">
              Analyzing {url}…
            </h2>
            <p className="text-gray-400 dark:text-zinc-500 text-sm">
              Reading site structure and authority signals
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Revealed / Impressed ──────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl">
      {/* URL chip */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 text-sm">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" />
            <path d="M6.5 1C5 3 4.5 4.5 4.5 6.5S5 10 6.5 12M6.5 1C8 3 8.5 4.5 8.5 6.5S8 10 6.5 12M1 6.5h11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {url}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {SITE_CARDS.map((card, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border border-gray-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/50 p-3 transition-all duration-300",
              i < visibleCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            )}
            style={{ transitionDelay: `${i * 55}ms` }}
          >
            <div className="text-lg mb-1">{card.icon}</div>
            <div className="text-[10px] text-gray-400 dark:text-zinc-500 mb-0.5">{card.label}</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-zinc-100">{card.value}</div>
          </div>
        ))}
      </div>

      {/* AI first impression */}
      {showAI && (
        <div className="rounded-xl border border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-950/25 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-bold">AI</span>
            </div>
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
              What Blogy understood about your business
            </span>
          </div>
          <div className="space-y-2">
            {AI_IMPRESSIONS.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 text-sm transition-all duration-300",
                  i < visibleAI ? "opacity-100" : "opacity-0",
                )}
              >
                <span className="text-teal-500 font-bold shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-zinc-200">{line}</span>
              </div>
            ))}
          </div>
          {visibleAI >= AI_IMPRESSIONS.length && (
            <div className="mt-4 pt-4 border-t border-teal-200 dark:border-teal-800/40 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{COMPANY.contentOpportunities}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">Content Opportunities</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{COMPANY.missingKeywords}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">Missing Keywords</div>
              </div>
              <div>
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400">{COMPANY.competitorGaps}</div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">Competitor Gaps</div>
              </div>
            </div>
          )}
        </div>
      )}

      {visibleAI >= AI_IMPRESSIONS.length && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Current:{" "}
            <strong className="text-gray-700 dark:text-zinc-200">{COMPANY.trafficEstimate.toLocaleString()}</strong>
            {" "}→ Potential:{" "}
            <strong className="text-teal-600 dark:text-teal-400">{COMPANY.potentialTraffic.toLocaleString()}</strong>/mo
          </p>
          <button
            onClick={onNext}
            className="h-10 px-6 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm transition-colors"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
