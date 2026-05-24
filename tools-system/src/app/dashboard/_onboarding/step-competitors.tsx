"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { COMPETITORS } from "../mock-data";
import { ScoreGauge } from "../_shared/score-gauge";
import type { Competitor } from "../types";

interface StepCompetitorsProps {
  onNext: () => void;
}

export function StepCompetitors({ onNext }: StepCompetitorsProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>(COMPETITORS);
  const [confirmed, setConfirmed] = useState(false);

  const remove = (domain: string) => {
    setCompetitors((c) => c.filter((x) => x.domain !== domain));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onNext, 600);
  };

  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 text-xs font-medium mb-4">
          ⚡ Strategy-Critical Step
        </div>
        <h2 className="text-3xl font-serif italic text-gray-900 dark:text-white mb-2 leading-snug">
          Your Real Competitors
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Your entire content strategy depends on beating these companies. Edit if needed.
        </p>
      </div>

      <div className="space-y-3 mb-5">
        {competitors.map((c) => {
          const threatColor =
            c.threatScore > 80 ? "#f43f5e" : c.threatScore > 65 ? "#f59e0b" : "#14b8a6";
          return (
            <div
              key={c.domain}
              className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/50 p-4 shadow-sm dark:shadow-none"
            >
              <ScoreGauge score={c.threatScore} size={48} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 dark:text-zinc-100">{c.name}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-zinc-500">DA {c.da}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">{c.sitemapUrls.toLocaleString()} pages</span>
                  <span className="text-xs font-medium" style={{ color: threatColor }}>
                    Threat: {c.threatScore}
                  </span>
                </div>
                <div className="text-xs text-gray-300 dark:text-zinc-600 mt-0.5">{c.domain}</div>
              </div>
              <button
                onClick={() => remove(c.domain)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-zinc-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}

        <button className="w-full h-11 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-sm text-gray-400 dark:text-zinc-600 hover:border-teal-400 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center justify-center gap-2">
          <span>+</span> Add a competitor
        </button>
      </div>

      <div
        className={cn(
          "rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-4 mb-5 transition-opacity",
          confirmed ? "opacity-0" : "opacity-100",
        )}
      >
        <p className="text-sm text-amber-700 dark:text-amber-300/80 font-medium">
          ⚠ These competitors shape your entire growth strategy. Blogy designs your content
          roadmap specifically to outrank them.
        </p>
      </div>

      <button
        onClick={handleConfirm}
        disabled={competitors.length === 0}
        className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        Confirm Competitors & Continue →
      </button>
    </div>
  );
}
