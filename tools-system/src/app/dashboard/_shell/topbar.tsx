"use client";

import { cn } from "@/lib/cn";
import type { SectionId } from "../types";

const SECTION_LABELS: Record<SectionId, string> = {
  home:         "Home",
  "cmo-brain":  "CMO Brain",
  create:       "Create",
  reports:      "Reports",
  scheduling:   "Scheduling",
  settings:     "Settings",
  integrations: "Integrations",
  marketplace:  "Marketplace",
  trends:       "Trends",
  billing:      "Billing & Usage",
  todos:        "Todos",
  "coming-soon":"Coming Soon",
};

interface TopbarProps {
  activeSection: SectionId;
  onNewBlog: () => void;
}

export function Topbar({ activeSection, onNewBlog }: TopbarProps) {
  return (
    <header className="h-14 flex items-center justify-between gap-4 px-6 border-b border-app bg-card shrink-0">
      <h1 className="text-base font-semibold text-fg">{SECTION_LABELS[activeSection]}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-app bg-muted text-muted-fg text-sm w-48">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2" /><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <span className="flex-1 text-xs">Search...</span>
          <kbd className="text-[10px] bg-white dark:bg-zinc-800 rounded px-1 border border-app">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition text-muted-fg hover:text-fg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a5 5 0 00-5 5v2L2 11h12l-1-2V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M6.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* New Blog CTA */}
        <button
          onClick={onNewBlog}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
          New Blog
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">
          T
        </button>
      </div>
    </header>
  );
}
