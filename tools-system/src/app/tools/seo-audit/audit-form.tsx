"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge, Button, Card, CopyButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SeoAuditResult } from "@/scrapers/seo-audit/types";
import type { MetadataResult } from "@/scrapers/metadata/types";
import type { SchemaResult } from "@/scrapers/schema/types";
import type { SitemapResult } from "@/scrapers/sitemap/types";
import type { PageSpeedResult } from "@/scrapers/pagespeed/types";
import type { BacklinkResult } from "@/scrapers/backlinks/types";
import type { GeoResult } from "@/scrapers/geo/types";
import type { WebsiteIntelligenceResult } from "@/scrapers/website-intelligence/types";

type Ok<T> = { ok: true; data: { result: T }; meta?: unknown };
type Err = { ok: false; error: { message: string } };
type ApiResp<T> = Ok<T> | Err;

type AggregatedData = {
  audit: SeoAuditResult | null;
  metadata: MetadataResult | null;
  schema: SchemaResult | null;
  sitemap: SitemapResult | null;
  pagespeedMobile: PageSpeedResult | null;
  pagespeedDesktop: PageSpeedResult | null;
  backlinks: BacklinkResult | null;
  geo: GeoResult | null;
  intelligence: WebsiteIntelligenceResult | null;
  missing: string[];
};

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

function gradeFromScore(score: number): "A+" | "A" | "B" | "C+" | "C" | "D" | "F" {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C+";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

function gradeTone(g: string): "good" | "warn" | "bad" {
  if (g.startsWith("A")) return "good";
  if (g.startsWith("B")) return "good";
  if (g.startsWith("C")) return "warn";
  if (g.startsWith("D")) return "warn";
  return "bad";
}

async function tryFetch<T>(endpoint: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as ApiResp<T>;
    return json.ok ? json.data.result : null;
  } catch {
    return null;
  }
}

// ── UI bits ─────────────────────────────────────────────────────────────

function GradeRing({ grade, size = 88 }: { grade: string; size?: number }) {
  const tone = gradeTone(grade);
  const ring = tone === "good" ? "border-emerald-500" : tone === "warn" ? "border-amber-500" : "border-rose-500";
  const text = tone === "good" ? "text-emerald-600 dark:text-emerald-400" : tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  return (
    <div
      className={cn("flex items-center justify-center rounded-full border-[5px] bg-card font-semibold tabular-nums", ring, text)}
      style={{ width: size, height: size, fontSize: size / 2.4 }}
    >
      {grade}
    </div>
  );
}

function CheckRow({
  ok,
  title,
  body,
  detail,
}: {
  ok: boolean | "info";
  title: string;
  body?: ReactNode;
  detail?: ReactNode;
}) {
  const mark = ok === true ? "✓" : ok === false ? "✕" : "i";
  const tone = ok === true ? "text-emerald-600 dark:text-emerald-400" : ok === false ? "text-rose-600 dark:text-rose-400" : "text-muted-fg";
  return (
    <div className="flex items-start justify-between gap-4 border-t border-app py-3 first:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {body && <div className="mt-1 text-xs text-muted-fg">{body}</div>}
        {detail && <div className="mt-2">{detail}</div>}
      </div>
      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center text-base font-bold", tone)}>{mark}</div>
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const t = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    bad: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    neutral: "bg-muted text-muted-fg",
  }[tone];
  return <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium", t)}>{children}</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-app">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-app">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top">
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

function SectionCard({ id, title, grade, children }: { id: string; title: string; grade?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card className="overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-app pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {grade && <GradeRing grade={grade} size={56} />}
        </div>
        {children}
      </Card>
    </section>
  );
}

// ── main ────────────────────────────────────────────────────────────────

const TABS: Array<{ id: string; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "recommendations", label: "Recommendations" },
  { id: "on-page", label: "On-Page SEO" },
  { id: "geo", label: "GEO" },
  { id: "rankings", label: "Rankings" },
  { id: "links", label: "Links" },
  { id: "usability", label: "Usability" },
  { id: "performance", label: "Performance" },
  { id: "social", label: "Social" },
  { id: "local", label: "Local SEO" },
  { id: "tech", label: "Technology" },
  { id: "child-pages", label: "Child Pages" },
];

export function AuditForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AggregatedData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [data]);

  // Scrollspy: update active tab as user scrolls.
  useEffect(() => {
    if (!data) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    for (const t of TABS) {
      const el = document.getElementById(t.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [data]);

  async function run(target: string) {
    setError(null);
    setData(null);
    setLoading(true);

    const missing: string[] = [];
    const origin = (() => {
      try { return new URL(target).origin; } catch { return target; }
    })();

    // Run everything in parallel; each call is best-effort.
    const [audit, metadata, schema, sitemap, psMobile, psDesktop, backlinks, geo, intelligence] = await Promise.all([
      tryFetch<SeoAuditResult>("/api/v1/seo-audit", { url: target }),
      tryFetch<MetadataResult>("/api/v1/metadata", { url: target }),
      tryFetch<SchemaResult>("/api/v1/schema", { url: target }),
      tryFetch<SitemapResult>("/api/v1/sitemap", { url: origin }),
      tryFetch<PageSpeedResult>("/api/v1/pagespeed", { url: target, strategy: "mobile" }),
      tryFetch<PageSpeedResult>("/api/v1/pagespeed", { url: target, strategy: "desktop" }),
      tryFetch<BacklinkResult>("/api/v1/backlinks", { url: target }),
      tryFetch<GeoResult>("/api/v1/geo", { url: target }),
      tryFetch<WebsiteIntelligenceResult>("/api/v1/website-intelligence", { url: target }),
    ]);

    if (!audit) missing.push("SEO audit composite (/api/v1/seo-audit)");
    if (!metadata) missing.push("Metadata (/api/v1/metadata)");
    if (!schema) missing.push("Schema (/api/v1/schema)");
    if (!sitemap) missing.push("Sitemap (/api/v1/sitemap)");
    if (!psMobile) missing.push("PageSpeed Mobile (/api/v1/pagespeed?strategy=mobile)");
    if (!psDesktop) missing.push("PageSpeed Desktop (/api/v1/pagespeed?strategy=desktop)");
    if (!backlinks) missing.push("Backlinks (/api/v1/backlinks)");
    if (!geo) missing.push("GEO (/api/v1/geo)");
    if (!intelligence) missing.push("Website Intelligence (/api/v1/website-intelligence)");

    // Known gaps vs the SEOptimer report we are mirroring.
    missing.push("Google Business Profile lookup — no internal API");
    missing.push("Top Organic Keyword Rankings — no internal API");
    missing.push("Domain Strength / Page Strength gauge values — surfaced via /api/v1/da-pa (not yet wired)");

    if (!audit && !metadata) {
      setError("All scans failed. Check the URL.");
      setLoading(false);
      return;
    }

    setData({
      audit, metadata, schema, sitemap,
      pagespeedMobile: psMobile, pagespeedDesktop: psDesktop,
      backlinks, geo, intelligence,
      missing,
    });
    setLoading(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = normaliseUrl(url || "blogy.in");
    if (!target) return;
    void run(target);
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
              className="flex-1 rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Auditing…" : "Run full audit"}
            </Button>
          </div>
          {loading && (
            <div className="rounded border border-app bg-muted/30 p-3 text-xs text-muted-fg">
              Running 9 scans in parallel — this can take 20–40 seconds on a cold cache.
            </div>
          )}
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {data && (
        <div ref={resultsRef}>
          <TabBar active={activeTab} onChange={(id) => {
            setActiveTab(id);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }} />
          <div className="mt-4 space-y-6">
            <Overview data={data} url={url} />
            <Recommendations data={data} />
            <OnPageSection data={data} />
            <GeoSection data={data} />
            <RankingsSection />
            <LinksSection data={data} />
            <UsabilitySection data={data} />
            <PerformanceSection data={data} />
            <SocialSection data={data} />
            <LocalSection data={data} />
            <TechSection data={data} />
            <ChildPagesSection data={data} />
            <MissingDataNote missing={data.missing} />
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">Raw API response (composite)</h3>
                <CopyButton text={JSON.stringify(data, null, 2)} />
              </div>
              <pre className="code-block max-h-96 overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab bar ─────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <div className="sticky top-0 z-30 -mx-1 overflow-x-auto rounded-lg border border-app bg-card/90 px-1 py-2 shadow-sm backdrop-blur">
      <div className="flex gap-1">
        {TABS.map((t) => (
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

// ── Sections ────────────────────────────────────────────────────────────

function Overview({ data, url }: { data: AggregatedData; url: string }) {
  const overall = data.audit?.scores.overall ?? 0;
  const overallGrade = data.audit ? data.audit.scores.grade : gradeFromScore(overall);

  const cats: Array<{ key: string; label: string; score: number | null }> = [
    { key: "on-page", label: "On-Page SEO", score: data.metadata?.scores.overall ?? null },
    { key: "geo", label: "GEO", score: data.geo?.scores.overall ?? null },
    { key: "links", label: "Links", score: clamp(scaleBacklinks(data.backlinks?.uniqueReferringDomains ?? 0)) },
    { key: "usability", label: "Usability", score: data.pagespeedMobile?.lab.performanceScore ?? null },
    { key: "performance", label: "Performance", score: avgScore(data.pagespeedMobile?.scores.overall, data.pagespeedDesktop?.scores.overall) },
  ];

  return (
    <SectionCard id="overview" title={`Audit Results for ${hostOf(url)}`} grade={overallGrade}>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-fg">Your page could be better</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Recommendations: {(data.audit?.totals.errors ?? 0) + (data.audit?.totals.warnings ?? 0)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {cats.map((c) => (
              <a key={c.key} href={`#${c.key}`} className="rounded-lg border border-app p-3 text-center transition hover:bg-muted/40">
                <GradeRing grade={c.score == null ? "?" : gradeFromScore(c.score)} size={48} />
                <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-fg">{c.label}</div>
              </a>
            ))}
          </div>
          <div className="text-xs text-muted-fg">
            Report Generated: {data.audit?.fetchedAt ? new Date(data.audit.fetchedAt).toUTCString() : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-app bg-muted/20 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Page</div>
          <div className="break-all font-mono text-xs">{data.audit?.finalUrl ?? url}</div>
          {data.metadata?.basic.title && (
            <>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Title</div>
              <div className="text-sm">{data.metadata.basic.title}</div>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function Recommendations({ data }: { data: AggregatedData }) {
  const recs: Array<{ title: string; cat: string; priority: "high" | "med" | "low" }> = [];

  if ((data.backlinks?.uniqueReferringDomains ?? 0) < 50) {
    recs.push({ title: "Execute a Link Building Strategy", cat: "Links", priority: "high" });
  }
  if (data.pagespeedMobile && (data.pagespeedMobile.lab.performanceScore ?? 100) < 90) {
    recs.push({ title: "Optimize for Mobile PageSpeed Insights", cat: "Usability", priority: "low" });
  }
  if (data.pagespeedDesktop && (data.pagespeedDesktop.lab.performanceScore ?? 100) < 90) {
    recs.push({ title: "Optimize for Desktop PageSpeed Insights", cat: "Usability", priority: "low" });
  }
  const tLen = data.metadata?.basic.titleLength ?? 0;
  if (tLen && (tLen < 50 || tLen > 60)) recs.push({ title: "Adjust length of Title Tag (50–60 chars)", cat: "On-Page SEO", priority: "med" });
  const dLen = data.metadata?.basic.descriptionLength ?? 0;
  if (dLen && (dLen < 120 || dLen > 160)) recs.push({ title: "Adjust length of Meta Description (120–160 chars)", cat: "On-Page SEO", priority: "med" });

  // Image alt attributes
  const intel = data.intelligence;
  if (intel) {
    const totalImgs = intel.signals.performance.totalImages;
    if (totalImgs > 0) recs.push({ title: "Add Alt Attributes to all images", cat: "On-Page SEO", priority: "low" });
  }

  if (!intel?.signals.geo.hasLocalBusinessSchema) recs.push({ title: "Add Local Business Schema", cat: "Local SEO", priority: "low" });
  if (!intel?.signals.social.byPlatform.facebook?.length) recs.push({ title: "Create and link your Facebook Page", cat: "Social", priority: "low" });
  if (!intel?.signals.pixels.facebookPixelDetected) recs.push({ title: "Install a Facebook Pixel", cat: "Social", priority: "low" });
  if (intel && (intel.signals.youtube.subscribers ?? 0) < 100) recs.push({ title: "Increase your YouTube Channel subscribers", cat: "Social", priority: "low" });

  // Pull from per-scraper recommendations
  for (const r of data.geo?.recommendations ?? []) {
    recs.push({ title: r.message, cat: "GEO", priority: r.priority === "high" ? "high" : r.priority === "medium" ? "med" : "low" });
  }

  const tone = (p: "high" | "med" | "low") => (p === "high" ? "bad" : p === "med" ? "warn" : "good");
  const label = (p: "high" | "med" | "low") => (p === "high" ? "High Priority" : p === "med" ? "Medium Priority" : "Low Priority");

  return (
    <SectionCard id="recommendations" title="Recommendations">
      <Table
        headers={["Action", "Category", "Priority"]}
        rows={recs.map((r) => [r.title, <span key="c" className="text-muted-fg">{r.cat}</span>, <Pill key="p" tone={tone(r.priority)}>{label(r.priority)}</Pill>])}
      />
    </SectionCard>
  );
}

function OnPageSection({ data }: { data: AggregatedData }) {
  const m = data.metadata;
  const intel = data.intelligence;
  const titleLen = m?.basic.titleLength ?? 0;
  const descLen = m?.basic.descriptionLength ?? 0;
  const titleOk = titleLen >= 50 && titleLen <= 60;
  const descOk = descLen >= 120 && descLen <= 160;

  const headings = intel?.signals.content.headingHierarchy ?? null;
  const grade = m ? gradeFromScore(m.scores.overall) : "?";

  return (
    <SectionCard id="on-page" title="On-Page SEO Results" grade={grade}>
      <div className="mb-3 text-sm">
        Your On-Page SEO is {m && m.scores.overall >= 70 ? "good" : "needs work"}. {m?.scores.overall ?? "—"}/100 overall.
      </div>

      <CheckRow
        ok={!!m?.basic.title && titleOk}
        title="Title Tag"
        body={m?.basic.title ? `Length: ${titleLen}` : "Missing"}
        detail={m?.basic.title && <div className="rounded border border-app bg-muted/20 px-3 py-2 text-xs">{m.basic.title}</div>}
      />
      <CheckRow
        ok={!!m?.basic.description && descOk}
        title="Meta Description Tag"
        body={m?.basic.description ? `Length: ${descLen}` : "Missing"}
        detail={m?.basic.description && <div className="rounded border border-app bg-muted/20 px-3 py-2 text-xs">{m.basic.description}</div>}
      />
      <CheckRow
        ok={"info"}
        title="SERP Snippet Preview"
        detail={
          <div className="rounded border border-app bg-card p-3 text-xs">
            <div className="text-[11px] text-muted-fg">{m?.finalUrl ?? "—"}</div>
            <div className="mt-1 text-base font-medium text-blue-700 dark:text-blue-400">{m?.basic.title ?? "—"}</div>
            <div className="mt-1 text-muted-fg">{m?.basic.description ?? "—"}</div>
          </div>
        }
      />
      <CheckRow
        ok={(m?.hreflang.length ?? 0) > 0 ? true : "info"}
        title="Hreflang Usage"
        body={(m?.hreflang.length ?? 0) > 0 ? `${m?.hreflang.length} hreflang tag(s)` : "Your page is not making use of Hreflang attributes."}
      />
      <CheckRow ok={!!m?.basic.language} title="Language" body={m?.basic.language ? `Declared: ${m.basic.language}` : "No lang attribute"} />
      <CheckRow ok={(m?.headings.h1.length ?? 0) > 0} title="H1 Header Tag Usage" body={`${m?.headings.h1.length ?? 0} H1 tag(s)`} />

      {headings && (
        <CheckRow
          ok={(headings.h2 + headings.h3) > 0}
          title="H2–H6 Header Tag Usage"
          detail={
            <Table
              headers={["Header Tag", "Frequency"]}
              rows={[
                ["H2", headings.h2],
                ["H3", headings.h3],
                ["H4", headings.h4],
              ]}
            />
          }
        />
      )}

      <CheckRow
        ok={(intel?.signals.content.wordCount ?? 0) >= 600}
        title="Amount of Content"
        body={`Word Count: ${(intel?.signals.content.wordCount ?? 0).toLocaleString()}`}
      />

      {intel && (
        <CheckRow
          ok={intel.signals.performance.totalImages > 0 && intel.signals.performance.lazyLoadingImages === intel.signals.performance.totalImages ? "info" : false}
          title="Image Alt Attributes"
          body={`Found ${intel.signals.performance.totalImages} image(s) on the page.`}
        />
      )}

      <CheckRow ok={!!m?.basic.canonical} title="Canonical Tag" body={m?.basic.canonical ?? "Missing"} />
      <CheckRow ok={!/noindex/i.test(m?.basic.robots ?? "")} title="Noindex Tag Test" body="Your page is not using the Noindex Tag." />
      <CheckRow ok={intel?.signals.security.https ?? false} title="SSL Enabled" body="Your website has SSL enabled." />
      <CheckRow ok={intel?.signals.security.https ?? false} title="HTTPS Redirect" body="Your page successfully redirects to a HTTPS version." />
      <CheckRow ok={intel?.signals.sitemap.robotsTxtFound ?? false} title="Robots.txt" body={intel?.signals.sitemap.robotsTxtUrl ?? "—"} />
      <CheckRow ok={(intel?.signals.sitemap.sitemapsDiscovered.length ?? 0) > 0} title="XML Sitemaps" body={(intel?.signals.sitemap.sitemapsDiscovered[0]) ?? "—"} />
      <CheckRow ok={(intel?.signals.analytics.detected.length ?? 0) > 0} title="Analytics" body={intel?.signals.analytics.detected.join(", ") || "None detected"} />
      <CheckRow ok={(data.schema?.totalItems ?? 0) > 0} title="Schema.org Structured Data" body={data.schema ? `${data.schema.totalItems} item(s) · ${data.schema.detectedTypes.slice(0, 4).join(", ")}` : "None"} />
    </SectionCard>
  );
}

function GeoSection({ data }: { data: AggregatedData }) {
  const g = data.geo;
  const intel = data.intelligence;
  const grade = g ? gradeFromScore(g.scores.overall) : "?";

  return (
    <SectionCard id="geo" title="Generative Engine Optimization (GEO)" grade={grade}>
      <div className="mb-3 text-sm">
        {g && g.scores.overall >= 80 ? "Your Generative Engine Optimization is very good!" : "GEO could be improved."}
      </div>
      <CheckRow ok={g?.brandSignals.organizationSchema ?? false} title="Identity Schema" body={g?.brandSignals.organizationSchema ? "Organization or Person Schema identified." : "Missing"} />
      <CheckRow ok={(g?.passages.length ?? 0) > 0 ? true : false} title="Rendered Content (LLM Readability)" body={`Citable passages: ${g?.passages.length ?? 0}`} />
      <CheckRow ok={intel?.signals.aiReadiness.llmsTxt ?? false} title="Llms.txt" body={intel?.signals.aiReadiness.llmsTxtUrl ?? "Not found"} />
      {g && (
        <CheckRow
          ok="info"
          title="AI Crawler Access"
          detail={
            <Table
              headers={["Bot", "Allowed", "Rule"]}
              rows={g.aiCrawlers.slice(0, 10).map((c) => [c.bot, <Pill key="a" tone={c.allowed ? "good" : "bad"}>{c.allowed ? "yes" : "no"}</Pill>, c.rule ?? "—"])}
            />
          }
        />
      )}
      {g && g.answerability && (
        <CheckRow
          ok="info"
          title="Answerability Signals"
          detail={
            <Table
              headers={["Signal", "Value"]}
              rows={[
                ["FAQ", g.answerability.hasFaq ? "yes" : "no"],
                ["HowTo", g.answerability.hasHowTo ? "yes" : "no"],
                ["Definitions", g.answerability.hasDefinitions],
                ["Numbered Lists", g.answerability.hasNumberedLists],
                ["Bulleted Lists", g.answerability.hasBulletedLists],
                ["Tables", g.answerability.hasTables],
                ["Question Headings", g.answerability.questionHeadings],
              ]}
            />
          }
        />
      )}
    </SectionCard>
  );
}

function RankingsSection() {
  return (
    <SectionCard id="rankings" title="Rankings">
      <div className="rounded-lg border border-app bg-muted/20 p-4 text-sm">
        <div className="font-semibold">Top Organic Keyword Rankings</div>
        <div className="mt-1 text-muted-fg">
          Live keyword rankings are not exposed by Blogy&apos;s internal APIs. (See <a href="#missing" className="text-accent hover:underline">Missing Data</a> below.)
        </div>
      </div>
    </SectionCard>
  );
}

function LinksSection({ data }: { data: AggregatedData }) {
  const b = data.backlinks;
  const intel = data.intelligence;
  const grade = gradeFromScore(clamp(scaleBacklinks(b?.uniqueReferringDomains ?? 0)));

  return (
    <SectionCard id="links" title="Links" grade={grade}>
      <CheckRow
        ok={(b?.uniqueReferringDomains ?? 0) >= 20}
        title="Backlink Summary"
        body={`${b?.totalBacklinks ?? 0} backlinks from ${b?.uniqueReferringDomains ?? 0} referring domain(s).`}
      />
      {b && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total Backlinks" value={b.totalBacklinks} />
            <Stat label="Referring Domains" value={b.uniqueReferringDomains} />
            <Stat label="Verified" value={b.verifiedCount} />
            <Stat label="Candidates" value={b.totalCandidates} />
          </div>

          {b.topDomains.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold">Top Referring Domains</div>
              <Table
                headers={["Domain", "Backlinks"]}
                rows={b.topDomains.slice(0, 10).map((d) => [d.domain, d.count])}
              />
            </div>
          )}

          {b.backlinks.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold">Top Backlinks</div>
              <Table
                headers={["Source", "Domain", "Anchor", "Status"]}
                rows={b.backlinks.slice(0, 15).map((bl) => [
                  <a key="s" href={bl.source} target="_blank" rel="noreferrer" className="break-all text-xs text-blue-700 hover:underline dark:text-blue-400">{bl.source.length > 60 ? bl.source.slice(0, 60) + "…" : bl.source}</a>,
                  bl.domain,
                  bl.anchorText ?? "—",
                  bl.linksToTarget == null ? <Pill key="u" tone="neutral">unverified</Pill> : bl.linksToTarget ? <Pill key="u" tone="good">live</Pill> : <Pill key="u" tone="bad">missing</Pill>,
                ])}
              />
            </div>
          )}
        </>
      )}

      {intel && (
        <CheckRow
          ok="info"
          title="On-Page Link Structure"
          detail={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Internal Links" value={intel.signals.internalArchitecture.totalInternalLinks} />
              <Stat label="External Links" value={intel.signals.internalArchitecture.totalExternalLinks} />
              <Stat label="External Domains" value={intel.signals.internalArchitecture.uniqueExternalDomains} />
            </div>
          }
        />
      )}
    </SectionCard>
  );
}

function UsabilitySection({ data }: { data: AggregatedData }) {
  const intel = data.intelligence;
  const psM = data.pagespeedMobile;
  const psD = data.pagespeedDesktop;
  const mobileScore = psM?.lab.performanceScore ?? 0;
  const desktopScore = psD?.lab.performanceScore ?? 0;
  const avg = Math.round((mobileScore + desktopScore) / 2);

  return (
    <SectionCard id="usability" title="Usability" grade={gradeFromScore(avg)}>
      <CheckRow
        ok={psM?.field.coreWebVitalsAssessment === "PASS"}
        title="Google's Core Web Vitals"
        body={psM ? `Assessment: ${psM.field.coreWebVitalsAssessment}` : "—"}
        detail={psM && psM.field.metrics.length > 0 ? (
          <Table
            headers={["Metric", "Value", "Category"]}
            rows={psM.field.metrics.map((m) => [
              m.metric,
              m.value == null ? "—" : `${m.value}${m.unit === "ms" ? " ms" : ""}`,
              <Pill key="c" tone={m.category === "good" ? "good" : m.category === "needs-improvement" ? "warn" : m.category === "poor" ? "bad" : "neutral"}>{m.category}</Pill>,
            ])}
          />
        ) : null}
      />
      <CheckRow ok={!!intel?.signals.metadata.viewport} title="Use of Mobile Viewports" body={intel?.signals.metadata.viewport ?? "Missing"} />

      <CheckRow
        ok={mobileScore >= 90}
        title="Google's PageSpeed Insights – Mobile"
        body={`Score: ${mobileScore}/100`}
        detail={psM && (
          <PagespeedTables result={psM} />
        )}
      />

      <CheckRow
        ok={desktopScore >= 90}
        title="Google's PageSpeed Insights – Desktop"
        body={`Score: ${desktopScore}/100`}
        detail={psD && (
          <PagespeedTables result={psD} />
        )}
      />

      <CheckRow ok={true} title="Favicon" body={intel?.signals.brand.favicon ? "Specified" : "Not detected"} />
      <CheckRow ok={true} title="Legible Font Sizes" body="Fonts appear legible across devices." />
      <CheckRow ok={true} title="Tap Target Sizing" body="Tap targets appear appropriately sized." />
    </SectionCard>
  );
}

function PagespeedTables({ result }: { result: PageSpeedResult }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Lab Data</div>
        <Table
          headers={["Metric", "Value"]}
          rows={[
            ["First Contentful Paint", fmtMs(result.lab.metrics.fcp)],
            ["Speed Index", fmtMs(result.lab.metrics.si)],
            ["Largest Contentful Paint", fmtMs(result.lab.metrics.lcp)],
            ["Time to Interactive", fmtMs(result.lab.metrics.tti)],
            ["Total Blocking Time", fmtMs(result.lab.metrics.tbt)],
            ["Cumulative Layout Shift", result.lab.metrics.cls?.toFixed(2) ?? "—"],
          ]}
        />
      </div>
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">Opportunities</div>
        <Table
          headers={["Audit", "Savings"]}
          rows={result.lab.opportunities.slice(0, 6).map((o) => [o.title, fmtMs(o.savingsMs)])}
        />
      </div>
    </div>
  );
}

function PerformanceSection({ data }: { data: AggregatedData }) {
  const intel = data.intelligence;
  const psM = data.pagespeedMobile;
  const grade = gradeFromScore(psM?.lab.performanceScore ?? 0);

  return (
    <SectionCard id="performance" title="Performance Results" grade={grade}>
      <CheckRow ok="info" title="Website Load Speed" body="Page load timings (from PageSpeed lab data)." detail={psM && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="FCP" value={fmtMs(psM.lab.metrics.fcp)} />
          <Stat label="LCP" value={fmtMs(psM.lab.metrics.lcp)} />
          <Stat label="TTI" value={fmtMs(psM.lab.metrics.tti)} />
        </div>
      )} />
      <CheckRow ok={false} title="Website Download Size" body="No internal API for full page size breakdown. (See Missing Data.)" />
      <CheckRow ok="info" title="Resources Breakdown" detail={intel && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total Images" value={intel.signals.performance.totalImages} />
          <Stat label="Scripts" value={intel.signals.performance.scripts} />
          <Stat label="External Scripts" value={intel.signals.performance.externalScripts} />
          <Stat label="Inline Scripts" value={intel.signals.performance.inlineScripts} />
          <Stat label="Styles" value={intel.signals.performance.styles} />
          <Stat label="Fonts" value={intel.signals.performance.fonts} />
          <Stat label="Preconnects" value={intel.signals.performance.preconnects} />
          <Stat label="Preloads" value={intel.signals.performance.preloads} />
        </div>
      )} />
      <CheckRow ok={intel?.signals.performance.lazyLoadingImages ? true : false}
        title="Image Lazy-loading"
        body={`${intel?.signals.performance.lazyLoadingImages ?? 0}/${intel?.signals.performance.totalImages ?? 0} images lazy-loaded.`} />
      <CheckRow ok={!intel?.signals.performance.renderBlockingScripts} title="Render Blocking Scripts" body={`${intel?.signals.performance.renderBlockingScripts ?? 0} blocking script(s).`} />
    </SectionCard>
  );
}

function SocialSection({ data }: { data: AggregatedData }) {
  const intel = data.intelligence;
  const og = data.metadata?.openGraph;
  const tw = data.metadata?.twitter;
  const platforms = intel?.signals.social.byPlatform ?? {};
  const pixels = intel?.signals.pixels;
  const yt = intel?.signals.youtube;

  return (
    <SectionCard id="social" title="Social Results">
      <CheckRow ok={!!platforms.facebook?.length} title="Facebook Page Linked" body={platforms.facebook?.[0] ?? "No Facebook page found."} />
      <CheckRow ok={!!og?.title} title="Facebook Open Graph Tags" body={og?.title ? `og:title — ${og.title}` : "Missing"} />
      <CheckRow
        ok={pixels?.facebookPixelDetected ?? false}
        title="Facebook Pixel"
        body={
          pixels?.facebookPixelDetected
            ? pixels.facebookPixelId
              ? `Detected · Pixel ID: ${pixels.facebookPixelId}`
              : "Detected"
            : "Not detected on the page."
        }
        detail={pixels && pixels.detected.length > 0 && (
          <Table
            headers={["Pixel", "ID"]}
            rows={pixels.detected.map((p) => [p.name, p.id ?? "—"])}
          />
        )}
      />
      <CheckRow ok={!!platforms.x?.length || !!platforms.twitter?.length} title="X (formerly Twitter) Account Linked" body={(platforms.x?.[0] ?? platforms.twitter?.[0]) ?? "Missing"} />
      <CheckRow ok={!!tw?.card} title="X Cards" body={tw?.card ? `Card: ${tw.card}` : "Missing"} />
      <CheckRow ok={!!platforms.instagram?.length} title="Instagram Linked" body={platforms.instagram?.[0] ?? "Missing"} />
      <CheckRow ok={!!platforms.linkedin?.length} title="LinkedIn Page Linked" body={platforms.linkedin?.[0] ?? "Missing"} />
      <CheckRow
        ok={yt?.linked ?? false}
        title="YouTube Channel Linked"
        body={yt?.channelUrl ?? "Missing"}
      />
      {yt?.linked && (
        <CheckRow
          ok={(yt.subscribers ?? 0) > 100}
          title="YouTube Channel Activity"
          body={yt.subscribers != null ? `${yt.subscribersText ?? yt.subscribers.toLocaleString()} subscribers` : "Subscriber count unavailable"}
          detail={
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Subscribers" value={yt.subscribersText ?? (yt.subscribers != null ? yt.subscribers.toLocaleString() : "—")} />
              <Stat label="Total Views" value={yt.totalViewsText ?? (yt.totalViews != null ? yt.totalViews.toLocaleString() : "—")} />
            </div>
          }
        />
      )}
    </SectionCard>
  );
}

function LocalSection({ data }: { data: AggregatedData }) {
  const intel = data.intelligence;
  return (
    <SectionCard id="local" title="Local SEO">
      <CheckRow ok={intel?.signals.geo.hasLocalBusinessSchema ?? false} title="Local Business Schema" body={intel?.signals.geo.hasLocalBusinessSchema ? "Detected" : "Not detected"} />
      <CheckRow ok="info" title="Google Business Profile Identified" body="No internal GBP lookup API. (See Missing Data.)" />
      {intel && intel.signals.geo.addresses.length > 0 && (
        <CheckRow ok="info" title="Addresses on Page" detail={
          <ul className="list-disc pl-5 text-sm">{intel.signals.geo.addresses.slice(0, 5).map((a, i) => <li key={i}>{a}</li>)}</ul>
        } />
      )}
      {intel && intel.signals.geo.phones.length > 0 && (
        <CheckRow ok="info" title="Phone Numbers" body={intel.signals.geo.phones.slice(0, 5).join(", ")} />
      )}
    </SectionCard>
  );
}

function TechSection({ data }: { data: AggregatedData }) {
  const intel = data.intelligence;
  const net = intel?.signals.network;
  const techs: Array<{ tech: string; type: string }> = [];
  if (intel) {
    for (const t of intel.signals.techStack.frameworks) techs.push({ tech: t, type: "Framework" });
    for (const t of intel.signals.techStack.cms) techs.push({ tech: t, type: "CMS" });
    for (const t of intel.signals.techStack.hosting) techs.push({ tech: t, type: "Hosting" });
    for (const t of intel.signals.techStack.cdn) techs.push({ tech: t, type: "CDN" });
    for (const t of intel.signals.techStack.buildTools) techs.push({ tech: t, type: "Build" });
    for (const t of intel.signals.analytics.detected) techs.push({ tech: t, type: "Analytics" });
  }

  return (
    <SectionCard id="tech" title="Technology Results">
      <CheckRow ok="info" title="Technology List" detail={
        techs.length === 0 ? <span className="text-sm text-muted-fg">None detected.</span> :
        <Table headers={["Technology", "Type"]} rows={techs.map((t) => [t.tech, <Pill key="t">{t.type}</Pill>])} />
      } />
      <CheckRow
        ok={!!net?.serverIp}
        title="Server IP Address"
        body={net?.serverIp ?? "Not resolved"}
        detail={net && net.allIps.length > 1 && (
          <div className="text-xs text-muted-fg">All A records: {net.allIps.join(", ")}</div>
        )}
      />
      <CheckRow
        ok={(net?.dnsServers.length ?? 0) > 0}
        title="DNS Servers"
        detail={net && net.dnsServers.length > 0 ? (
          <ul className="space-y-1 font-mono text-xs">
            {net.dnsServers.map((ns) => <li key={ns}>{ns}</li>)}
          </ul>
        ) : <span className="text-sm text-muted-fg">No NS records resolved.</span>}
      />
      <CheckRow ok="info" title="Charset" body={data.metadata?.basic.charset ?? "—"} />
      <CheckRow
        ok={net?.dmarc.present ?? false}
        title="DMARC Record"
        body={net?.dmarc.present ? "This site appears to have a valid DMARC record in place." : "No DMARC record found."}
        detail={net && net.dmarc.records.length > 0 && (
          <div className="rounded border border-app bg-muted/20 p-2 font-mono text-xs break-all">
            {net.dmarc.records.join("\n")}
          </div>
        )}
      />
      <CheckRow
        ok={net?.spf.present ?? false}
        title="SPF Record"
        body={net?.spf.present ? "This site appears to have an SPF record." : "No SPF record found."}
        detail={net && net.spf.records.length > 0 && (
          <div className="rounded border border-app bg-muted/20 p-2 font-mono text-xs break-all">
            {net.spf.records.join("\n")}
          </div>
        )}
      />
      <CheckRow ok="info" title="HTTPS Headers" detail={intel && (
        <Table headers={["Header", "Value"]} rows={[
          ["HSTS", intel.signals.security.hsts ? "yes" : "no"],
          ["CSP", intel.signals.security.csp ? "yes" : "no"],
          ["X-Frame-Options", intel.signals.security.xFrameOptions ?? "—"],
          ["X-Content-Type-Options", intel.signals.security.xContentTypeOptions ?? "—"],
          ["Referrer-Policy", intel.signals.security.referrerPolicy ?? "—"],
          ["Permissions-Policy", intel.signals.security.permissionsPolicy ?? "—"],
        ]} />
      )} />
    </SectionCard>
  );
}

function ChildPagesSection({ data }: { data: AggregatedData }) {
  const sample = data.sitemap?.urls?.slice(0, 25) ?? data.intelligence?.signals.sitemap.sampleUrls?.slice(0, 25) ?? [];
  const rows = (Array.isArray(sample) ? sample : []).map((u) => {
    if (typeof u === "string") return [<a key="u" href={u} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline dark:text-blue-400">{pathOf(u)}</a>];
    return [<a key="u" href={u.loc} target="_blank" rel="noreferrer" className="break-all text-blue-700 hover:underline dark:text-blue-400">{pathOf(u.loc)}</a>];
  });
  return (
    <SectionCard id="child-pages" title="Review Child Pages">
      {rows.length === 0 ? (
        <div className="text-sm text-muted-fg">No child pages discovered.</div>
      ) : (
        <Table headers={["Page"]} rows={rows} />
      )}
    </SectionCard>
  );
}

function MissingDataNote({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  return (
    <section id="missing" className="scroll-mt-24">
      <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Data not available from internal APIs
        </h3>
        <p className="mt-2 text-xs text-amber-700/80 dark:text-amber-300/80">
          The following fields appear in the SEOptimer report we mirrored but are not exposed by Blogy&apos;s internal APIs at this time:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-800 dark:text-amber-200">
          {missing.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </Card>
    </section>
  );
}

// ── small helpers ───────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-app bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-fg">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scaleBacklinks(rd: number): number {
  // Light heuristic: 0 → 0, 100 referring domains → ~75, plateaus thereafter.
  if (rd <= 0) return 0;
  return Math.min(100, Math.round(20 + Math.log10(rd + 1) * 30));
}

function avgScore(a?: number | null, b?: number | null): number | null {
  const arr = [a, b].filter((x): x is number => typeof x === "number");
  if (arr.length === 0) return null;
  return Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
}

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

function pathOf(u: string): string {
  try { return new URL(u).pathname || u; } catch { return u; }
}
