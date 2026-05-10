"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Button, Card, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { WebsiteIntelligenceResult } from "@/scrapers/website-intelligence/types";

type ApiResp =
  | { ok: true; data: { result: WebsiteIntelligenceResult } }
  | { ok: false; error: { message: string } };

const SECTION_DESCRIPTIONS: Record<string, string> = {
  brand: "Identity, logo, theme, palette, fonts, dark-mode support",
  metadata: "Title, description, canonical, OG, Twitter, hreflang",
  social: "Linked social profiles across 14 platforms",
  sitemap: "robots.txt rules, declared sitemaps, total URLs",
  schema: "JSON-LD, Microdata, RDFa types & counts",
  internalArchitecture: "Internal links graph, nav menu, anchors",
  footer: "Footer links + legal entities (Pvt Ltd, LLC…)",
  payments: "Payment gateways from script & checkout fingerprints",
  techStack: "Frameworks, CMS, hosting, CDN, build tools",
  analytics: "Analytics & product-analytics tooling",
  aiReadiness: "llms.txt, FAQ depth, citable structure, schema",
  content: "Word count, reading time, headings hierarchy",
  security: "HTTPS, HSTS, CSP, security header coverage",
  performance: "Lazy loading, scripts, fonts, preconnects",
  geo: "Address, phones, emails, map links, LocalBusiness",
  leadGen: "Calendly, Intercom, Drift, HubSpot, chat widgets",
  forms: "Newsletter, contact, search, popups, CTAs",
  cookies: "GDPR consent manager + banner detection",
  ads: "Ad networks, AdSense, Taboola, affiliate scripts",
  cms: "Detected CMS / generator",
  hosting: "Origin host, CDN, server header",
  trust: "About / contact / policy presence + review links",
};

export function IntelligenceForm() {
  const [url, setUrl] = useState("blogy.in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WebsiteIntelligenceResult | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ brand: true });
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [data]);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/v1/website-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, depth: 8 }),
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) {
        setError(json.error.message);
      } else {
        setData(json.data.result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function toggle(key: string) {
    setOpen((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="domain.com or https://example.com/page"
            className="h-11 flex-1 rounded-lg border border-app bg-app px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button type="submit" disabled={loading || !url.trim()} size="lg">
            {loading ? "Crawling…" : "Run Intelligence"}
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-fg">
          One crawl extracts 22 signal groups: brand, metadata, schema, social, payments, tech-stack, analytics, AI readiness, security, performance, hosting, and more.
        </p>
      </Card>

      {error && (
        <Card className="border-rose-200 dark:border-rose-900">
          <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>
        </Card>
      )}

      {data && (
        <div ref={resultsRef} className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-fg">Crawled</div>
                <div className="mt-1 break-all text-base font-medium">{data.finalUrl}</div>
                <div className="mt-1 text-xs text-muted-fg">
                  {data.pagesCrawled} pages · {(data.durationMs / 1000).toFixed(1)}s · root: {data.rootDomain}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="accent">{data.pagesCrawled} pages</Badge>
                <Badge>{data.totals.length} signals</Badge>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Pages crawled" value={data.pagesCrawled} />
            <Stat
              label="Sitemap URLs"
              value={data.signals.sitemap.totalUrls}
              tone={data.signals.sitemap.totalUrls > 0 ? "good" : "warn"}
            />
            <Stat
              label="Internal links"
              value={data.signals.internalArchitecture.uniqueInternalUrls}
            />
            <Stat label="Schema items" value={data.signals.schema.totalItems} />
          </div>

          <div className="space-y-2">
            {data.totals.map((t) => (
              <Section
                key={t.key}
                k={t.key}
                label={t.label}
                description={SECTION_DESCRIPTIONS[t.key] ?? ""}
                total={t.total}
                hasMore={t.hasMore}
                open={!!open[t.key]}
                onToggle={() => toggle(t.key)}
                inputUrl={url}
              >
                {renderSection(t.key, data)}
              </Section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  k,
  label,
  description,
  total,
  hasMore,
  open,
  onToggle,
  inputUrl,
  children,
}: {
  k: string;
  label: string;
  description: string;
  total: number;
  hasMore?: boolean;
  open: boolean;
  onToggle: () => void;
  inputUrl: string;
  children: ReactNode;
}) {
  const drilldown = DRILLDOWN_KEYS[k];
  return (
    <Card className="!p-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-muted/40"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{label}</h3>
            <Badge>{total.toLocaleString()}</Badge>
            {hasMore && <Badge tone="warn">truncated</Badge>}
          </div>
          {description && (
            <div className="mt-0.5 text-xs text-muted-fg">{description}</div>
          )}
        </div>
        <div className="text-muted-fg">{open ? "−" : "+"}</div>
      </button>
      {open && (
        <div className="border-t border-app p-4">
          {children}
          {drilldown && (
            <div className="mt-3">
              <Link
                href={`/tools/website-intelligence/${drilldown}?url=${encodeURIComponent(inputUrl)}`}
                className="inline-flex items-center text-xs font-medium text-accent hover:underline"
              >
                Open full {label.toLowerCase()} list →
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

const DRILLDOWN_KEYS: Record<string, string> = {
  sitemap: "sitemap",
  internalArchitecture: "internal-links",
  footer: "footer-links",
  social: "social-links",
  schema: "schema-items",
};

// ── Per-section renderers ───────────────────────────────────────────────

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-xs">
      <div className="text-muted-fg">{k}</div>
      <div className="break-all">{v ?? <span className="text-muted-fg">—</span>}</div>
    </div>
  );
}

function PillList({ items, max = 30 }: { items: string[]; max?: number }) {
  if (!items.length) return <span className="text-xs text-muted-fg">none detected</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, max).map((s, i) => (
        <span
          key={i}
          className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-fg"
        >
          {s}
        </span>
      ))}
      {items.length > max && (
        <span className="text-[11px] text-muted-fg">+{items.length - max} more</span>
      )}
    </div>
  );
}

function renderSection(key: string, d: WebsiteIntelligenceResult): ReactNode {
  const s = d.signals;
  switch (key) {
    case "brand":
      return (
        <div>
          <KV k="Website name" v={s.brand.websiteName} />
          <KV k="Brand name" v={s.brand.brandName} />
          <KV k="Tagline" v={s.brand.tagline} />
          <KV k="Logo" v={s.brand.logo ? <a href={s.brand.logo} target="_blank" className="text-accent underline">{s.brand.logo}</a> : null} />
          <KV k="Favicon" v={s.brand.favicon ? <a href={s.brand.favicon} target="_blank" className="text-accent underline">{s.brand.favicon}</a> : null} />
          <KV k="Theme color" v={s.brand.themeColor && (
            <span className="inline-flex items-center gap-2"><span className="inline-block h-4 w-4 rounded border border-app" style={{ background: s.brand.themeColor }} />{s.brand.themeColor}</span>
          )} />
          <KV k="Palette" v={
            s.brand.colorPalette.length ? (
              <div className="flex flex-wrap gap-1">{s.brand.colorPalette.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 rounded border border-app px-1.5 py-0.5 text-[10px]"><span className="inline-block h-3 w-3 rounded" style={{ background: c }} />{c}</span>
              ))}</div>
            ) : null
          } />
          <KV k="Fonts" v={<PillList items={s.brand.fonts} />} />
          <KV k="Dark mode" v={s.brand.darkModeSupported ? "supported" : "—"} />
        </div>
      );
    case "metadata":
      return (
        <div>
          <KV k="Title" v={s.metadata.title} />
          <KV k="Description" v={s.metadata.metaDescription} />
          <KV k="Canonical" v={s.metadata.canonical} />
          <KV k="Robots" v={s.metadata.robots} />
          <KV k="Viewport" v={s.metadata.viewport} />
          <KV k="Charset" v={s.metadata.charset} />
          <KV k="Language" v={s.metadata.language} />
          <KV k="Author" v={s.metadata.author} />
          <KV k="Publisher" v={s.metadata.publisher} />
          <KV k="OG tags" v={`${Object.keys(s.metadata.openGraph).length} found`} />
          <KV k="Twitter tags" v={`${Object.keys(s.metadata.twitter).length} found`} />
          <KV k="Hreflang" v={`${s.metadata.hreflang.length} alternates`} />
        </div>
      );
    case "social":
      return (
        <div className="space-y-2">
          {Object.entries(s.social.byPlatform).length === 0 && <div className="text-xs text-muted-fg">No social profiles linked.</div>}
          {Object.entries(s.social.byPlatform).map(([platform, urls]) => (
            <div key={platform} className="text-xs">
              <span className="font-semibold capitalize">{platform}</span>
              <div className="mt-0.5 space-y-0.5">
                {urls.slice(0, 3).map((u) => (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="block break-all text-accent hover:underline">{u}</a>
                ))}
                {urls.length > 3 && <span className="text-[11px] text-muted-fg">+{urls.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>
      );
    case "sitemap":
      return (
        <div>
          <KV k="robots.txt" v={s.sitemap.robotsTxtFound ? <a href={s.sitemap.robotsTxtUrl ?? "#"} target="_blank" className="text-accent underline">{s.sitemap.robotsTxtUrl}</a> : "not found"} />
          <KV k="User-agents" v={<PillList items={s.sitemap.userAgents} max={8} />} />
          <KV k="Disallows" v={`${s.sitemap.disallows.length} rules`} />
          <KV k="Declared sitemaps" v={
            s.sitemap.sitemapsDeclared.length ? (
              <ul className="space-y-0.5">{s.sitemap.sitemapsDeclared.map((u) => (
                <li key={u}><a href={u} target="_blank" className="break-all text-accent underline">{u}</a></li>
              ))}</ul>
            ) : "none in robots.txt"
          } />
          <KV k="Total URLs" v={`${s.sitemap.totalUrls.toLocaleString()}${s.sitemap.truncated ? " (truncated)" : ""}`} />
          <KV k="Sample" v={`${s.sitemap.sampleUrls.length} URLs included; full list available via drilldown`} />
        </div>
      );
    case "schema":
      return (
        <div>
          <KV k="Total" v={s.schema.totalItems} />
          <KV k="JSON-LD" v={s.schema.byFormat.jsonLd} />
          <KV k="Microdata" v={s.schema.byFormat.microdata} />
          <KV k="RDFa" v={s.schema.byFormat.rdfa} />
          <KV k="Detected types" v={
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(s.schema.typeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([t, c]) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t} · {c}</span>
                ))}
            </div>
          } />
        </div>
      );
    case "internalArchitecture": {
      const ia = s.internalArchitecture;
      return (
        <div>
          <KV k="Internal links" v={`${ia.totalInternalLinks.toLocaleString()} total · ${ia.uniqueInternalUrls.toLocaleString()} unique`} />
          <KV k="External links" v={`${ia.totalExternalLinks.toLocaleString()} total · ${ia.uniqueExternalDomains} domains`} />
          <KV k="Pages crawled" v={ia.pagesCrawled} />
          <KV k="Nav menu" v={
            <ul className="space-y-0.5">
              {ia.navMenuLinks.slice(0, 10).map((l) => (
                <li key={l.href} className="text-[11px]">
                  <span className="font-medium">{l.text}</span> · <a href={l.href} target="_blank" className="break-all text-accent underline">{l.href}</a>
                </li>
              ))}
              {ia.navMenuLinks.length > 10 && <li className="text-[11px] text-muted-fg">+{ia.navMenuLinks.length - 10} more</li>}
            </ul>
          } />
          <KV k="Top anchors" v={
            <div className="flex flex-wrap gap-1.5">
              {ia.topAnchors.slice(0, 10).map((a) => (
                <span key={a.anchor} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{a.anchor} · {a.count}</span>
              ))}
            </div>
          } />
        </div>
      );
    }
    case "footer": {
      const f = s.footer;
      return (
        <div>
          <KV k="Footer found" v={f.found ? "yes" : "no"} />
          <KV k="Total links" v={f.totalLinks} />
          <KV k="Detected pages" v={
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(f.detected).filter(([, v]) => v).map(([k]) => (
                <span key={k} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{k}</span>
              ))}
              {Object.entries(f.detected).filter(([, v]) => v).length === 0 && <span className="text-xs text-muted-fg">none</span>}
            </div>
          } />
          <KV k="Legal entities" v={<PillList items={f.legalEntities} />} />
        </div>
      );
    }
    case "payments":
      return (
        <div>
          <KV k="Detected" v={<PillList items={s.payments.detected} />} />
          {s.payments.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {s.payments.evidence.slice(0, 8).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.provider}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    case "techStack": {
      const t = s.techStack;
      return (
        <div>
          <KV k="Frameworks" v={<PillList items={t.frameworks} />} />
          <KV k="CMS" v={<PillList items={t.cms} />} />
          <KV k="Hosting" v={<PillList items={t.hosting} />} />
          <KV k="CDN" v={<PillList items={t.cdn} />} />
          <KV k="Build tools" v={<PillList items={t.buildTools} />} />
          {t.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {t.evidence.slice(0, 12).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.tech}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    }
    case "analytics":
      return (
        <div>
          <KV k="Detected" v={<PillList items={s.analytics.detected} />} />
          {s.analytics.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {s.analytics.evidence.slice(0, 8).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.tool}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    case "aiReadiness": {
      const a = s.aiReadiness;
      return (
        <div>
          <KV k="llms.txt" v={a.llmsTxt ? <a href={a.llmsTxtUrl ?? "#"} target="_blank" className="text-accent underline">{a.llmsTxtUrl}</a> : "not found"} />
          <KV k="Semantic headings" v={a.semanticHeadings ? "yes" : "no"} />
          <KV k="FAQ depth" v={a.faqDepth} />
          <KV k="Citable blocks" v={a.citableBlocks} />
          <KV k="FAQ schema" v={a.hasFaqSchema ? "yes" : "no"} />
          <KV k="Article schema" v={a.hasArticleSchema ? "yes" : "no"} />
          <KV k="Authors" v={<PillList items={a.authorEntities} />} />
        </div>
      );
    }
    case "content": {
      const c = s.content;
      return (
        <div>
          <KV k="Word count (all pages)" v={c.wordCount.toLocaleString()} />
          <KV k="Reading time" v={`${c.readingTimeMinutes} min`} />
          <KV k="Language" v={c.language} />
          <KV k="Heading hierarchy" v={`H1=${c.headingHierarchy.h1} · H2=${c.headingHierarchy.h2} · H3=${c.headingHierarchy.h3} · H4=${c.headingHierarchy.h4}`} />
          <KV k="Duplicate titles" v={c.duplicateTitleAcrossPages ? "yes — across crawled pages" : "no"} />
          <KV k="Pages analyzed" v={c.pagesAnalyzed} />
        </div>
      );
    }
    case "security": {
      const sec = s.security;
      const yn = (b: boolean) => (b ? <Badge tone="good">yes</Badge> : <Badge tone="bad">no</Badge>);
      return (
        <div>
          <KV k="HTTPS" v={yn(sec.https)} />
          <KV k="HSTS" v={yn(sec.hsts)} />
          <KV k="CSP" v={yn(sec.csp)} />
          <KV k="X-Frame-Options" v={sec.xFrameOptions} />
          <KV k="X-Content-Type-Options" v={sec.xContentTypeOptions} />
          <KV k="Referrer-Policy" v={sec.referrerPolicy} />
          <KV k="Permissions-Policy" v={sec.permissionsPolicy} />
          <KV k="CDN" v={sec.cdnDetected} />
        </div>
      );
    }
    case "performance": {
      const p = s.performance;
      return (
        <div>
          <KV k="Images" v={`${p.lazyLoadingImages} lazy / ${p.totalImages} total`} />
          <KV k="Scripts" v={`${p.scripts} total · ${p.externalScripts} ext · ${p.inlineScripts} inline`} />
          <KV k="Render-blocking scripts" v={p.renderBlockingScripts} />
          <KV k="Stylesheets" v={p.styles} />
          <KV k="Fonts" v={p.fonts} />
          <KV k="Preconnects" v={p.preconnects} />
          <KV k="Preloads" v={p.preloads} />
        </div>
      );
    }
    case "geo": {
      const g = s.geo;
      return (
        <div>
          <KV k="LocalBusiness schema" v={g.hasLocalBusinessSchema ? "yes" : "no"} />
          <KV k="Addresses" v={<PillList items={g.addresses} />} />
          <KV k="Cities" v={<PillList items={g.cities} />} />
          <KV k="Phones" v={<PillList items={g.phones} />} />
          <KV k="Emails" v={<PillList items={g.emails} />} />
          <KV k="Map links" v={g.mapLinks.length ? <ul className="space-y-0.5">{g.mapLinks.map((u) => (<li key={u}><a href={u} target="_blank" className="break-all text-accent underline">{u}</a></li>))}</ul> : null} />
        </div>
      );
    }
    case "leadGen":
      return (
        <div>
          <KV k="Detected" v={<PillList items={s.leadGen.detected} />} />
          {s.leadGen.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {s.leadGen.evidence.slice(0, 8).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.tool}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    case "forms": {
      const f = s.forms;
      return (
        <div>
          <KV k="Total forms" v={f.totalForms} />
          <KV k="Newsletter forms" v={f.newsletterForms} />
          <KV k="Contact forms" v={f.contactForms} />
          <KV k="Search forms" v={f.searchForms} />
          <KV k="Popups / modals" v={f.popups} />
          <KV k="CTA buttons" v={f.ctaButtons} />
          <KV k="Booking widgets" v={f.bookingWidgets} />
        </div>
      );
    }
    case "cookies": {
      const c = s.cookies;
      return (
        <div>
          <KV k="Banner detected" v={c.cookieBannerDetected ? "yes" : "no"} />
          <KV k="Consent manager" v={c.consentManager} />
          <KV k="Set-Cookie names" v={<PillList items={c.setCookies} />} />
        </div>
      );
    }
    case "ads":
      return (
        <div>
          <KV k="Detected" v={<PillList items={s.ads.detected} />} />
          {s.ads.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {s.ads.evidence.slice(0, 8).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.network}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    case "cms":
      return (
        <div>
          <KV k="CMS" v={s.cms.cms} />
          <KV k="Generator" v={s.cms.generator} />
          <KV k="Evidence" v={s.cms.evidence.length ? <ul className="space-y-0.5 text-[11px]">{s.cms.evidence.map((e, i) => <li key={i} className="break-all">{e}</li>)}</ul> : null} />
        </div>
      );
    case "hosting": {
      const h = s.hosting;
      return (
        <div>
          <KV k="Hosting" v={h.hosting} />
          <KV k="CDN" v={h.cdn} />
          <KV k="Server header" v={h.server} />
          <KV k="X-Powered-By" v={h.poweredBy} />
          {h.evidence.length > 0 && (
            <KV k="Evidence" v={
              <ul className="space-y-1 text-[11px]">
                {h.evidence.slice(0, 8).map((e, i) => (
                  <li key={i}><span className="font-semibold">{e.provider}</span> · <span className="text-muted-fg">{e.via}</span>: <span className="break-all">{e.sample}</span></li>
                ))}
              </ul>
            } />
          )}
        </div>
      );
    }
    case "trust": {
      const t = s.trust;
      const yn = (b: boolean) => (b ? <Badge tone="good">yes</Badge> : <Badge tone="warn">no</Badge>);
      return (
        <div>
          <KV k="About page" v={yn(t.hasAboutPage)} />
          <KV k="Contact page" v={yn(t.hasContactPage)} />
          <KV k="Privacy policy" v={yn(t.hasPrivacyPolicy)} />
          <KV k="Terms" v={yn(t.hasTermsPage)} />
          <KV k="Org schema" v={yn(t.hasOrganizationSchema)} />
          <KV k="Trustpilot" v={t.trustpilotLink ? <a href={t.trustpilotLink} target="_blank" className="break-all text-accent underline">{t.trustpilotLink}</a> : null} />
          <KV k="G2" v={t.g2Link ? <a href={t.g2Link} target="_blank" className="break-all text-accent underline">{t.g2Link}</a> : null} />
          <KV k="Capterra" v={t.capterraLink ? <a href={t.capterraLink} target="_blank" className="break-all text-accent underline">{t.capterraLink}</a> : null} />
          <KV k="Year founded" v={t.yearFounded} />
        </div>
      );
    }
    default:
      return null;
  }
}

// silence unused imports if cn isn't used directly
void cn;
