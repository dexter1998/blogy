"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge, Button, Card, CopyButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SeoAuditResult } from "@/scrapers/seo-audit/types";
import type {
  AuditReport,
  CategoryId,
  CategoryScore,
  CheckResult,
  Grade,
  ImageAuditResult,
} from "@/scrapers/seo-audit/report-types";
import type { PageSpeedResult } from "@/scrapers/pagespeed/types";

type ApiResp =
  | { ok: true; data: { result: SeoAuditResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

// ── helpers ─────────────────────────────────────────────────────────────

function normaliseUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function gradeTone(g: Grade): "good" | "warn" | "bad" {
  if (g === "A+" || g === "A" || g === "B") return "good";
  if (g === "C" || g === "D") return "warn";
  return "bad";
}

function scoreTone(score: number): "good" | "warn" | "bad" {
  if (score >= 75) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

function fmtKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function pathOf(u: string): string {
  try {
    return new URL(u).pathname || u;
  } catch {
    return u;
  }
}

// ── small UI primitives ─────────────────────────────────────────────────

function ScoreGauge({
  score,
  size = 96,
  grade,
}: {
  score: number;
  size?: number;
  grade?: Grade;
}) {
  const tone = scoreTone(score);
  const color =
    tone === "good"
      ? "rgb(16 185 129)"
      : tone === "warn"
        ? "rgb(245 158 11)"
        : "rgb(244 63 94)";
  const trackColor = "rgb(228 228 231)";
  const stroke = Math.max(6, Math.round(size * 0.08));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * c;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          className="opacity-40 dark:opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={cn(
            "font-semibold tabular-nums",
            tone === "good" && "text-emerald-600 dark:text-emerald-400",
            tone === "warn" && "text-amber-600 dark:text-amber-400",
            tone === "bad" && "text-rose-600 dark:text-rose-400",
          )}
          style={{ fontSize: size / 3.2 }}
        >
          {Math.round(score)}
        </span>
        {grade && (
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-fg">
            {grade}
          </span>
        )}
      </div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: CheckResult["severity"] }) {
  const map: Record<CheckResult["severity"], { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
    critical: { label: "Critical", tone: "bad" },
    warning: { label: "Warning", tone: "warn" },
    pass: { label: "Passed", tone: "good" },
    info: { label: "Info", tone: "neutral" },
  };
  const m = map[severity];
  const cls = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    bad: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    neutral: "bg-muted text-muted-fg",
  }[m.tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider", cls)}>
      {m.label}
    </span>
  );
}

function StatusIcon({ status }: { status: CheckResult["status"] }) {
  const c = {
    pass: "text-emerald-500",
    warn: "text-amber-500",
    fail: "text-rose-500",
    info: "text-zinc-400",
    skipped: "text-zinc-300",
  }[status];
  const glyph = status === "pass" ? "✓" : status === "fail" ? "✕" : status === "warn" ? "!" : "i";
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
        c,
        "border-current",
      )}
    >
      {glyph}
    </span>
  );
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" | "accent" }) {
  const t = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    bad: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    accent: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200",
    neutral: "bg-muted text-muted-fg",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", t)}>{children}</span>;
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-app bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-fg">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-fg">{hint}</div>}
    </div>
  );
}

function Table({ headers, rows, dense = false }: { headers: string[]; rows: ReactNode[][]; dense?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-app">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th key={h} className={cn("text-left text-[11px] font-semibold uppercase tracking-wider text-muted-fg", dense ? "px-2 py-1.5" : "px-3 py-2")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-app">
              {r.map((c, j) => (
                <td key={j} className={cn("align-top", dense ? "px-2 py-1.5" : "px-3 py-2")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── section + check card ───────────────────────────────────────────────

function Section({ id, title, subtitle, action, children }: { id: string; title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-fg">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CheckCard({ c, defaultOpen = false }: { c: CheckResult; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [forceOpen, setForceOpen] = useState(false);
  useEffect(() => {
    const onPrint = () => setForceOpen(true);
    const onPrintEnd = () => setForceOpen(false);
    window.addEventListener("beforeprint", onPrint);
    window.addEventListener("afterprint", onPrintEnd);
    return () => {
      window.removeEventListener("beforeprint", onPrint);
      window.removeEventListener("afterprint", onPrintEnd);
    };
  }, []);
  const expandable = c.status !== "pass" || c.evidence.length > 0;
  const isOpen = open || forceOpen;
  return (
    <Card className="!p-0">
      <button
        type="button"
        onClick={() => expandable && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-start gap-3 p-4 text-left",
          expandable && "cursor-pointer hover:bg-muted/30",
        )}
        aria-expanded={isOpen}
      >
        <StatusIcon status={c.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{c.title}</span>
            <SeverityPill severity={c.severity} />
          </div>
          <div className="mt-1 text-sm text-muted-fg">{c.summary}</div>
        </div>
        {expandable && (
          <span className={cn("ml-2 text-muted-fg transition-transform", isOpen && "rotate-180")}>▾</span>
        )}
      </button>
      {isOpen && expandable && (
        <div className="border-t border-app bg-muted/20 p-4 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Why it matters</div>
              <p className="text-sm">{c.whyItMatters}</p>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">How to fix</div>
              <p className="text-sm">{c.howToFix}</p>
            </div>
          </div>
          {c.evidence.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Evidence</div>
              <Table
                dense
                headers={["Signal", "Value"]}
                rows={c.evidence.map((e) => [
                  <span key="l" className="text-muted-fg">{e.label}</span>,
                  Array.isArray(e.value) ? (
                    <ul key="v" className="space-y-0.5 break-all font-mono text-xs">
                      {e.value.slice(0, 8).map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                      {e.value.length > 8 && <li className="text-muted-fg">+ {e.value.length - 8} more</li>}
                    </ul>
                  ) : (
                    <span key="v" className="break-all font-mono text-xs">{String(e.value)}</span>
                  ),
                ])}
              />
            </div>
          )}
          {c.affectedUrls && c.affectedUrls.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                Affected URLs ({c.affectedUrls.length})
              </div>
              <ul className="space-y-1 break-all font-mono text-xs">
                {c.affectedUrls.slice(0, 10).map((u) => (
                  <li key={u}>{u}</li>
                ))}
                {c.affectedUrls.length > 10 && (
                  <li className="text-muted-fg">+ {c.affectedUrls.length - 10} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── nav ─────────────────────────────────────────────────────────────────

const NAV: Array<{ id: string; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "critical", label: "Critical" },
  { id: "warnings", label: "Warnings" },
  { id: "passed", label: "Passed" },
  { id: "categories", label: "All checks" },
  { id: "performance", label: "Performance" },
  { id: "schema", label: "Schema" },
  { id: "links", label: "Links" },
  { id: "social", label: "Social" },
  { id: "tech", label: "Technology" },
  { id: "sitemap", label: "Sitemap" },
  { id: "raw", label: "Raw JSON" },
];

function NavBar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div className="sticky top-0 z-30 -mx-1 overflow-x-auto rounded-lg border border-app bg-card/95 px-1 py-2 shadow-sm backdrop-blur">
      <div className="flex gap-1">
        {NAV.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition",
              active === t.id ? "bg-accent text-white" : "text-muted-fg hover:bg-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── main form ──────────────────────────────────────────────────────────

export function AuditForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [activeNav, setActiveNav] = useState<string>("summary");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Load a shared report from the URL hash on first mount.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#r=")) return;
    try {
      const json = atob(decodeURIComponent(hash.slice(3)));
      const r = JSON.parse(json) as AuditReport;
      setReport(r);
      setUrl(r.url);
    } catch {
      /* ignore malformed share links */
    }
  }, []);

  useEffect(() => {
    if (report && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveNav(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 },
    );
    for (const t of NAV) {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [report]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = normaliseUrl(url || "blogy.in");
    if (!target) return;
    setError(null);
    setReport(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) {
        setError(json.error.message);
      } else {
        setReport(json.data.result.report);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function exportJson() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    triggerDownload(blob, `seo-audit-${hostOf(report.url)}.json`);
  }

  function exportCsv() {
    if (!report) return;
    const rows = [
      ["id", "title", "category", "status", "severity", "summary", "whyItMatters", "howToFix"],
      ...report.checks.map((c) => [
        c.id,
        c.title,
        c.category,
        c.status,
        c.severity,
        c.summary,
        c.whyItMatters,
        c.howToFix,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, `seo-audit-${hostOf(report.url)}.csv`);
  }

  function exportPdf() {
    // Hand off to the browser print dialog. Check cards listen for the
    // `beforeprint` event and force-expand themselves, and the print
    // stylesheet (in globals.css) hides nav/form/etc.
    window.print();
  }

  function shareLink() {
    if (!report) return;
    // Compact payload — drop bulky raw fetched objects to keep URL workable.
    const compact: AuditReport = {
      ...report,
      signals: {
        ...report.signals,
        intelligence: null,
        backlinks: null,
        sitemap: null,
        schema: report.signals.schema
          ? {
              ...report.signals.schema,
              items: [],
            }
          : null,
      },
    };
    const enc = encodeURIComponent(btoa(JSON.stringify(compact)));
    const url = `${window.location.origin}${window.location.pathname}#r=${enc}`;
    void navigator.clipboard.writeText(url).then(() => {
      alert("Share link copied to clipboard.");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm font-medium">Website URL</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="blogy.in"
              className="min-w-0 flex-1 rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Auditing…" : "Run full audit"}
            </Button>
          </div>
          {loading && (
            <div className="rounded border border-app bg-muted/30 p-3 text-xs text-muted-fg">
              Running ~50 checks across 9 internal scans — usually 20–40 seconds on a cold cache.
            </div>
          )}
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {report && (
        <div ref={resultsRef} className="min-w-0 space-y-6">
          <NavBar
            active={activeNav}
            onChange={(id) => {
              setActiveNav(id);
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />

          <Summary report={report} onExportJson={exportJson} onExportCsv={exportCsv} onExportPdf={exportPdf} onShare={shareLink} />
          <CriticalSection report={report} />
          <WarningsSection report={report} />
          <PassedSection report={report} />
          <CategoriesSection report={report} />
          <PerformanceSection report={report} />
          <SchemaSection report={report} />
          <LinksSection report={report} />
          <SocialSection report={report} />
          <TechSection report={report} />
          <SitemapSection report={report} />
          <RawSection report={report} />
        </div>
      )}
    </div>
  );
}

// ── sections ────────────────────────────────────────────────────────────

function Summary({
  report,
  onExportJson,
  onExportCsv,
  onExportPdf,
  onShare,
}: {
  report: AuditReport;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onShare: () => void;
}) {
  const failures = report.fetchFailures;
  return (
    <Section id="summary" title={`Audit Results for ${hostOf(report.url)}`} subtitle={new Date(report.fetchedAt).toUTCString()}>
      <Card>
        <div className="grid gap-6 md:grid-cols-[auto_1fr_auto]">
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge score={report.overall.score} size={128} grade={report.overall.grade} />
            <div className="text-xs uppercase tracking-wider text-muted-fg">Overall</div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {report.categories.map((c) => (
              <CategoryTile key={c.category} c={c} />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-1">
              <Badge tone="bad">{report.prioritised.critical.length} critical</Badge>
              <Badge tone="warn">{report.prioritised.warnings.length} warning</Badge>
              <Badge tone="good">{report.prioritised.passed.length} passed</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={onExportJson}>
                Export JSON
              </Button>
              <Button variant="ghost" size="sm" onClick={onExportCsv}>
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={onExportPdf}>
                Print / PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={onShare}>
                Share link
              </Button>
            </div>
            <a
              href={`/api/v1/seo-audit?url=${encodeURIComponent(report.url)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              View as JSON API →
            </a>
          </div>
        </div>
        {failures.length > 0 && (
          <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <div className="font-semibold">Some signal sources failed (audit ran in degraded mode):</div>
            <ul className="mt-1 list-disc pl-4">
              {failures.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </Section>
  );
}

function CategoryTile({ c }: { c: CategoryScore }) {
  return (
    <a
      href="#categories"
      className="flex flex-col items-center gap-1 rounded-lg border border-app p-3 text-center transition hover:bg-muted/40"
    >
      <ScoreGauge score={c.score} size={56} />
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-fg">{c.label}</div>
      <div className="text-[10px] text-muted-fg">
        {c.failures > 0 && <span className="text-rose-600 dark:text-rose-400">{c.failures} fail</span>}
        {c.failures > 0 && c.warnings > 0 && <span> · </span>}
        {c.warnings > 0 && <span className="text-amber-600 dark:text-amber-400">{c.warnings} warn</span>}
        {c.failures === 0 && c.warnings === 0 && <span>{c.passed} passed</span>}
      </div>
    </a>
  );
}

function CriticalSection({ report }: { report: AuditReport }) {
  const items = report.prioritised.critical;
  return (
    <Section id="critical" title="Critical issues" subtitle={`${items.length} issue${items.length === 1 ? "" : "s"} that hurt rankings or indexation`}>
      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-fg">No critical issues — great work.</p>
        </Card>
      ) : (
        items.map((c) => <CheckCard key={c.id} c={c} defaultOpen />)
      )}
    </Section>
  );
}

function WarningsSection({ report }: { report: AuditReport }) {
  const items = report.prioritised.warnings;
  return (
    <Section id="warnings" title="Warnings" subtitle={`${items.length} issue${items.length === 1 ? "" : "s"} worth fixing`}>
      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-fg">No warnings.</p>
        </Card>
      ) : (
        items.map((c) => <CheckCard key={c.id} c={c} />)
      )}
    </Section>
  );
}

function PassedSection({ report }: { report: AuditReport }) {
  const items = report.prioritised.passed;
  const [open, setOpen] = useState(false);
  const [forcePrint, setForcePrint] = useState(false);
  useEffect(() => {
    const on = () => setForcePrint(true);
    const off = () => setForcePrint(false);
    window.addEventListener("beforeprint", on);
    window.addEventListener("afterprint", off);
    return () => {
      window.removeEventListener("beforeprint", on);
      window.removeEventListener("afterprint", off);
    };
  }, []);
  const expanded = open || forcePrint;
  return (
    <Section
      id="passed"
      title="Passed checks"
      subtitle={`${items.length} checks the site is already doing right`}
      action={
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-accent hover:underline">
          {open ? "Hide" : "Show all"}
        </button>
      }
    >
      {expanded && items.map((c) => <CheckCard key={c.id} c={c} />)}
      {!expanded && (
        <Card>
          <p className="text-sm text-muted-fg">Click <span className="font-semibold">Show all</span> to expand the {items.length} passed checks.</p>
        </Card>
      )}
    </Section>
  );
}

function CategoriesSection({ report }: { report: AuditReport }) {
  const [active, setActive] = useState<CategoryId>(report.categories[0]?.category ?? "on-page");
  const items = report.checks.filter((c) => c.category === active);
  return (
    <Section id="categories" title="All checks by category" subtitle="Every check, grouped by category">
      <div className="-mx-1 overflow-x-auto rounded-lg border border-app bg-muted/20 px-1 py-1.5">
        <div className="flex gap-1">
          {report.categories.map((c) => (
            <button
              key={c.category}
              onClick={() => setActive(c.category)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition",
                active === c.category ? "bg-card text-fg shadow-sm" : "text-muted-fg hover:text-fg",
              )}
            >
              {c.label}
              <span className="ml-1.5 text-[10px] text-muted-fg">{c.score}</span>
            </button>
          ))}
        </div>
      </div>
      {items.map((c) => (
        <CheckCard key={c.id} c={c} />
      ))}
    </Section>
  );
}

function PerformanceSection({ report }: { report: AuditReport }) {
  const psM = report.signals.pagespeedMobile;
  const psD = report.signals.pagespeedDesktop;
  const ia = report.signals.images;
  if (!psM && !psD && !ia) return null;
  return (
    <Section id="performance" title="Performance" subtitle="Lab + field data from PageSpeed Insights, plus an in-place image audit">
      <div className="grid gap-4 lg:grid-cols-2">
        {psM && <PagespeedCard label="Mobile" result={psM} />}
        {psD && <PagespeedCard label="Desktop" result={psD} />}
      </div>
      {ia && <ImageAuditCard ia={ia} />}
    </Section>
  );
}

function PagespeedCard({ label, result }: { label: string; result: PageSpeedResult }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{label} PageSpeed</h3>
        <ScoreGauge score={result.lab.performanceScore ?? 0} size={48} />
      </div>
      <Table
        dense
        headers={["Metric", "Value"]}
        rows={[
          ["FCP", fmtMs(result.lab.metrics.fcp)],
          ["LCP", fmtMs(result.lab.metrics.lcp)],
          ["TTI", fmtMs(result.lab.metrics.tti)],
          ["TBT", fmtMs(result.lab.metrics.tbt)],
          ["CLS", result.lab.metrics.cls?.toFixed(3) ?? "—"],
          ["Speed Index", fmtMs(result.lab.metrics.si)],
        ]}
      />
      {result.lab.opportunities.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Top opportunities</div>
          <Table
            dense
            headers={["Audit", "Savings"]}
            rows={result.lab.opportunities.slice(0, 5).map((o) => [o.title, fmtMs(o.savingsMs)])}
          />
        </div>
      )}
    </Card>
  );
}

function ImageAuditCard({ ia }: { ia: ImageAuditResult }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold">Image audit</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Images" value={ia.totalImages} />
        <Stat label="Checked" value={ia.checked} />
        <Stat label="Oversized" value={ia.oversized.length} hint=">= 200 KB" />
        <Stat label="Total weight" value={fmtKb(ia.totalBytes)} />
        <Stat label="Missing alt" value={ia.missingAlt.length} />
        <Stat label="Lazy" value={ia.lazyCount} />
        <Stat label="Legacy formats" value={ia.legacyFormats.length} hint="JPG/PNG/GIF" />
      </div>
      {ia.oversized.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Worst offenders</div>
          <Table
            dense
            headers={["Image", "Size", "Type"]}
            rows={ia.oversized
              .slice()
              .sort((a, b) => b.bytes - a.bytes)
              .slice(0, 5)
              .map((o) => [
                <a key="u" href={o.src} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline dark:text-blue-400">
                  {o.src.length > 50 ? o.src.slice(0, 50) + "…" : o.src}
                </a>,
                fmtKb(o.bytes),
                o.mime ?? "—",
              ])}
          />
        </div>
      )}
    </Card>
  );
}

function SchemaSection({ report }: { report: AuditReport }) {
  const schema = report.signals.schema;
  if (!schema) return null;
  const detected = new Set(schema.detectedTypes.map((t) => t.toLowerCase()));
  const recommended = ["Organization", "WebSite", "BreadcrumbList", "Article", "FAQPage", "Product", "Service", "LocalBusiness"];
  return (
    <Section id="schema" title="Structured data" subtitle={`${schema.totalItems} JSON-LD / microdata items detected`}>
      <Card>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {recommended.map((name) => {
            const has = detected.has(name.toLowerCase());
            return (
              <div
                key={name}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-3",
                  has ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40" : "border-app bg-muted/20",
                )}
              >
                <span className={cn("text-base", has ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")}>
                  {has ? "✓" : "○"}
                </span>
                <span className="text-sm font-medium">{name}</span>
              </div>
            );
          })}
        </div>
        {schema.detectedTypes.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Detected types</div>
            <div className="flex flex-wrap gap-1.5">
              {schema.detectedTypes.map((t) => (
                <Pill key={t} tone="good">{t}</Pill>
              ))}
            </div>
          </div>
        )}
        {schema.issues.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Schema issues</div>
            <ul className="space-y-1 text-sm">
              {schema.issues.slice(0, 5).map((i, idx) => (
                <li key={idx} className="flex gap-2">
                  <Pill tone={i.severity === "error" ? "bad" : i.severity === "warning" ? "warn" : "neutral"}>{i.severity}</Pill>
                  <span>{i.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </Section>
  );
}

function LinksSection({ report }: { report: AuditReport }) {
  const b = report.signals.backlinks;
  const arch = report.signals.intelligence?.signals.internalArchitecture;
  if (!b && !arch) return null;
  return (
    <Section id="links" title="Links">
      <div className="grid gap-4 lg:grid-cols-2">
        {arch && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold">On-page link structure</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Internal" value={arch.totalInternalLinks} />
              <Stat label="External" value={arch.totalExternalLinks} />
              <Stat label="Internal URLs" value={arch.uniqueInternalUrls} />
              <Stat label="External domains" value={arch.uniqueExternalDomains} />
            </div>
            {arch.topAnchors.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Top anchors</div>
                <Table
                  dense
                  headers={["Anchor", "Count"]}
                  rows={arch.topAnchors.slice(0, 6).map((a) => [a.anchor || "(empty)", a.count])}
                />
              </div>
            )}
          </Card>
        )}
        {b && (
          <Card>
            <h3 className="mb-3 text-sm font-semibold">Backlinks</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total" value={b.totalBacklinks} />
              <Stat label="Referring domains" value={b.uniqueReferringDomains} />
              <Stat label="Verified" value={b.verifiedCount} />
              <Stat label="Candidates" value={b.totalCandidates} />
            </div>
            {b.topDomains.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Top referring domains</div>
                <Table
                  dense
                  headers={["Domain", "Backlinks"]}
                  rows={b.topDomains.slice(0, 8).map((d) => [d.domain, d.count])}
                />
              </div>
            )}
          </Card>
        )}
      </div>
    </Section>
  );
}

function SocialSection({ report }: { report: AuditReport }) {
  const intel = report.signals.intelligence;
  if (!intel) return null;
  const platforms = intel.signals.social.byPlatform;
  const yt = intel.signals.youtube;
  const pixels = intel.signals.pixels;
  return (
    <Section id="social" title="Social presence">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Linked profiles</h3>
          <Table
            dense
            headers={["Platform", "Profile"]}
            rows={Object.entries(platforms).map(([k, urls]) => [
              k,
              <a key={k} href={urls[0]} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline dark:text-blue-400">
                {urls[0]}
              </a>,
            ])}
          />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Tracking + activity</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="YouTube subs" value={yt.subscribersText ?? (yt.subscribers != null ? yt.subscribers.toLocaleString() : "—")} />
            <Stat label="YouTube views" value={yt.totalViewsText ?? (yt.totalViews != null ? yt.totalViews.toLocaleString() : "—")} />
            <Stat label="Pixels" value={pixels.count} />
            <Stat label="FB Pixel" value={pixels.facebookPixelDetected ? "✓" : "—"} hint={pixels.facebookPixelId ?? undefined} />
          </div>
          {pixels.detected.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Pixels detected</div>
              <Table
                dense
                headers={["Pixel", "ID"]}
                rows={pixels.detected.map((p) => [p.name, p.id ?? "—"])}
              />
            </div>
          )}
        </Card>
      </div>
    </Section>
  );
}

function TechSection({ report }: { report: AuditReport }) {
  const intel = report.signals.intelligence;
  if (!intel) return null;
  const net = intel.signals.network;
  const sec = intel.signals.security;
  const techs: Array<[string, string]> = [];
  for (const t of intel.signals.techStack.frameworks) techs.push([t, "Framework"]);
  for (const t of intel.signals.techStack.cms) techs.push([t, "CMS"]);
  for (const t of intel.signals.techStack.hosting) techs.push([t, "Hosting"]);
  for (const t of intel.signals.techStack.cdn) techs.push([t, "CDN"]);
  for (const t of intel.signals.techStack.buildTools) techs.push([t, "Build"]);
  for (const t of intel.signals.analytics.detected) techs.push([t, "Analytics"]);
  return (
    <Section id="tech" title="Technology + infrastructure">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Tech stack</h3>
          {techs.length === 0 ? (
            <p className="text-sm text-muted-fg">None detected.</p>
          ) : (
            <Table dense headers={["Technology", "Type"]} rows={techs.map(([t, ty]) => [t, <Pill key="t">{ty}</Pill>])} />
          )}
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">DNS + mail authentication</h3>
          <Table
            dense
            headers={["Record", "Value"]}
            rows={[
              ["Server IP", net.serverIp ?? "—"],
              ["DNS Servers", net.dnsServers.length > 0 ? <span key="ns" className="break-all font-mono text-xs">{net.dnsServers.join(", ")}</span> : "—"],
              ["SPF", net.spf.present ? <span key="spf" className="break-all font-mono text-xs">{net.spf.records[0]}</span> : <Pill tone="bad">missing</Pill>],
              ["DMARC", net.dmarc.present ? <span key="d" className="break-all font-mono text-xs">{net.dmarc.records[0]}</span> : <Pill tone="bad">missing</Pill>],
            ]}
          />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Security headers</h3>
          <Table
            dense
            headers={["Header", "Value"]}
            rows={[
              ["HTTPS", sec.https ? <Pill key="h" tone="good">yes</Pill> : <Pill key="h" tone="bad">no</Pill>],
              ["HSTS", sec.hsts ? <Pill key="hs" tone="good">yes</Pill> : <Pill key="hs" tone="warn">no</Pill>],
              ["CSP", sec.csp ? <Pill key="csp" tone="good">yes</Pill> : <Pill key="csp" tone="neutral">no</Pill>],
              ["X-Frame-Options", sec.xFrameOptions ?? "—"],
              ["X-Content-Type-Options", sec.xContentTypeOptions ?? "—"],
              ["Referrer-Policy", sec.referrerPolicy ?? "—"],
              ["Permissions-Policy", sec.permissionsPolicy ?? "—"],
            ]}
          />
        </Card>
      </div>
    </Section>
  );
}

function SitemapSection({ report }: { report: AuditReport }) {
  const sm = report.signals.sitemap;
  if (!sm) return null;
  return (
    <Section id="sitemap" title="Sitemap" subtitle={`${sm.stats.totalUrls.toLocaleString()} URLs across ${sm.fetched.length} sitemap file(s)`}>
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total URLs" value={sm.stats.totalUrls} />
          <Stat label="With lastmod" value={sm.stats.withLastmod} />
          <Stat label="With images" value={sm.stats.withImages} />
          <Stat label="Hreflang URLs" value={sm.stats.withHreflang} />
        </div>
        {sm.urls.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Sample URLs</div>
            <Table
              dense
              headers={["URL", "Last modified"]}
              rows={sm.urls.slice(0, 15).map((u) => [
                <a key="u" href={u.loc} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline dark:text-blue-400">
                  {pathOf(u.loc)}
                </a>,
                u.lastmod ?? "—",
              ])}
            />
          </div>
        )}
      </Card>
    </Section>
  );
}

function RawSection({ report }: { report: AuditReport }) {
  return (
    <Section id="raw" title="Raw report (JSON)" subtitle="Everything the API returned — useful for piping into your own tools">
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-fg">The same payload is available at <code className="font-mono">/api/v1/seo-audit</code>.</span>
          <CopyButton text={JSON.stringify(report, null, 2)} />
        </div>
        <pre className="code-block max-h-96 overflow-auto text-xs">{JSON.stringify(report, null, 2)}</pre>
      </Card>
    </Section>
  );
}

// ── plumbing ────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

// silence unused-import warning when this is bundled — `useMemo` was
// considered but we don't need it; remove if lint complains.
void useMemo;
