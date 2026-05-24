"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import { BLOGS } from "../../mock-data";
import type { Blog, BlogStatus, WizardDraft } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusTone(status: BlogStatus): "good" | "warn" | "neutral" | "bad" {
  if (status === "published") return "good";
  if (status === "scheduled") return "warn";
  return "neutral";
}

function GeneratingDot() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full bg-teal-500 animate-spin border border-teal-300" />
      <span className="text-xs text-muted-fg">Generating...</span>
    </span>
  );
}

function KebabMenu({ blog, open, onToggle, onClose }: { blog: Blog; open: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1.5 rounded-md hover:bg-muted text-muted-fg hover:text-fg transition">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.2" /><circle cx="8" cy="8" r="1.2" /><circle cx="8" cy="13" r="1.2" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute right-0 top-8 z-20 min-w-[150px] rounded-xl border border-app bg-card shadow-xl py-1">
            {[{ label: "Edit", icon: "✏️" }, { label: "Duplicate", icon: "⧉" }, { label: "Schedule", icon: "🗓" }].map((a) => (
              <button key={a.label} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition text-fg">
                <span className="text-sm">{a.icon}</span>{a.label}
              </button>
            ))}
            {blog.status === "published" && (
              <button className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition text-fg"><span className="text-sm">↺</span>Update Content</button>
            )}
            <div className="my-1 border-t border-app" />
            <button className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition text-rose-500"><span className="text-sm">🗑</span>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Auto Mode card ───────────────────────────────────────────────────────────

function AutoModeCard() {
  const scheduled  = BLOGS.filter((b) => b.status === "scheduled").length;
  const generating = BLOGS.filter((b) => b.status === "generating").length;
  const drafts     = BLOGS.filter((b) => b.status === "draft").length;
  const total      = scheduled + generating + drafts;

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800/60 bg-gradient-to-r from-teal-50 to-transparent dark:from-teal-950/20 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-sm font-bold text-fg">Auto Mode</span>
          </div>
          <p className="text-xs text-muted-fg">Blogy is monitoring and generating content automatically</p>
        </div>
        <button className="shrink-0 rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-teal-950/40 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 transition">
          Manage
        </button>
      </div>

      <div className="flex items-center gap-6">
        <Stat value={scheduled}  label="Scheduled"   color="text-amber-600 dark:text-amber-400" />
        <Stat value={generating} label="Generating"  color="text-teal-600 dark:text-teal-400" />
        <Stat value={drafts}     label="Pending"     color="text-muted-fg" />
        <div className="flex-1 h-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 overflow-hidden ml-2">
          <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round(((scheduled + generating) / Math.max(total, 1)) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center shrink-0">
      <div className={cn("text-xl font-bold tabular-nums", color)}>{value}</div>
      <div className="text-[10px] text-muted-fg mt-0.5">{label}</div>
    </div>
  );
}

// ─── Inline Blog Wizard (vertical accordion) ──────────────────────────────────

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

const STEP_META = [
  { title: "Title",          placeholder: "e.g. Best Term Insurance Plans in India 2025" },
  { title: "Keywords",       placeholder: "Add keywords and press Enter" },
  { title: "Search Intent",  placeholder: "" },
  { title: "Internal Links", placeholder: "" },
  { title: "References",     placeholder: "Paste a URL and press Enter" },
  { title: "Generate",       placeholder: "" },
];

const SUGGESTED_LINKS = [
  "Best Life Insurance Plans 2024",
  "How to Calculate Sum Assured",
  "Term vs Whole Life Insurance",
  "ULIP Plans Guide",
  "Claim Settlement Ratio Guide",
];

function StepSummary({ step, draft }: { step: number; draft: WizardDraft }) {
  if (step === 0) return <span className="text-xs text-muted-fg truncate max-w-[300px]">{draft.title || "—"}</span>;
  if (step === 1) return <span className="text-xs text-muted-fg">{draft.keywords.length > 0 ? draft.keywords.join(", ") : "—"}</span>;
  if (step === 2) return <span className="text-xs text-muted-fg capitalize">{draft.intent}</span>;
  if (step === 3) return <span className="text-xs text-muted-fg">{draft.internalLinks.length} selected</span>;
  if (step === 4) return <span className="text-xs text-muted-fg">{draft.references.length} references</span>;
  return null;
}

function BlogWorkflow({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState<WizardDraft>({ title: "", keywords: [], intent: "informational", internalLinks: [], references: [] });
  const [kwInput, setKwInput] = useState("");
  const [refInput, setRefInput] = useState("");
  const [generating, setGenerating] = useState(false);

  function advance() {
    setCompletedSteps((p) => new Set([...p, currentStep]));
    if (currentStep < 5) setCurrentStep((s) => (s + 1) as WizardStep);
  }

  function goTo(step: number) {
    if (step === currentStep || completedSteps.has(step) || step === 0) setCurrentStep(step as WizardStep);
  }

  function addKeyword(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && kwInput.trim()) {
      setDraft((d) => ({ ...d, keywords: [...d.keywords, kwInput.trim()] }));
      setKwInput("");
    }
  }

  function addRef(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && refInput.trim()) {
      setDraft((d) => ({ ...d, references: [...d.references, refInput.trim()] }));
      setRefInput("");
    }
  }

  function toggleLink(link: string) {
    setDraft((d) => ({
      ...d,
      internalLinks: d.internalLinks.includes(link)
        ? d.internalLinks.filter((l) => l !== link)
        : d.internalLinks.length < 5 ? [...d.internalLinks, link] : d.internalLinks,
    }));
  }

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800/60 bg-card shadow-sm overflow-hidden">
      {/* Workflow header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-app bg-teal-50/50 dark:bg-teal-950/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-sm font-semibold text-fg">New Blog</span>
        </div>
        <button onClick={onClose} className="text-muted-fg hover:text-fg transition p-1 rounded-md hover:bg-muted">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* Steps */}
      <div className="divide-y divide-app">
        {STEP_META.map((meta, i) => {
          const isDone      = completedSteps.has(i);
          const isActive    = currentStep === i;
          const isAccessible = isDone || isActive || i === 0;

          return (
            <div key={i} className={cn("transition-colors", isActive ? "bg-muted/30" : "")}>
              {/* Step header */}
              <button
                type="button"
                onClick={() => goTo(i)}
                disabled={!isAccessible}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3.5 text-left transition",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-40",
                  !isActive && isAccessible && "hover:bg-muted/40",
                )}
              >
                {/* Circle */}
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border",
                  isDone ? "bg-teal-500 border-teal-500 text-white" : isActive ? "border-teal-500 text-teal-600 dark:text-teal-400" : "border-app text-muted-fg"
                )}>
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : i + 1}
                </div>
                <span className={cn("text-sm font-medium flex-1", isActive ? "text-fg" : isDone ? "text-fg" : "text-muted-fg")}>
                  {meta.title}
                </span>
                {isDone && !isActive && <StepSummary step={i} draft={draft} />}
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-fg">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {/* Step body */}
              {isActive && (
                <div className="px-5 pb-5">
                  {/* Step 0: Title */}
                  {i === 0 && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        placeholder={meta.placeholder}
                        className="w-full rounded-lg border border-app bg-card px-3 py-2.5 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                      <div className="flex flex-wrap gap-2">
                        {["Best Term Insurance Plans in India 2025", "ULIP vs Term Insurance — Complete Guide", "How to Choose Health Insurance for Family"].map((s) => (
                          <button key={s} onClick={() => setDraft((d) => ({ ...d, title: s }))} className="text-[11px] rounded-lg border border-app bg-muted px-2.5 py-1 text-muted-fg hover:text-fg hover:border-teal-400 transition">{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Keywords */}
                  {i === 1 && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={kwInput}
                        onChange={(e) => setKwInput(e.target.value)}
                        onKeyDown={addKeyword}
                        placeholder="Type a keyword and press Enter"
                        className="w-full rounded-lg border border-app bg-card px-3 py-2.5 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                      {draft.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {draft.keywords.map((kw) => (
                            <span key={kw} className="inline-flex items-center gap-1 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 text-xs font-medium">
                              {kw}
                              <button onClick={() => setDraft((d) => ({ ...d, keywords: d.keywords.filter((k) => k !== kw) }))} className="ml-0.5 hover:opacity-70">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Intent */}
                  {i === 2 && (
                    <div className="space-y-2">
                      {(["informational", "commercial", "transactional"] as const).map((intent) => (
                        <button
                          key={intent}
                          onClick={() => setDraft((d) => ({ ...d, intent }))}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition",
                            draft.intent === intent ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40" : "border-app bg-card hover:bg-muted/40"
                          )}
                        >
                          <div className={cn("w-3.5 h-3.5 rounded-full border-2 shrink-0", draft.intent === intent ? "border-teal-500 bg-teal-500" : "border-muted-fg")} />
                          <div>
                            <div className="text-sm font-medium text-fg capitalize">{intent}</div>
                            <div className="text-xs text-muted-fg">
                              {intent === "informational" && "Educate readers, build awareness"}
                              {intent === "commercial" && "Help users compare and evaluate"}
                              {intent === "transactional" && "Drive direct conversions"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Internal Links */}
                  {i === 3 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-fg mb-2">Select up to 5 pages to link to</p>
                      {SUGGESTED_LINKS.map((link) => {
                        const checked = draft.internalLinks.includes(link);
                        return (
                          <button
                            key={link}
                            onClick={() => toggleLink(link)}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition",
                              checked ? "border-teal-400 bg-teal-50 dark:bg-teal-950/30" : "border-app bg-card hover:bg-muted/40"
                            )}
                          >
                            <div className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center", checked ? "bg-teal-500 border-teal-500" : "border-muted-fg")}>
                              {checked && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <span className="text-xs text-fg">{link}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 4: References */}
                  {i === 4 && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={refInput}
                        onChange={(e) => setRefInput(e.target.value)}
                        onKeyDown={addRef}
                        placeholder="Paste a URL and press Enter"
                        className="w-full rounded-lg border border-app bg-card px-3 py-2.5 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                      {draft.references.length > 0 && (
                        <div className="space-y-1.5">
                          {draft.references.map((ref) => (
                            <div key={ref} className="flex items-center gap-2 rounded-lg border border-app bg-muted/40 px-3 py-1.5">
                              <span className="flex-1 text-xs text-fg truncate">{ref}</span>
                              <button onClick={() => setDraft((d) => ({ ...d, references: d.references.filter((r) => r !== ref) }))} className="text-muted-fg hover:text-rose-500 text-sm transition">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Generate */}
                  {i === 5 && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-app bg-muted/30 p-4 space-y-2">
                        <div className="text-xs font-semibold text-fg">Brief Summary</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-muted-fg">Title: </span><span className="text-fg font-medium">{draft.title || "—"}</span></div>
                          <div><span className="text-muted-fg">Intent: </span><span className="text-fg font-medium capitalize">{draft.intent}</span></div>
                          <div><span className="text-muted-fg">Keywords: </span><span className="text-fg font-medium">{draft.keywords.length || 0}</span></div>
                          <div><span className="text-muted-fg">Internal links: </span><span className="text-fg font-medium">{draft.internalLinks.length}</span></div>
                        </div>
                      </div>
                      {generating ? (
                        <div className="rounded-xl border border-app bg-card p-6 text-center space-y-3">
                          <div className="w-10 h-10 rounded-full border-2 border-teal-500 border-t-transparent animate-spin mx-auto" />
                          <div className="text-sm font-medium text-fg">Generating your article...</div>
                          <div className="text-xs text-muted-fg">This takes 30–60 seconds. We&apos;ll notify you when done.</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setGenerating(true)}
                          className="w-full rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-3 transition shadow-sm"
                        >
                          ✦ Generate Article
                        </button>
                      )}
                    </div>
                  )}

                  {/* Next button (not on last step) */}
                  {i < 5 && (
                    <button
                      onClick={advance}
                      className="mt-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-4 py-2 transition"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Blog Table ───────────────────────────────────────────────────────────────

type ManualTab = "all" | "draft" | "published" | "scheduled";

function BlogTable() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManualTab>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = activeTab === "all" ? BLOGS : BLOGS.filter((b) => b.status === activeTab);
  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-0 border-b border-app mb-0 overflow-x-auto">
        {(["all", "published", "scheduled", "draft"] as ManualTab[]).map((tab) => {
          const count = tab === "all" ? BLOGS.length : BLOGS.filter((b) => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize",
                activeTab === tab
                  ? "border-teal-500 text-teal-700 dark:text-teal-300"
                  : "border-transparent text-muted-fg hover:text-fg"
              )}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="text-[11px] rounded-full bg-muted px-1.5 py-0.5 text-muted-fg font-medium">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-app bg-card shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app bg-muted/40">
                {["Title", "Status", "Keywords", "Clicks", "Published", "Assigned", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-muted-fg uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {displayed.map((blog) => (
                <tr key={blog.id} className="hover:bg-muted/30 transition group">
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="font-medium text-fg text-sm leading-snug line-clamp-2">{blog.title}</div>
                    {blog.isLiveDetected && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">Live ✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {blog.status === "generating" ? <GeneratingDot /> : <Badge tone={statusTone(blog.status)}>{blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}</Badge>}
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    {blog.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-fg max-w-[130px] truncate">{blog.keywords[0]}</span>
                        {blog.keywords.length > 1 && <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-fg">+{blog.keywords.length - 1}</span>}
                      </div>
                    ) : <span className="text-xs text-muted-fg">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {blog.status === "published" ? (
                      <div>
                        <div className="text-sm font-medium text-fg tabular-nums">{blog.clicks.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-fg tabular-nums">{blog.impressions.toLocaleString()} impr.</div>
                      </div>
                    ) : <span className="text-xs text-muted-fg">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {blog.status === "published" && blog.publishedAt
                      ? <span className="text-xs text-muted-fg">{new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      : blog.status === "scheduled" && blog.scheduledAt
                        ? <span className="text-xs text-amber-600 font-medium">{new Date(blog.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        : <span className="text-xs text-muted-fg">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {blog.assignedTo
                      ? <span className="inline-flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-bold text-teal-700 dark:text-teal-300">{blog.assignedTo.charAt(0)}</span><span className="text-xs text-muted-fg">{blog.assignedTo}</span></span>
                      : <span className="text-xs text-muted-fg">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <KebabMenu blog={blog} open={openMenuId === blog.id} onToggle={() => setOpenMenuId(openMenuId === blog.id ? null : blog.id)} onClose={() => setOpenMenuId(null)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 8 && (
          <div className="border-t border-app px-4 py-3 text-center">
            <button onClick={() => setShowAll(!showAll)} className="text-xs font-medium text-teal-600 hover:text-teal-700 transition">
              {showAll ? "Show less" : `Load more (${filtered.length - 8} more)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CreateSection() {
  const [workflowOpen, setWorkflowOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-fg mb-1">Create</h2>
          <p className="text-xs text-muted-fg">Manage your content in Auto Mode and Manual Mode</p>
        </div>
        {!workflowOpen && (
          <button
            onClick={() => setWorkflowOpen(true)}
            className="shrink-0 flex items-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 py-2 transition shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            New Blog
          </button>
        )}
      </div>

      {/* Auto Mode */}
      <AutoModeCard />

      {/* Inline workflow */}
      {workflowOpen && <BlogWorkflow onClose={() => setWorkflowOpen(false)} />}

      {/* Manual Mode */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-fg">Manual Mode</span>
          <span className="text-xs text-muted-fg">· Your drafts, published, and scheduled blogs</span>
        </div>
        <BlogTable />
      </div>
    </div>
  );
}
