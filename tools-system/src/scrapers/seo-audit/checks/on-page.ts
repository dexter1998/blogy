import type { CheckDef } from "./types";

export const onPageChecks: CheckDef[] = [
  {
    id: "title-present",
    title: "Title tag present",
    category: "on-page",
    weight: 2,
    whyItMatters:
      "The <title> is the primary headline shown in Google search results and the browser tab. Without one, Google generates a fallback title and CTR drops sharply.",
    howToFix:
      "Add a unique, keyword-led <title> in the document <head>, ideally 50–60 characters.",
    run: (s) => {
      const m = s.metadata;
      if (!m) return null;
      const t = m.basic.title?.trim() ?? "";
      if (!t) {
        return {
          status: "fail",
          summary: "Missing <title> tag.",
          evidence: [],
        } as ReturnType<CheckDef["run"]>;
      }
      return {
        status: "pass",
        summary: `Title present (${t.length} chars).`,
        evidence: [{ label: "Title", value: t }],
      };
    },
  },
  {
    id: "title-length",
    title: "Title length within 50–60 characters",
    category: "on-page",
    weight: 1,
    whyItMatters:
      "Titles longer than ~60 chars get truncated in SERPs, shorter than ~30 look thin and waste pixels.",
    howToFix:
      "Trim or expand the title to land in the 50–60 character sweet-spot. Front-load the primary keyword.",
    run: (s) => {
      const m = s.metadata;
      if (!m?.basic.title) return null;
      const len = m.basic.title.length;
      if (len >= 50 && len <= 60) {
        return { status: "pass", summary: `Title length is optimal (${len}).`, evidence: [{ label: "Length", value: len }] };
      }
      if (len < 30 || len > 70) {
        return {
          status: "fail",
          summary: `Title length is ${len} — outside the recommended 50–60 range.`,
          evidence: [{ label: "Length", value: len }],
        };
      }
      return {
        status: "warn",
        summary: `Title length is ${len} — slightly outside the ideal 50–60 range.`,
        evidence: [{ label: "Length", value: len }],
      };
    },
  },
  {
    id: "meta-description-present",
    title: "Meta description present",
    category: "on-page",
    weight: 2,
    whyItMatters:
      "Meta descriptions don't directly affect ranking, but they drive click-through. Missing descriptions let Google pick a random snippet from the page body.",
    howToFix: "Add a unique <meta name=\"description\"> describing the page in 120–160 characters.",
    run: (s) => {
      const m = s.metadata;
      if (!m) return null;
      const d = m.basic.description?.trim() ?? "";
      if (!d) return { status: "fail", summary: "Missing meta description.", evidence: [] };
      return {
        status: "pass",
        summary: `Meta description present (${d.length} chars).`,
        evidence: [{ label: "Description", value: d }],
      };
    },
  },
  {
    id: "meta-description-length",
    title: "Meta description within 120–160 characters",
    category: "on-page",
    weight: 1,
    whyItMatters:
      "Descriptions longer than ~160 chars get truncated; under ~80 look thin and miss the chance to pitch the click.",
    howToFix: "Aim for 120–160 chars. Lead with the value prop and include the primary keyword once.",
    run: (s) => {
      const d = s.metadata?.basic.description;
      if (!d) return null;
      const len = d.length;
      if (len >= 120 && len <= 160) return { status: "pass", summary: `Length is optimal (${len}).`, evidence: [{ label: "Length", value: len }] };
      if (len < 80 || len > 200) return { status: "fail", summary: `Length is ${len} — significantly outside 120–160.`, evidence: [{ label: "Length", value: len }] };
      return { status: "warn", summary: `Length is ${len} — slightly outside 120–160.`, evidence: [{ label: "Length", value: len }] };
    },
  },
  {
    id: "h1-present",
    title: "Exactly one H1 on the page",
    category: "on-page",
    weight: 2,
    whyItMatters:
      "The H1 is the on-page headline. Zero H1s leaves Google guessing the topic; multiple H1s dilute the topical signal.",
    howToFix: "Use exactly one <h1> per page. Make it descriptive and keyword-aligned.",
    run: (s) => {
      const h1s = s.metadata?.headings.h1;
      if (!h1s) return null;
      if (h1s.length === 0) return { status: "fail", summary: "No H1 tag on the page.", evidence: [] };
      if (h1s.length === 1) return { status: "pass", summary: "Exactly one H1.", evidence: [{ label: "H1", value: h1s[0] ?? "" }] };
      return {
        status: "warn",
        summary: `${h1s.length} H1 tags found — should be exactly one.`,
        evidence: [{ label: "H1s", value: h1s }],
      };
    },
  },
  {
    id: "heading-hierarchy",
    title: "Heading hierarchy is well-structured",
    category: "on-page",
    weight: 1,
    whyItMatters:
      "A clean H1 → H2 → H3 outline helps search engines and AI assistants parse the document. Skipping levels is a quality smell.",
    howToFix: "Add H2s for each major section and H3s for sub-sections. Avoid jumping from H1 straight to H4.",
    run: (s) => {
      const intel = s.intelligence?.signals.content.headingHierarchy;
      if (!intel) return null;
      const h2 = intel.h2 ?? 0;
      const h3 = intel.h3 ?? 0;
      if (h2 >= 2 && h3 >= 1) return { status: "pass", summary: `${h2} H2s, ${h3} H3s.`, evidence: [{ label: "H2", value: h2 }, { label: "H3", value: h3 }] };
      if (h2 + h3 === 0) return { status: "fail", summary: "No sub-headings — content has no visible structure.", evidence: [] };
      return { status: "warn", summary: `Only ${h2} H2 / ${h3} H3 — consider adding more structure.`, evidence: [{ label: "H2", value: h2 }, { label: "H3", value: h3 }] };
    },
  },
  {
    id: "canonical-present",
    title: "Canonical tag present",
    category: "on-page",
    weight: 2,
    whyItMatters:
      "Without a canonical, similar URLs (tracking params, mobile variants) can dilute the page's ranking signals.",
    howToFix: "Add <link rel=\"canonical\" href=\"…\"> pointing to the canonical version of the page.",
    run: (s) => {
      const c = s.metadata?.basic.canonical;
      if (s.metadata && !c) return { status: "fail", summary: "No canonical tag.", evidence: [] };
      if (!c) return null;
      return { status: "pass", summary: "Canonical tag present.", evidence: [{ label: "Canonical", value: c }] };
    },
  },
  {
    id: "language-declared",
    title: "Document language declared",
    category: "on-page",
    weight: 0.5,
    whyItMatters: "The lang attribute helps Google serve your content to the right audience and helps screen readers pronounce it.",
    howToFix: "Add a lang attribute to the <html> tag (e.g. <html lang=\"en\">).",
    run: (s) => {
      const lang = s.metadata?.basic.language;
      if (!s.metadata) return null;
      if (!lang) return { status: "warn", summary: "No language attribute on <html>.", evidence: [] };
      return { status: "pass", summary: `Language declared: ${lang}.`, evidence: [{ label: "Lang", value: lang }] };
    },
  },
];
