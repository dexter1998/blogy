import type { CheckDef } from "./types";

export const socialChecks: CheckDef[] = [
  {
    id: "og-tags",
    title: "Open Graph tags present",
    category: "social",
    weight: 1.5,
    whyItMatters: "OG tags control how the page looks when shared on Facebook, LinkedIn, WhatsApp, Slack, and most messaging apps.",
    howToFix: "Add og:title, og:description, og:image (1200×630), and og:url to <head>.",
    run: (s) => {
      const og = s.metadata?.openGraph;
      if (!og) return null;
      const filled = ["title", "description", "image"].filter((k) => og[k as keyof typeof og]).length;
      if (filled === 3) return { status: "pass", summary: "All key OG tags present.", evidence: [] };
      if (filled >= 1) return { status: "warn", summary: `${filled}/3 key OG tags present.`, evidence: [] };
      return { status: "fail", summary: "No Open Graph tags.", evidence: [] };
    },
  },
  {
    id: "twitter-card",
    title: "Twitter Card configured",
    category: "social",
    weight: 0.5,
    whyItMatters: "Twitter/X uses its own Card markup for unfurls. Falls back to OG, but explicit cards control image dimensions.",
    howToFix: "Add <meta name=\"twitter:card\" content=\"summary_large_image\"> + twitter:title, description, image.",
    run: (s) => {
      const tw = s.metadata?.twitter;
      if (!tw) return null;
      if (tw.card) return { status: "pass", summary: `Twitter Card: ${tw.card}.`, evidence: [{ label: "Card", value: tw.card }] };
      return { status: "info", summary: "No Twitter Card meta.", evidence: [] };
    },
  },
  {
    id: "social-profiles",
    title: "Social profiles linked",
    category: "social",
    weight: 1,
    whyItMatters: "Linked social profiles feed sameAs in Organization schema and strengthen entity disambiguation for Google + LLMs.",
    howToFix: "Link to your active social profiles (LinkedIn, X, Instagram, YouTube) in the footer.",
    run: (s) => {
      const platforms = s.intelligence?.signals.social.byPlatform;
      if (!platforms) return null;
      const n = Object.keys(platforms).length;
      if (n >= 3) return { status: "pass", summary: `${n} social platforms linked.`, evidence: [{ label: "Platforms", value: Object.keys(platforms) }] };
      if (n >= 1) return { status: "warn", summary: `Only ${n} social platform linked.`, evidence: [{ label: "Platforms", value: Object.keys(platforms) }] };
      return { status: "fail", summary: "No social profiles linked.", evidence: [] };
    },
  },
  {
    id: "analytics-installed",
    title: "Web analytics installed",
    category: "social",
    weight: 0.5,
    whyItMatters: "You can't optimise what you don't measure. GA4, Plausible, or a self-hosted alternative is table-stakes.",
    howToFix: "Install GA4 (or a privacy-friendly alternative) and verify the tag fires on every page.",
    run: (s) => {
      const a = s.intelligence?.signals.analytics.detected;
      if (!a) return null;
      if (a.length >= 1) return { status: "pass", summary: `Detected: ${a.join(", ")}.`, evidence: [{ label: "Tools", value: a }] };
      return { status: "fail", summary: "No analytics detected.", evidence: [] };
    },
  },
  {
    id: "marketing-pixel",
    title: "At least one marketing pixel (if running paid)",
    category: "social",
    weight: 0.3,
    whyItMatters: "Without a pixel (Meta, Google Ads, LinkedIn) you can't retarget visitors or measure ad conversions.",
    howToFix: "Install the relevant pixel if you plan to run paid traffic. Not needed for purely organic sites.",
    run: (s) => {
      const pixels = s.intelligence?.signals.pixels;
      if (!pixels) return null;
      if (pixels.count >= 1) return { status: "pass", summary: `${pixels.count} pixel(s) installed: ${pixels.detected.map((d) => d.name).join(", ")}.`, evidence: pixels.detected.map((d) => ({ label: d.name, value: d.id ?? "—" })) };
      return { status: "info", summary: "No marketing pixels installed.", evidence: [] };
    },
  },
];
