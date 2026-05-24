"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHeader } from "../../_shared/section-header";

interface Feature {
  id: string;
  name: string;
  desc: string;
  votes: number;
  category: string;
}

const INITIAL_FEATURES: Feature[] = [
  { id: "ai-agent",      name: "AI Agent",                desc: "Autonomous content execution — publishes, refreshes, and optimizes without manual input.",       votes: 284, category: "Automation" },
  { id: "auto-blog",     name: "Auto Blog Updates",        desc: "Automatically refresh aging articles to recover lost rankings.",                                  votes: 231, category: "Automation" },
  { id: "social-auto",   name: "Social Media Automation",  desc: "Auto-distribute published content across LinkedIn, X, and Instagram.",                           votes: 198, category: "Distribution" },
  { id: "video-gen",     name: "Video Generation",         desc: "Convert blogs to short-form video with AI voiceover and visuals.",                                votes: 176, category: "Content" },
  { id: "image-gen",     name: "Image Generation",         desc: "AI-generated featured images and infographics for every article.",                               votes: 154, category: "Content" },
  { id: "backlink-ex",   name: "Backlink Exchange",         desc: "Peer-to-peer backlink network with vetted publishers in your niche.",                            votes: 142, category: "Authority" },
  { id: "team-collab",   name: "Team Collaboration",        desc: "Multi-user workspace with roles, approvals, and content queues.",                                votes: 138, category: "Workspace" },
  { id: "agency-mode",   name: "Agency Mode",               desc: "Manage multiple client sites from a single dashboard with white-label reports.",                 votes: 127, category: "Workspace" },
  { id: "geo-aeo",       name: "Advanced GEO / AEO",        desc: "Optimize every page for AI Overviews, ChatGPT, and answer-engine visibility.",                  votes: 119, category: "SEO" },
  { id: "html-builder",  name: "Custom HTML Builder",        desc: "Visual page builder for landing pages — no dev required.",                                      votes: 94,  category: "Content" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Automation:   "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  Distribution: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  Content:      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  Authority:    "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  Workspace:    "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  SEO:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

function UpvoteButton({ upvoted, votes, onToggle }: { upvoted: boolean; votes: number; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all border",
        upvoted
          ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300"
          : "bg-card border-app text-muted-fg hover:border-teal-300 hover:text-teal-600 dark:hover:border-teal-700",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 2L2 8h3v4h4V8h3L7 2z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          fill={upvoted ? "currentColor" : "none"}
        />
      </svg>
      <span>{votes.toLocaleString()}</span>
    </button>
  );
}

export function ComingSoonSection() {
  const [features, setFeatures] = useState<Feature[]>(INITIAL_FEATURES);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setFeatures((f) => f.map((x) => x.id === id ? { ...x, votes: x.votes - 1 } : x));
      } else {
        next.add(id);
        setFeatures((f) => f.map((x) => x.id === id ? { ...x, votes: x.votes + 1 } : x));
      }
      return next;
    });
  };

  const sorted = [...features].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Coming Soon"
        subtitle="Vote for what we build next. Top-voted features get priority."
      />

      {/* Stats strip */}
      <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/20 border border-teal-100 dark:border-teal-900/40">
        <div>
          <div className="text-lg font-bold text-teal-700 dark:text-teal-300">{features.reduce((s, f) => s + f.votes, 0).toLocaleString()}</div>
          <div className="text-xs text-muted-fg">Total votes</div>
        </div>
        <div className="w-px h-8 bg-teal-100 dark:bg-teal-900" />
        <div>
          <div className="text-lg font-bold text-fg">{features.length}</div>
          <div className="text-xs text-muted-fg">Features planned</div>
        </div>
        <div className="w-px h-8 bg-teal-100 dark:bg-teal-900" />
        <div>
          <div className="text-lg font-bold text-fg">{upvoted.size}</div>
          <div className="text-xs text-muted-fg">Your votes</div>
        </div>
        <div className="ml-auto text-xs text-muted-fg">Most upvoted features ship first</div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((feature, i) => (
          <div
            key={feature.id}
            className={cn(
              "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm",
              upvoted.has(feature.id) ? "border-teal-200 dark:border-teal-800/60" : "border-app",
            )}
          >
            {/* Rank + category */}
            <div className="flex items-center justify-between">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", CATEGORY_COLORS[feature.category] ?? "bg-zinc-100 text-zinc-600")}>
                {feature.category}
              </span>
              {i === 0 && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>🔥</span> Most wanted
                </span>
              )}
            </div>

            {/* Name + desc */}
            <div className="flex-1">
              <div className="text-sm font-semibold text-fg mb-1">{feature.name}</div>
              <p className="text-xs text-muted-fg leading-relaxed">{feature.desc}</p>
            </div>

            {/* Upvote */}
            <div className="flex items-center justify-between">
              <UpvoteButton
                upvoted={upvoted.has(feature.id)}
                votes={feature.votes}
                onToggle={() => toggle(feature.id)}
              />
              {upvoted.has(feature.id) && (
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Voted ✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggest a feature */}
      <div className="rounded-xl border border-dashed border-app bg-muted/30 p-5 text-center">
        <div className="text-sm font-medium text-fg mb-1">Have an idea we haven&apos;t listed?</div>
        <p className="text-xs text-muted-fg mb-3">Tell us what would make Blogy essential for your workflow.</p>
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Suggest a feature..."
            className="flex-1 rounded-lg border border-app bg-card px-3 py-1.5 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <button className="rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-1.5 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
