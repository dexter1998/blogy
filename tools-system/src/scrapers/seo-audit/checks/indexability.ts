import type { CheckDef } from "./types";

export const indexabilityChecks: CheckDef[] = [
  {
    id: "noindex",
    title: "Page is indexable (no noindex)",
    category: "indexability",
    weight: 3,
    whyItMatters:
      "A `noindex` meta or header tells Google to drop the page from the index entirely. Accidental noindex is one of the most common reasons traffic disappears overnight.",
    howToFix: "Remove `noindex` from <meta name=\"robots\"> and from any X-Robots-Tag response header.",
    run: (s) => {
      const robots = s.metadata?.basic.robots ?? "";
      if (!s.metadata) return null;
      if (/noindex/i.test(robots)) {
        return { status: "fail", summary: "Page is marked noindex.", evidence: [{ label: "Robots meta", value: robots }] };
      }
      return { status: "pass", summary: "Page is indexable.", evidence: [{ label: "Robots meta", value: robots || "—" }] };
    },
  },
  {
    id: "robots-meta-present",
    title: "Robots meta tag declared",
    category: "indexability",
    weight: 0.5,
    whyItMatters: "An explicit robots meta (even `index, follow`) is good hygiene and avoids ambiguous defaults.",
    howToFix: "Add <meta name=\"robots\" content=\"index, follow\">.",
    run: (s) => {
      const r = s.metadata?.basic.robots;
      if (!s.metadata) return null;
      if (r) return { status: "pass", summary: `Robots meta: ${r}.`, evidence: [{ label: "Value", value: r }] };
      return { status: "info", summary: "No explicit robots meta tag.", evidence: [] };
    },
  },
  {
    id: "canonical-self",
    title: "Canonical points to a valid URL",
    category: "indexability",
    weight: 1,
    whyItMatters: "A canonical pointing to a 404 / different domain / non-existent path tanks the page's ranking.",
    howToFix: "Make sure the canonical URL returns 200 and renders the same primary content.",
    run: (s) => {
      const c = s.metadata?.basic.canonical;
      if (!c) return null;
      try {
        const u = new URL(c);
        if (!u.protocol.startsWith("http")) return { status: "fail", summary: "Canonical URL has an invalid protocol.", evidence: [{ label: "Canonical", value: c }] };
        return { status: "pass", summary: "Canonical URL is well-formed.", evidence: [{ label: "Canonical", value: c }] };
      } catch {
        return { status: "fail", summary: "Canonical URL is not a valid absolute URL.", evidence: [{ label: "Canonical", value: c }] };
      }
    },
  },
  {
    id: "internal-link-count",
    title: "Page has internal outbound links",
    category: "indexability",
    weight: 1,
    whyItMatters: "Internal links pass PageRank-like authority and help crawlers discover related content.",
    howToFix: "Add at least 3 contextual internal links to related pages within the body content.",
    run: (s) => {
      const n = s.intelligence?.signals.internalArchitecture.totalInternalLinks;
      if (n == null) return null;
      if (n >= 5) return { status: "pass", summary: `${n} internal links.`, evidence: [{ label: "Count", value: n }] };
      if (n >= 1) return { status: "warn", summary: `Only ${n} internal links.`, evidence: [{ label: "Count", value: n }] };
      return { status: "fail", summary: "No internal links on the page.", evidence: [] };
    },
  },
  {
    id: "external-link-anchor",
    title: "External outbound links",
    category: "indexability",
    weight: 0.5,
    whyItMatters: "Citing authoritative external sources is a quality signal Google looks for — especially for YMYL content.",
    howToFix: "Cite 1–3 high-authority sources in body content where relevant.",
    run: (s) => {
      const n = s.intelligence?.signals.internalArchitecture.totalExternalLinks;
      if (n == null) return null;
      if (n >= 1) return { status: "pass", summary: `${n} external link(s).`, evidence: [{ label: "Count", value: n }] };
      return { status: "info", summary: "No external links.", evidence: [] };
    },
  },
  {
    id: "hreflang-validity",
    title: "Hreflang tags (if used) are valid",
    category: "indexability",
    weight: 0.5,
    whyItMatters: "Broken hreflang causes Google to serve the wrong locale variant or ignore the cluster entirely.",
    howToFix: "Use ISO 639-1 language codes (en, de) + optional ISO 3166-1 country codes (en-US, de-DE).",
    run: (s) => {
      const h = s.metadata?.hreflang ?? [];
      if (!s.metadata) return null;
      if (h.length === 0) return { status: "info", summary: "No hreflang tags (only relevant for multi-locale sites).", evidence: [] };
      const bad = h.filter((x) => !/^[a-z]{2}(-[A-Z]{2})?$|^x-default$/.test(x.hreflang));
      if (bad.length > 0) return { status: "fail", summary: `${bad.length} hreflang value(s) look malformed.`, evidence: [{ label: "Bad", value: bad.map((b) => b.hreflang) }] };
      return { status: "pass", summary: `${h.length} valid hreflang tag(s).`, evidence: [{ label: "Count", value: h.length }] };
    },
  },
];
