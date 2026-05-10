import type { CheckDef } from "./types";

export const technicalChecks: CheckDef[] = [
  {
    id: "robots-txt",
    title: "robots.txt is reachable",
    category: "technical",
    weight: 1,
    whyItMatters:
      "robots.txt tells crawlers which paths to skip. A missing file isn't fatal, but it removes a layer of control over crawl budget.",
    howToFix: "Add a /robots.txt with at minimum a User-agent and Sitemap directive.",
    run: (s) => {
      const found = s.intelligence?.signals.sitemap.robotsTxtFound;
      if (found == null) return null;
      if (found) {
        return { status: "pass", summary: "robots.txt is served.", evidence: [{ label: "URL", value: s.intelligence?.signals.sitemap.robotsTxtUrl ?? "" }] };
      }
      return { status: "warn", summary: "No robots.txt detected.", evidence: [] };
    },
  },
  {
    id: "sitemap-present",
    title: "XML sitemap is reachable",
    category: "technical",
    weight: 2,
    whyItMatters:
      "Sitemaps are the fastest way to surface every important URL to Google and Bing — especially for sites with weak internal linking.",
    howToFix: "Publish /sitemap.xml and reference it from robots.txt with a Sitemap directive.",
    run: (s) => {
      const sm = s.sitemap;
      if (!sm) return null;
      const reachable = sm.fetched.some((f) => f.ok);
      if (reachable) {
        return {
          status: "pass",
          summary: `${sm.stats.totalUrls.toLocaleString()} URLs across ${sm.fetched.length} sitemap file(s).`,
          evidence: [{ label: "URLs", value: sm.stats.totalUrls }],
        };
      }
      return { status: "fail", summary: "No reachable sitemap.", evidence: [] };
    },
  },
  {
    id: "sitemap-coverage",
    title: "Sitemap has meaningful coverage",
    category: "technical",
    weight: 1,
    whyItMatters: "A sitemap with only a handful of URLs misses the point — crawlers need the full set.",
    howToFix: "Regenerate the sitemap from the live URL list (CMS plugin or post-deploy script).",
    run: (s) => {
      const sm = s.sitemap;
      if (!sm || !sm.fetched.some((f) => f.ok)) return null;
      if (sm.stats.totalUrls >= 10) return { status: "pass", summary: `${sm.stats.totalUrls.toLocaleString()} URLs.`, evidence: [{ label: "URLs", value: sm.stats.totalUrls }] };
      if (sm.stats.totalUrls === 0) return { status: "fail", summary: "Sitemap is empty.", evidence: [] };
      return { status: "warn", summary: `Only ${sm.stats.totalUrls} URLs in the sitemap.`, evidence: [{ label: "URLs", value: sm.stats.totalUrls }] };
    },
  },
  {
    id: "schema-present",
    title: "Structured data (Schema.org) present",
    category: "technical",
    weight: 2,
    whyItMatters:
      "Schema.org markup unlocks rich results (FAQ, breadcrumb, product, article) and helps AI assistants understand the entity behind your page.",
    howToFix: "Add JSON-LD blocks for at least Organization and the primary content type (Article, Product, FAQ).",
    run: (s) => {
      if (!s.schema) return null;
      if (s.schema.totalItems === 0) return { status: "fail", summary: "No structured data on the page.", evidence: [] };
      return {
        status: "pass",
        summary: `${s.schema.totalItems} schema items: ${s.schema.detectedTypes.slice(0, 5).join(", ")}.`,
        evidence: [{ label: "Types", value: s.schema.detectedTypes }],
      };
    },
  },
  {
    id: "schema-organization",
    title: "Organization or Person schema",
    category: "technical",
    weight: 1,
    whyItMatters: "Identity schema (Organization/Person) is the foundation of E-E-A-T and gives AI engines a citable entity.",
    howToFix: "Add an Organization JSON-LD block with name, url, logo, and sameAs links.",
    run: (s) => {
      if (!s.schema) return null;
      const has = s.schema.detectedTypes.some((t) => /^(Organization|Person|LocalBusiness)$/i.test(t));
      if (has) return { status: "pass", summary: "Organization/Person identity schema is present.", evidence: [] };
      return { status: "warn", summary: "No Organization/Person schema.", evidence: [] };
    },
  },
  {
    id: "viewport-meta",
    title: "Mobile viewport configured",
    category: "technical",
    weight: 1.5,
    whyItMatters:
      "Without a viewport meta, mobile browsers render the page at desktop width and zoom out — Google penalises this as mobile-unfriendly.",
    howToFix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to <head>.",
    run: (s) => {
      const vp = s.intelligence?.signals.metadata.viewport;
      if (s.intelligence && !vp) return { status: "fail", summary: "No viewport meta tag.", evidence: [] };
      if (!vp) return null;
      return { status: "pass", summary: "Viewport meta present.", evidence: [{ label: "Viewport", value: vp }] };
    },
  },
  {
    id: "charset-meta",
    title: "Charset declared",
    category: "technical",
    weight: 0.3,
    whyItMatters: "A missing charset can cause Mojibake on non-ASCII text.",
    howToFix: "Add <meta charset=\"utf-8\"> as the first child of <head>.",
    run: (s) => {
      const c = s.metadata?.basic.charset;
      if (!s.metadata) return null;
      if (!c) return { status: "warn", summary: "No charset declared.", evidence: [] };
      return { status: "pass", summary: `Charset: ${c}.`, evidence: [{ label: "Charset", value: c }] };
    },
  },
  {
    id: "favicon-present",
    title: "Favicon set",
    category: "technical",
    weight: 0.2,
    whyItMatters: "Google now displays favicons in mobile search results. Missing one weakens brand recall.",
    howToFix: "Add <link rel=\"icon\"> or /favicon.ico.",
    run: (s) => {
      const f = s.intelligence?.signals.brand.favicon;
      if (!s.intelligence) return null;
      if (!f) return { status: "warn", summary: "No favicon detected.", evidence: [] };
      return { status: "pass", summary: "Favicon present.", evidence: [{ label: "Favicon", value: f }] };
    },
  },
];
