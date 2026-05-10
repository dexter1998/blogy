import type { CheckDef } from "./types";

export const contentChecks: CheckDef[] = [
  {
    id: "word-count",
    title: "Content depth (word count)",
    category: "content",
    weight: 2,
    whyItMatters:
      "Thin pages (< 300 words) struggle to rank for anything competitive. Long-form content has more chances to match semantic queries.",
    howToFix: "Aim for 600+ words on commercial pages, 1,200+ on guides. Don't pad — answer the question fully.",
    run: (s) => {
      const wc = s.intelligence?.signals.content.wordCount;
      if (wc == null) return null;
      if (wc >= 600) return { status: "pass", summary: `${wc.toLocaleString()} words.`, evidence: [{ label: "Words", value: wc }] };
      if (wc >= 300) return { status: "warn", summary: `${wc} words — borderline thin.`, evidence: [{ label: "Words", value: wc }] };
      return { status: "fail", summary: `${wc} words — thin content.`, evidence: [{ label: "Words", value: wc }] };
    },
  },
  {
    id: "alt-coverage",
    title: "Alt text coverage on images",
    category: "content",
    weight: 1.5,
    whyItMatters: "Alt text is read by screen readers, used by Google Image Search, and helps AI assistants caption your page.",
    howToFix: "Add a descriptive `alt` attribute to every meaningful <img>. Use `alt=\"\"` only for decorative images.",
    run: (s) => {
      const ia = s.images;
      if (!ia || ia.totalImages === 0) return null;
      const coverage = 1 - ia.missingAlt.length / ia.totalImages;
      if (coverage >= 0.95) return { status: "pass", summary: `Alt coverage: ${(coverage * 100).toFixed(0)}%.`, evidence: [{ label: "Coverage", value: `${(coverage * 100).toFixed(0)}%` }] };
      if (coverage >= 0.7) return { status: "warn", summary: `${ia.missingAlt.length}/${ia.totalImages} images missing alt.`, evidence: [{ label: "Missing", value: ia.missingAlt.length }], affectedUrls: ia.missingAlt.slice(0, 20) };
      return { status: "fail", summary: `${ia.missingAlt.length}/${ia.totalImages} images missing alt.`, evidence: [{ label: "Missing", value: ia.missingAlt.length }], affectedUrls: ia.missingAlt.slice(0, 20) };
    },
  },
  {
    id: "reading-time",
    title: "Reasonable reading depth",
    category: "content",
    weight: 0.5,
    whyItMatters: "Pages under a minute of reading rarely satisfy informational intent.",
    howToFix: "Add more substance — examples, data, FAQs — until reading time crosses 2 minutes.",
    run: (s) => {
      const r = s.intelligence?.signals.content.readingTimeMinutes;
      if (r == null) return null;
      if (r >= 2) return { status: "pass", summary: `~${r} min read.`, evidence: [{ label: "Reading time", value: `${r} min` }] };
      if (r >= 1) return { status: "warn", summary: `Only ~${r} min read.`, evidence: [{ label: "Reading time", value: `${r} min` }] };
      return { status: "fail", summary: "Under a minute of content.", evidence: [{ label: "Reading time", value: `${r} min` }] };
    },
  },
  {
    id: "duplicate-title-across-pages",
    title: "Page titles unique across the site",
    category: "content",
    weight: 1,
    whyItMatters: "Duplicate titles confuse search engines about which version is canonical and waste SERP real-estate.",
    howToFix: "Make every page title unique. Use the page's topic + brand pattern.",
    run: (s) => {
      const dup = s.intelligence?.signals.content.duplicateTitleAcrossPages;
      if (dup == null) return null;
      if (dup) return { status: "warn", summary: "Duplicate titles detected across crawled pages.", evidence: [] };
      return { status: "pass", summary: "Titles look unique across crawled pages.", evidence: [] };
    },
  },
  {
    id: "no-inline-style-bloat",
    title: "Limited inline <style> bloat",
    category: "content",
    weight: 0.3,
    whyItMatters: "Heavy inline styles inflate the HTML, slow First Contentful Paint, and obscure content from extractors.",
    howToFix: "Move styles into external CSS files. Inline only the critical above-the-fold rules.",
    run: (s) => {
      const styles = s.intelligence?.signals.performance.styles;
      if (styles == null) return null;
      if (styles <= 2) return { status: "pass", summary: `${styles} <style> block(s).`, evidence: [{ label: "Count", value: styles }] };
      return { status: "info", summary: `${styles} <style> block(s) — consider externalising.`, evidence: [{ label: "Count", value: styles }] };
    },
  },
];
