import type { IntelligenceContext } from "../core/engine";
import { findMatches, type Pattern } from "../core/fingerprint";
import type { AnalyticsSignals } from "../types";

const PATTERNS: Pattern[] = [
  {
    name: "Google Analytics 4",
    scriptSrc: [/googletagmanager\.com\/gtag\/js\?id=G-/i],
    inline: [/gtag\(['"]config['"],\s*['"]G-/i],
  },
  {
    name: "Universal Analytics",
    scriptSrc: [/google-analytics\.com\/analytics\.js/i, /ga\.js/i],
    inline: [/ga\(['"]create['"],\s*['"]UA-/i],
  },
  {
    name: "Google Tag Manager",
    scriptSrc: [/googletagmanager\.com\/gtm\.js/i],
    inline: [/'gtm\.start'|GTM-[A-Z0-9]{4,}/i],
  },
  {
    name: "Meta Pixel",
    scriptSrc: [/connect\.facebook\.net\/[^/]+\/fbevents\.js/i],
    inline: [/fbq\(['"]init['"]/i],
  },
  {
    name: "Hotjar",
    scriptSrc: [/static\.hotjar\.com\/c\/hotjar-/i],
    inline: [/_hjSettings/i],
  },
  {
    name: "Microsoft Clarity",
    scriptSrc: [/clarity\.ms\/tag/i],
    inline: [/window\.clarity/i],
  },
  {
    name: "Segment",
    scriptSrc: [/cdn\.segment\.com\/analytics\.js/i],
    inline: [/analytics\.load\(/i],
  },
  {
    name: "Mixpanel",
    scriptSrc: [/cdn\.mxpnl\.com\/libs\/mixpanel/i, /mixpanel-[a-z0-9-]+\.js/i],
    inline: [/mixpanel\.init/i],
  },
  {
    name: "HubSpot",
    scriptSrc: [/js\.hs-scripts\.com|js\.hs-analytics\.net/i],
    inline: [/_hsq\.push/i],
  },
  {
    name: "Plausible",
    scriptSrc: [/plausible\.io\/js\/script/i],
  },
  {
    name: "Fathom",
    scriptSrc: [/cdn\.usefathom\.com\/script\.js/i],
  },
  {
    name: "Amplitude",
    scriptSrc: [/cdn\.amplitude\.com|cdn\.eu\.amplitude\.com/i],
    inline: [/amplitude\.getInstance/i],
  },
  {
    name: "PostHog",
    scriptSrc: [/app\.posthog\.com\/static\/array\.js|posthog\.com\/static/i],
    inline: [/posthog\.init/i],
  },
  {
    name: "Heap",
    scriptSrc: [/heapanalytics\.com\/js\/heap-/i],
    inline: [/heap\.load\(/i],
  },
  {
    name: "Pendo",
    scriptSrc: [/cdn\.pendo\.io\/agent/i],
  },
  {
    name: "Matomo",
    scriptSrc: [/matomo\.js|piwik\.js/i],
    inline: [/_paq\.push/i],
  },
];

export function extractAnalytics(ctx: IntelligenceContext): AnalyticsSignals {
  const found = findMatches(ctx, PATTERNS);
  return {
    detected: found.map((f) => f.name),
    evidence: found.flatMap((f) =>
      f.matches.map((m) => ({ tool: f.name, via: m.via, sample: m.sample })),
    ),
  };
}
