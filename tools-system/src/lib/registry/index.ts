/**
 * Central registry of every public tool/API in the system.
 * Adding a new tool = add an entry here + create the matching scraper, route, and pages.
 * /tools and /docs-api index pages render directly from this list.
 */

export type ToolStatus = "live" | "beta" | "coming-soon";

export type ToolEntry = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "SEO" | "Content" | "Research" | "Technical" | "AI" | "Performance" | "Intelligence";
  status: ToolStatus;
  toolPath: `/tools/${string}`;
  docsPath: `/docs-api/${string}`;
  endpoint: `/api/v1/${string}`;
  method: "GET" | "POST";
  tags: string[];
};

export const tools: ToolEntry[] = [
  {
    slug: "website-intelligence",
    name: "Website Intelligence Engine",
    tagline: "22 signals from one crawl — no third-party APIs",
    description:
      "Crawl any website once and extract brand, metadata, schema, social, sitemap, payments, tech-stack, analytics, AI readiness, security, performance, hosting, geo, ads, and more. Modular extractor architecture — every signal is also exposed as its own API endpoint. Pure scraping: no Ahrefs, BuiltWith, Moz, or SEMrush APIs.",
    category: "Intelligence",
    status: "live",
    toolPath: "/tools/website-intelligence",
    docsPath: "/docs-api/website-intelligence-api",
    endpoint: "/api/v1/website-intelligence",
    method: "POST",
    tags: [
      "Website Intelligence",
      "Brand Intelligence",
      "Tech Stack",
      "Payments",
      "Schema",
      "Sitemap",
      "Social",
      "AI Readiness",
      "Security",
      "Hosting",
      "Performance",
    ],
  },
  {
    slug: "da-pa-checker",
    name: "Authority Checker",
    tagline: "Authority Score, Page Strength, Domain Strength, URL Strength",
    description:
      "Blogy-native authority readings for any domain or URL. Built from WHOIS/RDAP, DNS-over-HTTPS, robots/sitemap, on-page trust signals, schema.org, OpenPageRank, and Common Crawl footprints — no proprietary third-party SEO metrics emulated.",
    category: "SEO",
    status: "coming-soon",
    toolPath: "/tools/da-pa-checker",
    docsPath: "/docs-api/da-pa-api",
    endpoint: "/api/v1/da-pa",
    method: "POST",
    tags: [
      "Authority Score",
      "Page Strength",
      "Domain Strength",
      "URL Strength",
      "Spam Score",
      "Stability Score",
      "Domain Age",
    ],
  },
  {
    slug: "ai-readiness",
    name: "AI Readiness Checker",
    tagline: "E-E-A-T + citability score for AI search",
    description:
      "Score how AI-ready a page is for Google AI Overviews, ChatGPT, and Perplexity. Author signals, dates, schema, structure, llms.txt, freshness.",
    category: "Content",
    status: "live",
    toolPath: "/tools/ai-readiness",
    docsPath: "/docs-api/ai-readiness-api",
    endpoint: "/api/v1/ai-readiness",
    method: "POST",
    tags: ["AI Overviews", "GEO", "E-E-A-T", "Citability", "llms.txt"],
  },
  {
    slug: "metadata-checker",
    name: "Metadata Checker",
    tagline: "Title, meta, OG, Twitter, Hreflang audit",
    description:
      "Inspect title, description, canonical, robots, Open Graph, Twitter card, and hreflang for any URL. Detects truncation and missing tags.",
    category: "Technical",
    status: "live",
    toolPath: "/tools/metadata-checker",
    docsPath: "/docs-api/metadata-api",
    endpoint: "/api/v1/metadata",
    method: "POST",
    tags: ["Meta", "OG", "Twitter Card", "Hreflang", "Canonical"],
  },
  {
    slug: "schema-checker",
    name: "Schema Markup Checker",
    tagline: "JSON-LD, Microdata & RDFa validator",
    description:
      "Detect and validate Schema.org structured data on any URL. Surfaces type counts, required-property errors, and rich-result eligibility hints.",
    category: "Technical",
    status: "live",
    toolPath: "/tools/schema-checker",
    docsPath: "/docs-api/schema-api",
    endpoint: "/api/v1/schema",
    method: "POST",
    tags: ["Schema", "JSON-LD", "Structured Data", "Rich Results"],
  },
  {
    slug: "sitemap-checker",
    name: "Sitemap Checker",
    tagline: "XML sitemap audit & stats",
    description:
      "Validate XML sitemaps, count URLs, detect lastmod / priority hygiene, find sitemap-index nesting issues, and confirm robots.txt declaration.",
    category: "Technical",
    status: "live",
    toolPath: "/tools/sitemap-checker",
    docsPath: "/docs-api/sitemap-api",
    endpoint: "/api/v1/sitemap",
    method: "POST",
    tags: ["Sitemap", "XML", "Indexation"],
  },
  {
    slug: "pagespeed-checker",
    name: "PageSpeed Checker",
    tagline: "Real Core Web Vitals + Lighthouse",
    description:
      "Run Google PageSpeed Insights for any URL. Reports field CrUX (LCP, INP, CLS) and lab Lighthouse scores across Performance, SEO, Accessibility, Best Practices.",
    category: "Technical",
    status: "live",
    toolPath: "/tools/pagespeed-checker",
    docsPath: "/docs-api/pagespeed-api",
    endpoint: "/api/v1/pagespeed",
    method: "POST",
    tags: ["Core Web Vitals", "Lighthouse", "LCP", "INP", "CLS"],
  },
  {
    slug: "serp-checker",
    name: "SERP Checker",
    tagline: "Multi-engine top ranking pages with country targeting",
    description:
      "Top ranking pages across Google, Bing, Yahoo and DuckDuckGo. Country-localized SERPs, featured snippets, PAA, ads, videos, news and intent classification — one normalized schema.",
    category: "Research",
    status: "live",
    toolPath: "/tools/serp-checker",
    docsPath: "/docs-api/serp-api",
    endpoint: "/api/v1/serp",
    method: "POST",
    tags: ["SERP", "Google", "Bing", "Yahoo", "DuckDuckGo", "Geo", "Intent"],
  },
  {
    slug: "paa-checker",
    name: "People Also Ask Generator",
    tagline: "Multi-engine PAA discovery with recursive expansion",
    description:
      "Pull People Also Ask questions across Google, Bing, Yahoo and DuckDuckGo for any keyword. Country targeting, configurable limit and recursion depth, dedupe + CSV export.",
    category: "Research",
    status: "live",
    toolPath: "/tools/paa-checker",
    docsPath: "/docs-api/paa-api",
    endpoint: "/api/v1/paa",
    method: "POST",
    tags: ["PAA", "Questions", "Multi-engine", "Geo", "Content Ideas"],
  },
  {
    slug: "geo-checker",
    name: "GEO Checker",
    tagline: "Generative Engine Optimization audit",
    description:
      "Score citability for AI Overviews, ChatGPT, and Perplexity. Probes robots.txt for 11 AI crawlers, extracts citable passages, counts brand mentions and sameAs entity links, and detects answerability patterns.",
    category: "Content",
    status: "live",
    toolPath: "/tools/geo-checker",
    docsPath: "/docs-api/geo-api",
    endpoint: "/api/v1/geo",
    method: "POST",
    tags: ["GEO", "AI Overviews", "ChatGPT", "Perplexity", "Citability"],
  },
  {
    slug: "seo-audit",
    name: "SEO Audit",
    tagline: "One-page site health check",
    description:
      "Composite SEO audit: pulls metadata, schema, sitemap, and PageSpeed signals for a single URL into one weighted health score with prioritized fixes.",
    category: "SEO",
    status: "live",
    toolPath: "/tools/seo-audit",
    docsPath: "/docs-api/seo-audit-api",
    endpoint: "/api/v1/seo-audit",
    method: "POST",
    tags: ["Audit", "Health Score", "On-Page", "Composite"],
  },
  {
    slug: "internal-links",
    name: "Internal Link Extractor",
    tagline: "Single-page link audit — internal vs external, navbar vs footer",
    description:
      "Pulls every link off one page, separates internal (same domain or subdomain) from external, buckets them by navbar / footer / body, and flags broken targets. Paginated 500 at a time.",
    category: "SEO",
    status: "live",
    toolPath: "/tools/internal-links",
    docsPath: "/docs-api/internal-links-api",
    endpoint: "/api/v1/internal-links",
    method: "POST",
    tags: ["Internal Links", "External Links", "On-Page", "Broken Links"],
  },
  {
    slug: "backlinks",
    name: "Backlink Discovery",
    tagline: "Real backlinks via Common Crawl",
    description:
      "Discover real referring URLs from Common Crawl with optional live verification. Captures anchor text and rel attribute when verified — no paid backlink API required.",
    category: "SEO",
    status: "coming-soon",
    toolPath: "/tools/backlinks",
    docsPath: "/docs-api/backlinks-api",
    endpoint: "/api/v1/backlinks",
    method: "POST",
    tags: ["Backlinks", "Common Crawl", "Referring Domains"],
  },
  {
    slug: "whois-checker",
    name: "WHOIS / RDAP Lookup",
    tagline: "Live domain registration data — RDAP-backed",
    description:
      "Real-time RDAP lookup for any domain. Routes through the IANA bootstrap registry to query authoritative TLD endpoints directly. Returns registrar, registration date, expiry, nameservers, DNSSEC, status codes, abuse contact, and the full RDAP JSON.",
    category: "Technical",
    status: "live",
    toolPath: "/tools/whois-checker",
    docsPath: "/docs-api/whois-api",
    endpoint: "/api/v1/whois",
    method: "POST",
    tags: ["WHOIS", "RDAP", "Domain Age", "Registrar", "DNSSEC", "Nameservers", "Expiry"],
  },
  {
    slug: "ai-humanizer",
    name: "AI Humanizer",
    tagline: "Make AI text sound human",
    description:
      "Deterministic AI text humanizer: detects 30+ AI tells, applies contractions, trims transitions, and restructures long sentences. No LLM dependency.",
    category: "Content",
    status: "live",
    toolPath: "/tools/ai-humanizer",
    docsPath: "/docs-api/ai-humanizer-api",
    endpoint: "/api/v1/ai-humanizer",
    method: "POST",
    tags: ["AI", "Humanizer", "Content", "Rewrite"],
  },
];

export function getTool(slug: string): ToolEntry | undefined {
  return tools.find((t) => t.slug === slug);
}
