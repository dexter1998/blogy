"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const STATUS_MESSAGES = [
  "Analyzing your website",
  "Reading your sitemap",
  "Identifying content opportunities",
  "Scanning competitor strategies",
  "Processing 4,312 keywords",
  "Comparing SERP results",
  "Detecting content gaps",
  "Building your growth roadmap",
  "Generating your Business DNA",
];

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M6.5 1C5 3 4.5 4.5 4.5 6.5S5 10 6.5 12M6.5 1C8 3 8.5 4.5 8.5 6.5S8 10 6.5 12M1 6.5h11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface StepProcessingProps {
  onComplete: () => void;
}

export function StepProcessing({ onComplete }: StepProcessingProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const cycle = () => {
      setVisible(false);
      setTimeout(() => {
        i = (i + 1) % STATUS_MESSAGES.length;
        setMsgIndex(i);
        setVisible(true);
      }, 350);
    };

    const interval = setInterval(cycle, 2200);
    const completeTimer = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, STATUS_MESSAGES.length * 2200 + 800);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-md flex flex-col items-center text-center gap-5">
      {/* Main card */}
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 backdrop-blur-sm px-8 py-10 w-full shadow-xl dark:shadow-2xl">
        <h2 className="text-3xl font-serif italic text-gray-900 dark:text-white leading-snug mb-2">
          Generating your
          <br />
          Business DNA
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
          We're researching and analyzing your business.
          <br />
          It will take several minutes. Feel free to come back later.
        </p>

        {/* Rotating status pill */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-6 transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0",
          )}
          style={{ background: "#2d3a1a", color: "#b8cc6e" }}
        >
          <span className="text-xs opacity-80">✦</span>
          {STATUS_MESSAGES[msgIndex]}
        </div>

        {/* URL chip */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-300 text-sm">
            <GlobeIcon />
            https://www.blogy.in
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-600 text-sm">
        <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-zinc-600 animate-pulse" />
        This may take a few minutes
      </div>
    </div>
  );
}
