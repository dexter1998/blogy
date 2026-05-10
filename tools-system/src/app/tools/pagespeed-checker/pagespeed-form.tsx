"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import type {
  AuditEntry,
  CoreWebVital,
  PageSpeedResult,
} from "@/scrapers/pagespeed/types";

type ApiResp =
  | { ok: true; data: { result: PageSpeedResult }; meta: { durationMs: number } }
  | { ok: false; error: { message: string } };

type Strategy = "mobile" | "desktop";
type Device = Strategy;

function tone(s: number): "good" | "warn" | "bad" | "neutral" {
  if (s >= 90) return "good";
  if (s >= 50) return "warn";
  return "bad";
}

function cwvTone(c: CoreWebVital["category"]): "good" | "warn" | "bad" | "neutral" {
  if (c === "good") return "good";
  if (c === "needs-improvement") return "warn";
  if (c === "poor") return "bad";
  return "neutral";
}

function normaliseUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

// ────────────────────────────────────────────────────────────────────────────

export function PageSpeedTool() {
  const [url, setUrl] = useState("blogy.in");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  // The device that the mockup renders as. Defaults to follow the strategy
  // but the user can flip it to preview either form-factor.
  const [device, setDevice] = useState<Device>("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  // The URL used for the live preview iframe — only updates when the user
  // actually submits, so typing doesn't cause the iframe to reload on every
  // keystroke.
  const [previewUrl, setPreviewUrl] = useState<string>("https://blogy.in");

  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = normaliseUrl(url);
    if (!target) return;
    setError(null);
    setResult(null);
    setPreviewUrl(target);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/pagespeed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target, strategy }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) setError(json.error.message);
      else setResult(json.data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Hero
        url={url}
        setUrl={setUrl}
        strategy={strategy}
        setStrategy={setStrategy}
        device={device}
        setDevice={setDevice}
        previewUrl={previewUrl}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
      />

      {result && (
        <div ref={resultsRef} className="container w-full max-w-full min-w-0 overflow-x-hidden py-10">
          <Dashboard result={result} />
        </div>
      )}
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero({
  url,
  setUrl,
  strategy,
  setStrategy,
  device,
  setDevice,
  previewUrl,
  loading,
  error,
  onSubmit,
}: {
  url: string;
  setUrl: (v: string) => void;
  strategy: Strategy;
  setStrategy: (s: Strategy) => void;
  device: Device;
  setDevice: (d: Device) => void;
  previewUrl: string;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <section className="border-b border-app bg-gradient-to-b from-[rgb(var(--muted))] to-transparent">
      <div className="container w-full max-w-full min-w-0 overflow-x-hidden py-12 lg:py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-fg">
          <Link href="/tools" className="hover:text-fg">
            Tools
          </Link>
          <span>/</span>
          <span className="text-fg">PageSpeed Checker</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          {/* Left: heading + form */}
          <div>
            <Badge tone="accent">Performance · Core Web Vitals</Badge>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              See exactly why your site feels slow.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-fg">
              Run a real Google PageSpeed Insights audit. CrUX field data,
              Lighthouse lab metrics, and every audit across Performance, SEO,
              Accessibility and Best-Practices — surfaced in one dashboard.
            </p>

            <form onSubmit={onSubmit} className="mt-8 max-w-xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-app bg-card p-2 shadow-sm sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 px-2">
                  <span className="text-muted-fg" aria-hidden>
                    🔗
                  </span>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL — e.g. blogy.in"
                    className="h-11 w-full bg-transparent text-sm focus:outline-none"
                    inputMode="url"
                    autoComplete="url"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as Strategy)}
                    className="h-10 rounded-lg border border-app bg-app px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    aria-label="Strategy"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                  <Button type="submit" size="lg" disabled={loading || !url.trim()}>
                    {loading ? "Auditing…" : "Run audit"}
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-fg">
                <span>Average run ≈ 20–30s.</span>
                <span className="hidden sm:inline">Powered by Google PSI v5.</span>
              </div>
              {error && (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Right: device mockup with scanning preview */}
          <div className="flex justify-center lg:justify-end">
            <DeviceScanner
              url={previewUrl}
              device={device}
              setDevice={setDevice}
              scanning={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Device Scanner ──────────────────────────────────────────────────────────

function DeviceScanner({
  url,
  device,
  setDevice,
  scanning,
}: {
  url: string;
  device: Device;
  setDevice: (d: Device) => void;
  scanning: boolean;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-3 flex items-center justify-center gap-1 rounded-full border border-app bg-card p-1 text-xs">
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition",
            device === "mobile" ? "bg-accent text-white" : "text-muted-fg hover:text-fg",
          )}
        >
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition",
            device === "desktop" ? "bg-accent text-white" : "text-muted-fg hover:text-fg",
          )}
        >
          Desktop
        </button>
      </div>

      {device === "mobile" ? (
        <PhoneMockup url={url} scanning={scanning} />
      ) : (
        <LaptopMockup url={url} scanning={scanning} />
      )}
    </div>
  );
}

function ScanningOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Bright horizontal scanning line, ping-pongs top↔bottom. */}
      <div className="absolute inset-x-0 h-[3px] -translate-y-1/2 animate-[psi-scan_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_24px_6px_rgb(var(--accent)/0.55)]" />
      {/* Subtle scanline pattern + tint, matches the seobility "scanning" feel. */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,70,255,0.06)_50%,transparent_50%)] bg-[length:100%_4px] mix-blend-overlay" />
      <style jsx>{`
        @keyframes psi-scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

function PhoneMockup({ url, scanning }: { url: string; scanning: boolean }) {
  return (
    <div className="mx-auto w-[280px]">
      <div className="relative aspect-[9/19] rounded-[2.4rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-[0_30px_80px_-20px_rgba(108,70,255,0.35)] dark:border-zinc-800">
        {/* Notch */}
        <div className="absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-zinc-900 dark:bg-zinc-950" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-white">
          <iframe
            src={url}
            title="Mobile preview"
            className="block h-full w-full border-0"
            // sandbox cannot be empty (would block everything) but we want a
            // safe-by-default preview. allow-scripts so JS-rendered pages
            // show, allow-same-origin so they fetch their own assets.
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <ScanningOverlay active={scanning} />
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-muted-fg">
        Live preview · {scanning ? "scanning…" : "idle"}
      </div>
    </div>
  );
}

function LaptopMockup({ url, scanning }: { url: string; scanning: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="relative rounded-t-xl border border-zinc-800 bg-zinc-900 p-2 shadow-[0_30px_80px_-20px_rgba(108,70,255,0.35)]">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
          <div className="ml-3 flex-1 truncate rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
            {url || "https://example.com"}
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white">
          <iframe
            src={url}
            title="Desktop preview"
            className="block h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <ScanningOverlay active={scanning} />
        </div>
      </div>
      {/* Laptop base */}
      <div className="mx-auto h-2 w-[110%] -translate-x-[5%] rounded-b-xl bg-zinc-800" />
      <div className="mx-auto h-1.5 w-[60%] rounded-b-xl bg-zinc-700/70" />
      <div className="mt-2 text-center text-[11px] text-muted-fg">
        Live preview · {scanning ? "scanning…" : "idle"}
      </div>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ result }: { result: PageSpeedResult }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-fg">Audited</div>
          <div className="mt-1 break-all text-base font-medium">{result.finalUrl}</div>
          <div className="mt-1 text-xs text-muted-fg">
            {result.strategy} · fetched {new Date(result.fetchedAt).toLocaleString()} · source {result.source}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={result.field.available ? "good" : "neutral"}>
            {result.field.available ? "CrUX field data available" : "No CrUX data"}
          </Badge>
          <Badge tone="accent">{result.strategy}</Badge>
        </div>
      </div>

      <CategoryRings categories={result.categories} cwv={result.scores.cwv} />

      <FieldDataCard result={result} />

      <LabMetricsCard result={result} />

      {result.lab.opportunities.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Top opportunities
          </h3>
          <ul className="space-y-2">
            {result.lab.opportunities.map((o) => (
              <li key={o.id} className="border-b border-app pb-2 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{o.title}</span>
                  <Badge tone="warn">~{(o.savingsMs / 1000).toFixed(1)}s</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-fg">{o.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.lab.diagnostics.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Diagnostics
          </h3>
          <ul className="space-y-2">
            {result.lab.diagnostics.map((d) => (
              <li key={d.id} className="border-b border-app pb-2 text-sm last:border-0">
                <div className="font-semibold">{d.title}</div>
                <p className="mt-1 text-xs text-muted-fg">{d.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CategoryAuditList title="Performance audits" buckets={result.audits.performance} />
      <CategoryAuditList title="SEO audits" buckets={result.audits.seo} />
      <CategoryAuditList title="Accessibility audits" buckets={result.audits.accessibility} />
      <CategoryAuditList title="Best-Practices audits" buckets={result.audits.bestPractices} />

      <ScreenshotCard data={result.screenshot} />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Raw API response
          </h3>
          <CopyButton text={JSON.stringify(result, null, 2)} />
        </div>
        <pre className="code-block max-h-96 overflow-auto text-xs">
{JSON.stringify(result, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

// ── Category rings (Performance / SEO / Accessibility / Best-Practices) ─────

function CategoryRings({
  categories,
  cwv,
}: {
  categories: PageSpeedResult["categories"];
  cwv: number;
}) {
  const items: Array<{ label: string; value: number | null }> = [
    { label: "Performance", value: categories.performance },
    { label: "SEO", value: categories.seo },
    { label: "Accessibility", value: categories.accessibility },
    { label: "Best Practices", value: categories.bestPractices },
    { label: "CWV (Blogy)", value: cwv },
  ];
  return (
    <Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {items.map((it) => (
          <ScoreRing key={it.label} label={it.label} value={it.value} />
        ))}
      </div>
    </Card>
  );
}

function ScoreRing({ label, value }: { label: string; value: number | null }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;
  const color = v === null
    ? "rgb(var(--muted-fg))"
    : v >= 90
      ? "#10b981" // emerald
      : v >= 50
        ? "#f59e0b" // amber
        : "#ef4444"; // rose
  const radius = 36;
  const stroke = 6;
  const c = 2 * Math.PI * radius;
  const offset = v === null ? c : c * (1 - v / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[88px] w-[88px]">
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle
            cx="44"
            cy="44"
            r={radius}
            stroke="rgb(var(--border))"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 700ms ease, stroke 300ms" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold tabular-nums" style={{ color }}>
            {v === null ? "—" : v}
          </span>
        </div>
      </div>
      <div className="text-center text-xs font-medium text-muted-fg">{label}</div>
    </div>
  );
}

// ── Field data + Lab metrics cards ──────────────────────────────────────────

function FieldDataCard({ result }: { result: PageSpeedResult }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
          Field data (real users · CrUX)
        </h3>
        <Badge tone={
          result.field.coreWebVitalsAssessment === "PASS"
            ? "good"
            : result.field.coreWebVitalsAssessment === "FAIL"
              ? "bad"
              : "neutral"
        }>
          {result.field.available ? `Assessment: ${result.field.coreWebVitalsAssessment}` : "Unavailable"}
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {result.field.metrics.map((m) => (
          <Stat
            key={m.metric}
            label={m.metric}
            value={
              m.value === null
                ? "—"
                : m.unit === "ms"
                  ? `${m.value}ms`
                  : m.value.toFixed(3)
            }
            tone={cwvTone(m.category)}
            hint={m.category === "unknown" ? undefined : m.category}
          />
        ))}
      </div>
    </Card>
  );
}

function LabMetricsCard({ result }: { result: PageSpeedResult }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
        Lab metrics (Lighthouse)
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="LCP" value={result.lab.metrics.lcp ? `${result.lab.metrics.lcp}ms` : "—"} />
        <Stat label="FCP" value={result.lab.metrics.fcp ? `${result.lab.metrics.fcp}ms` : "—"} />
        <Stat label="CLS" value={result.lab.metrics.cls ?? "—"} />
        <Stat label="TBT" value={result.lab.metrics.tbt ? `${result.lab.metrics.tbt}ms` : "—"} />
        <Stat label="Speed Index" value={result.lab.metrics.si ? `${result.lab.metrics.si}ms` : "—"} />
        <Stat label="TTI" value={result.lab.metrics.tti ? `${result.lab.metrics.tti}ms` : "—"} />
      </div>
    </Card>
  );
}

// ── Per-category audit list ─────────────────────────────────────────────────

function CategoryAuditList({
  title,
  buckets,
}: {
  title: string;
  buckets: PageSpeedResult["audits"]["performance"];
}) {
  const total = buckets.failing.length + buckets.passed.length + buckets.manual.length + buckets.notApplicable.length;
  if (total === 0) return null;
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">{title}</h3>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <Badge tone="bad">{buckets.failing.length} failing</Badge>
          <Badge tone="good">{buckets.passed.length} passed</Badge>
          {buckets.manual.length > 0 && <Badge tone="warn">{buckets.manual.length} manual</Badge>}
          {buckets.notApplicable.length > 0 && <Badge>{buckets.notApplicable.length} N/A</Badge>}
        </div>
      </div>

      {buckets.failing.length > 0 && (
        <AuditGroup label="Failing" items={buckets.failing} status="bad" defaultOpen />
      )}
      {buckets.manual.length > 0 && (
        <AuditGroup label="Items to manually check" items={buckets.manual} status="warn" />
      )}
      {buckets.passed.length > 0 && (
        <AuditGroup label="Passed audits" items={buckets.passed} status="good" />
      )}
      {buckets.notApplicable.length > 0 && (
        <AuditGroup label="Not applicable" items={buckets.notApplicable} status="neutral" />
      )}
    </Card>
  );
}

function AuditGroup({
  label,
  items,
  status,
  defaultOpen = false,
}: {
  label: string;
  items: AuditEntry[];
  status: "good" | "warn" | "bad" | "neutral";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dotColor = useMemo(() => {
    switch (status) {
      case "good": return "bg-emerald-500";
      case "warn": return "bg-amber-500";
      case "bad": return "bg-rose-500";
      default: return "bg-zinc-400";
    }
  }, [status]);

  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-app">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center gap-3 bg-card px-3 py-2 text-left text-sm hover:bg-muted/40"
      >
        <span className={cn("inline-block h-2 w-2 rounded-full", dotColor)} />
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-fg">· {items.length}</span>
        <span className="ml-auto text-muted-fg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="divide-y divide-app border-t border-app">
          {items.map((a) => (
            <li key={a.id} className="px-3 py-2.5 text-sm">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium">{a.title}</span>
                {a.displayValue && (
                  <span className="text-xs text-muted-fg">{a.displayValue}</span>
                )}
                {typeof a.savingsMs === "number" && a.savingsMs >= 100 && (
                  <Badge tone="warn">~{(a.savingsMs / 1000).toFixed(1)}s</Badge>
                )}
              </div>
              {a.description && (
                <p
                  className="mt-1 text-xs text-muted-fg [&_a]:text-accent [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml(a.description) }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Lighthouse audit descriptions are markdown-flavoured with `[text](url)` links
// and `code` spans. Render them safely as a small subset of HTML.
function descriptionHtml(s: string): string {
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// ── Screenshot ──────────────────────────────────────────────────────────────

function ScreenshotCard({ data }: { data: string }) {
  if (!data) return null;
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-fg">
        Final Lighthouse screenshot
      </h3>
      <div className="overflow-hidden rounded-lg border border-app bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data} alt="Lighthouse final screenshot" className="block w-full" />
      </div>
    </Card>
  );
}

// silence unused import warnings if any helper drops its usage during edits
void (null as ReactNode);
