import type { CheckDef } from "./types";

export const aiReadinessChecks: CheckDef[] = [
  {
    id: "llms-txt",
    title: "/llms.txt published",
    category: "ai-readiness",
    weight: 1,
    whyItMatters:
      "llms.txt is the emerging convention for guiding LLM crawlers to your most important pages — a quick win for AI discoverability.",
    howToFix: "Publish /llms.txt listing your priority pages and a short site description (see llmstxt.org).",
    run: (s) => {
      const has = s.intelligence?.signals.aiReadiness.llmsTxt;
      if (has == null) return null;
      if (has) return { status: "pass", summary: "/llms.txt is published.", evidence: [{ label: "URL", value: s.intelligence?.signals.aiReadiness.llmsTxtUrl ?? "" }] };
      return { status: "warn", summary: "No /llms.txt file.", evidence: [] };
    },
  },
  {
    id: "ai-crawler-allowed",
    title: "AI crawlers are allowed",
    category: "ai-readiness",
    weight: 2,
    whyItMatters: "Blocking GPTBot / ClaudeBot / PerplexityBot in robots.txt removes you from AI-search citations — fine for some sites, fatal for content businesses.",
    howToFix: "Audit /robots.txt for `User-agent: GPTBot|ClaudeBot|PerplexityBot|GoogleOther|CCBot Disallow: /` and remove if unintentional.",
    run: (s) => {
      const bots = s.geo?.aiCrawlers ?? [];
      if (!s.geo) return null;
      const blocked = bots.filter((b) => !b.allowed);
      if (blocked.length === 0) return { status: "pass", summary: `${bots.length} AI crawler(s) are all allowed.`, evidence: [] };
      return { status: blocked.length > 2 ? "fail" : "warn", summary: `${blocked.length} AI crawler(s) blocked: ${blocked.map((b) => b.bot).join(", ")}.`, evidence: blocked.map((b) => ({ label: b.bot, value: b.rule ?? "blocked" })) };
    },
  },
  {
    id: "identity-schema",
    title: "Identity schema (Organization/Person)",
    category: "ai-readiness",
    weight: 1.5,
    whyItMatters: "LLMs prefer to cite entities they can identify. Organization + Person schema makes you a first-class citable source.",
    howToFix: "Add JSON-LD Organization with name, url, logo, sameAs[] (links to LinkedIn, Wikipedia, X).",
    run: (s) => {
      const has = s.geo?.brandSignals.organizationSchema;
      if (has == null) return null;
      if (has) return { status: "pass", summary: "Organization schema is present.", evidence: [] };
      return { status: "warn", summary: "No Organization schema.", evidence: [] };
    },
  },
  {
    id: "citable-passages",
    title: "Citable passages on the page",
    category: "ai-readiness",
    weight: 2,
    whyItMatters: "AI answers are stitched from short, self-contained passages. Pages with definitions, stats, and direct answers get cited far more often.",
    howToFix: "Lead each section with a 1–2 sentence direct answer. Add definitions, named lists, and stats with sources.",
    run: (s) => {
      const n = s.geo?.passages.length ?? 0;
      if (!s.geo) return null;
      if (n >= 5) return { status: "pass", summary: `${n} citable passages.`, evidence: [{ label: "Count", value: n }] };
      if (n >= 2) return { status: "warn", summary: `Only ${n} citable passage(s).`, evidence: [{ label: "Count", value: n }] };
      return { status: "fail", summary: "No clearly citable passages on the page.", evidence: [] };
    },
  },
  {
    id: "answerability-faq",
    title: "FAQ or HowTo structure",
    category: "ai-readiness",
    weight: 1,
    whyItMatters: "FAQ and HowTo schema feeds AI answer engines directly and is one of the few formats that still wins rich results.",
    howToFix: "Add a short FAQ section + FAQPage schema for the 3–5 most common questions on the topic.",
    run: (s) => {
      const a = s.geo?.answerability;
      if (!a) return null;
      if (a.hasFaq || a.hasHowTo) return { status: "pass", summary: `Has ${a.hasFaq ? "FAQ" : "HowTo"} structure.`, evidence: [] };
      return { status: "warn", summary: "No FAQ or HowTo structure.", evidence: [] };
    },
  },
  {
    id: "question-headings",
    title: "Question-style headings",
    category: "ai-readiness",
    weight: 0.5,
    whyItMatters: "Headings phrased as questions match People-Also-Ask + AI prompt patterns directly.",
    howToFix: "Rewrite 2–3 sub-headings as the actual question users ask (e.g. 'How does X work?').",
    run: (s) => {
      const n = s.geo?.answerability.questionHeadings ?? 0;
      if (!s.geo) return null;
      if (n >= 2) return { status: "pass", summary: `${n} question-style headings.`, evidence: [{ label: "Count", value: n }] };
      if (n === 1) return { status: "warn", summary: "Only 1 question-style heading.", evidence: [{ label: "Count", value: n }] };
      return { status: "info", summary: "No question-style headings.", evidence: [] };
    },
  },
  {
    id: "structured-lists",
    title: "Named lists and tables for extraction",
    category: "ai-readiness",
    weight: 0.5,
    whyItMatters: "AI engines love structured data they can lift verbatim — bulleted lists, numbered steps, tables.",
    howToFix: "Convert prose comparisons into <table>s and step-by-step instructions into <ol>s.",
    run: (s) => {
      const a = s.geo?.answerability;
      if (!a) return null;
      const total = a.hasBulletedLists + a.hasNumberedLists + a.hasTables;
      if (total >= 3) return { status: "pass", summary: `${a.hasBulletedLists} lists, ${a.hasNumberedLists} ordered lists, ${a.hasTables} tables.`, evidence: [{ label: "Lists", value: total }] };
      if (total >= 1) return { status: "warn", summary: "Limited structured content.", evidence: [{ label: "Lists", value: total }] };
      return { status: "fail", summary: "No lists or tables for extraction.", evidence: [] };
    },
  },
  {
    id: "geo-score",
    title: "Overall GEO citability score",
    category: "ai-readiness",
    weight: 2,
    whyItMatters: "A composite of citability + AI access + brand signals + answerability — captures how 'liftable' your content is for AI.",
    howToFix: "Work through the individual AI Readiness recommendations above.",
    run: (s) => {
      const score = s.geo?.scores.overall;
      if (score == null) return null;
      if (score >= 80) return { status: "pass", summary: `GEO score: ${score}/100.`, evidence: [{ label: "Score", value: score }] };
      if (score >= 60) return { status: "warn", summary: `GEO score: ${score}/100.`, evidence: [{ label: "Score", value: score }] };
      return { status: "fail", summary: `GEO score: ${score}/100.`, evidence: [{ label: "Score", value: score }] };
    },
  },
];
