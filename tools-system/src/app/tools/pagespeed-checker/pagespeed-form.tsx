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
  const [url, setUrl] = useState("");
  // The device that controls which set of results + which mockup is shown.
  const [device, setDevice] = useState<Device>("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    mobile: PageSpeedResult | null;
    desktop: PageSpeedResult | null;
  }>({ mobile: null, desktop: null });
  // The URL used for the live preview iframe — only updates when the user
  // actually submits, so typing doesn't cause the iframe to reload on every
  // keystroke.
  const [previewUrl, setPreviewUrl] = useState<string>("https://blogy.in");

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const activeResult = results[device];
  // NOTE: we deliberately don't pipe result.screenshot (Lighthouse final-shot)
  // into the mockup. Lighthouse captures the *final* rendered state which is
  // often a popup, cookie banner, or modal that fired during the audit — not
  // a clean hero. The mshots/thum.io top-fold capture is more reliable for
  // the preview. The full Lighthouse screenshot still shows in ScreenshotCard.

  useEffect(() => {
    if (activeResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Only auto-scroll on first arrival of either result, not on every device toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.mobile, results.desktop]);

  async function runOne(target: string, s: Strategy): Promise<PageSpeedResult | null> {
    const res = await fetch("/api/v1/pagespeed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: target, strategy: s }),
    });
    const json = (await res.json()) as ApiResp;
    if (!json.ok) throw new Error(json.error.message);
    return json.data.result;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Fall back to the placeholder host so an empty submit still demos the tool.
    const target = normaliseUrl(url || "blogy.in");
    if (!target) return;
    setError(null);
    setResults({ mobile: null, desktop: null });
    setPreviewUrl(target);
    setLoading(true);
    try {
      const [mobile, desktop] = await Promise.all([
        runOne(target, "mobile").catch((err) => {
          throw err instanceof Error ? err : new Error("Mobile audit failed");
        }),
        runOne(target, "desktop").catch((err) => {
          throw err instanceof Error ? err : new Error("Desktop audit failed");
        }),
      ]);
      setResults({ mobile, desktop });
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
        device={device}
        setDevice={setDevice}
        previewUrl={previewUrl}
        loading={loading}
        error={error}
        onSubmit={onSubmit}
      />

      {loading && !activeResult && (
        <div
          ref={resultsRef}
          className="container w-full min-w-0 overflow-x-hidden py-16"
        >
          <AuditLoader />
        </div>
      )}

      {activeResult && (
        <div
          ref={resultsRef}
          className="container w-full min-w-0 overflow-x-hidden py-10"
        >
          <Dashboard result={activeResult} />
        </div>
      )}
    </div>
  );
}

// ── Audit loader (shown while waiting 20-30s for PSI) ───────────────────────

function AuditLoader() {
  // PSI doesn't expose real progress — fake a believable curve that creeps
  // toward 95% over ~25s and never quite finishes (state flips to results
  // when the request returns).
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      // Asymptotic approach to 95% — fast early, slows down later.
      const next = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / 9))));
      setPct(next);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const radius = 32;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-app bg-card px-6 py-14 text-center shadow-sm">
      <div className="relative h-20 w-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          {/* Track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgb(var(--border))"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress arc (accent) */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgb(var(--accent))"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 200ms linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-semibold tabular-nums text-accent">
            {pct}%
          </span>
        </div>
      </div>
      <div>
        <div className="text-base font-semibold">Auditing your site…</div>
        <p className="mt-1 text-sm text-muted-fg">
          Running real Google PageSpeed Insights — mobile + desktop in parallel.
          Average run ≈ 20–30 seconds.
        </p>
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero({
  url,
  setUrl,
  device,
  setDevice,
  previewUrl,
  loading,
  error,
  onSubmit,
}: {
  url: string;
  setUrl: (v: string) => void;
  device: Device;
  setDevice: (d: Device) => void;
  previewUrl: string;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <section className="border-b border-app bg-gradient-to-b from-[rgb(var(--muted))] to-transparent">
      <div className="container w-full min-w-0 overflow-x-hidden py-12 lg:py-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-fg">
          <Link href="/tools" className="hover:text-fg">
            Tools
          </Link>
          <span>/</span>
          <span className="text-fg">PageSpeed Checker</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12">
          {/* Left: heading + form */}
          <div>
            <Badge tone="accent">Performance · Core Web Vitals</Badge>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              See exactly why
              <br />
              your site feels slow.
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
                    placeholder="blogy.in"
                    className="h-11 w-full bg-transparent text-sm focus:outline-none"
                    inputMode="url"
                    autoComplete="url"
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Auditing…" : "Run audit"}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-fg">
                <span>Average run ≈ 20–30s · runs both mobile + desktop.</span>
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

// Screenshot service chain. Many sites (billingbee.co, cwstechnology.com,
// anything behind Cloudflare bot-protection) defeat one provider but not the
// next. We try them in order via <img onError> fallback, and we also auto-
// advance after a timeout because mshots returns a 200 "Generating preview…"
// placeholder while it queues the real shot — that never triggers onError.
//
// 1. thum.io (no-key proxy, fast, renders headless Chrome immediately)
// 2. mshots (WordPress.com, free, but can be slow on first hit)
// 3. favicon + hostname placeholder
//
// We pass a viewport hint so each provider captures the device-shaped top
// fold only (hero section), not the entire page rendered tiny.
function shotUrls(url: string, viewport: { w: number; h: number }): string[] {
  if (!url) return [];
  const clean = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return [
    // mshots first — gives a clean top-of-page render at the exact w×h we
    // ask for, no zoom weirdness. h param is what crops to the hero fold.
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent("https://" + clean)}?w=${viewport.w}&h=${viewport.h}`,
    // thum.io fallback — works for some sites mshots blocks (Cloudflare etc).
    `https://image.thum.io/get/viewport/${viewport.w}x${viewport.h}/crop/${viewport.h}/noanimate/wait/3/https://${clean}`,
  ];
}

function hostnameOf(url: string): string {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url.replace(/^https?:\/\//i, "").split("/")[0] || "";
  }
}

/**
 * Renders a top-fold screenshot of the URL through a chain of providers.
 * Falls back to a favicon + hostname card when every provider fails.
 */
function SiteShot({
  url,
  viewport,
}: {
  url: string;
  viewport: { w: number; h: number };
}) {
  const sources = useMemo(() => shotUrls(url, viewport), [url, viewport]);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Reset the chain whenever the URL changes.
  useEffect(() => {
    setIdx(0);
    setLoaded(false);
  }, [url]);

  // Watchdog — if the current provider hasn't loaded within 8s, advance.
  // Catches mshots' "Generating preview…" 200 placeholder.
  useEffect(() => {
    if (loaded) return;
    if (idx >= sources.length) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 8000);
    return () => clearTimeout(t);
  }, [idx, loaded, sources.length]);

  if (!url) return <VectorPlaceholder />;
  if (idx >= sources.length) return <FaviconPlaceholder url={url} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={sources[idx]}
      src={sources[idx]}
      alt="Live preview"
      className="block h-full w-full object-cover object-top"
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

function FaviconPlaceholder({ url }: { url: string }) {
  const host = hostnameOf(url);
  if (!host) return <VectorPlaceholder />;
  // Google's s2 favicon service is reliable and doesn't need an API key.
  const favicon = `https://www.google.com/s2/favicons?sz=128&domain=${host}`;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 text-center dark:from-zinc-900 dark:to-zinc-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={favicon}
        alt=""
        className="h-10 w-10 rounded-lg shadow-sm"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="text-[11px] font-medium leading-tight text-zinc-700 dark:text-zinc-300">
        {host}
      </div>
      <div className="text-[10px] leading-tight text-zinc-400">
        Live preview unavailable
      </div>
    </div>
  );
}

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
    <div className="w-full max-w-[560px]">
      {/* Phone + Laptop combo mockup. Matches the reference image —
          phone overlaps the laptop on the left side, both render the
          same live preview. */}
      <div className="relative flex items-end justify-center">
        <LaptopMockup url={url} scanning={scanning} />
        <div className="absolute -bottom-2 left-0 sm:left-2">
          <PhoneMockup url={url} scanning={scanning} />
        </div>
      </div>

      {/* Tab control — switches the dashboard results below. */}
      <div className="mx-auto mt-8 flex max-w-[260px] items-center justify-center gap-1 rounded-full border border-app bg-card p-1 text-xs">
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 font-medium transition",
            device === "mobile" ? "bg-accent text-white" : "text-muted-fg hover:text-fg",
          )}
        >
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 font-medium transition",
            device === "desktop" ? "bg-accent text-white" : "text-muted-fg hover:text-fg",
          )}
        >
          Desktop
        </button>
      </div>

      <div className="mt-2 text-center text-[11px] text-muted-fg">
        Live preview · {scanning ? "scanning…" : "idle"}
      </div>
    </div>
  );
}

function ScanningOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Bright horizontal scanning line — sweeps top → bottom → top.
          We animate `top` as a percentage of the parent so the line
          actually traverses the full container height (translateY % is
          relative to the element's own 3px height, which barely moves). */}
      <div className="psi-scan-line absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_24px_6px_rgb(var(--accent)/0.55)]" />
      {/* Subtle scanline pattern + tint, matches the seobility "scanning" feel. */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,70,255,0.06)_50%,transparent_50%)] bg-[length:100%_4px] mix-blend-overlay" />
      <style jsx>{`
        .psi-scan-line {
          top: 0;
          animation: psi-scan-sweep 2.6s ease-in-out infinite alternate;
        }
        @keyframes psi-scan-sweep {
          0%   { top: 0%; }
          100% { top: calc(100% - 3px); }
        }
      `}</style>
    </div>
  );
}

function VectorPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2 text-zinc-300">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 16l5-5 4 4 3-3 6 6" />
          <circle cx="9" cy="9" r="1.5" />
        </svg>
      </div>
    </div>
  );
}

function PhoneMockup({
  url,
  scanning,
}: {
  url: string;
  scanning: boolean;
}) {
  return (
    <div className="relative w-[170px] shrink-0 sm:w-[200px]">
      <div className="relative aspect-[9/19] rounded-[2rem] border-[5px] border-zinc-200 bg-zinc-100 p-1.5 shadow-[0_30px_80px_-25px_rgba(108,70,255,0.45)] dark:border-zinc-700 dark:bg-zinc-800">
        {/* Dynamic island / notch */}
        <div className="absolute left-1/2 top-2 z-10 h-3.5 w-14 -translate-x-1/2 rounded-full bg-zinc-900" />
        <div className="relative h-full w-full overflow-hidden rounded-[1.45rem] bg-white">
          {/* Mobile viewport — captures only the top fold (≈ hero section).
              Width/height matches the phone frame's 9:19 aspect so the image
              fits without object-cover cropping the wrong portion. */}
          <SiteShot url={url} viewport={{ w: 450, h: 950 }} />
          <ScanningOverlay active={scanning} />
        </div>
      </div>
    </div>
  );
}

function LaptopMockup({
  url,
  scanning,
}: {
  url: string;
  scanning: boolean;
}) {
  return (
    <div className="relative w-full max-w-[520px] shrink-0">
      {/* Lid — the actual screen. */}
      <div className="relative aspect-[16/10] rounded-[1.1rem] border-[10px] border-zinc-200 bg-zinc-100 p-0 shadow-[0_30px_80px_-25px_rgba(108,70,255,0.45)] dark:border-zinc-700 dark:bg-zinc-800">
        {/* Webcam dot */}
        <div className="absolute left-1/2 top-[3px] z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-500" />
        <div className="relative h-full w-full overflow-hidden rounded-[0.35rem] bg-white">
          {/* Desktop viewport — 16:10 hero fold, no full-page scroll */}
          <SiteShot url={url} viewport={{ w: 1280, h: 800 }} />
          <ScanningOverlay active={scanning} />
        </div>
      </div>
      {/* Base / hinge */}
      <div className="relative mx-auto -mt-[2px] h-[10px] w-[110%] -translate-x-[5%] rounded-b-[14px] bg-gradient-to-b from-zinc-300 to-zinc-200 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.15)] dark:from-zinc-700 dark:to-zinc-800">
        <div className="absolute left-1/2 top-0 h-[3px] w-[70px] -translate-x-1/2 rounded-b-md bg-zinc-300/90 dark:bg-zinc-900" />
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
  const available = result.field.available;
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
          {available ? `Assessment: ${result.field.coreWebVitalsAssessment}` : "Not enough traffic"}
        </Badge>
      </div>
      {!available && (
        <p className="mb-3 rounded-md border border-app bg-muted/40 p-3 text-xs text-muted-fg">
          Google's CrUX dataset only has field data for sites with enough real-user traffic.
          This site doesn't qualify yet — use the <strong>Lab metrics</strong> below instead, they
          come from a fresh Lighthouse run and are accurate for any URL.
        </p>
      )}
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
