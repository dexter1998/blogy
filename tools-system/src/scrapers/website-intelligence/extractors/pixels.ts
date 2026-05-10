/**
 * Marketing pixel detection — Facebook/Meta Pixel, Google Ads conversion
 * pixel, LinkedIn Insight, X Pixel, Pinterest tag, TikTok pixel, Reddit.
 *
 * We also pull pixel IDs out of inline scripts / script srcs when we can,
 * which is what an audit report wants to surface.
 */

import type { IntelligenceContext } from "../core/engine";
import type { PixelSignals, PixelEvidence } from "../types";

type Detector = {
  name: PixelEvidence["name"];
  idRegex: RegExp[];
  presenceRegex: RegExp[];
};

const DETECTORS: Detector[] = [
  {
    name: "Meta Pixel",
    presenceRegex: [
      /connect\.facebook\.net\/[^/]+\/fbevents\.js/i,
      /fbq\(['"]init['"]/i,
    ],
    idRegex: [
      /fbq\(\s*['"]init['"]\s*,\s*['"](\d{6,20})['"]/i,
      /facebook\.com\/tr\?id=(\d{6,20})/i,
    ],
  },
  {
    name: "Google Ads",
    presenceRegex: [/AW-\d{6,}/i, /googleadservices\.com\/pagead\/conversion/i],
    idRegex: [/AW-(\d{6,})/i],
  },
  {
    name: "LinkedIn Insight",
    presenceRegex: [/snap\.licdn\.com\/li\.lms-analytics/i, /_linkedin_partner_id/i],
    idRegex: [/_linkedin_partner_id\s*=\s*['"]?(\d{4,})/i],
  },
  {
    name: "X Pixel",
    presenceRegex: [/static\.ads-twitter\.com\/uwt\.js/i, /twq\(['"]config['"]/i],
    idRegex: [/twq\(\s*['"]config['"]\s*,\s*['"]([a-z0-9]+)['"]/i],
  },
  {
    name: "Pinterest Tag",
    presenceRegex: [/s\.pinimg\.com\/ct\/core\.js/i, /pintrk\(['"]load['"]/i],
    idRegex: [/pintrk\(\s*['"]load['"]\s*,\s*['"](\d{6,})['"]/i],
  },
  {
    name: "TikTok Pixel",
    presenceRegex: [/analytics\.tiktok\.com\/i18n\/pixel/i, /ttq\.load/i],
    idRegex: [/ttq\.load\(\s*['"]([A-Z0-9]{12,})['"]/i],
  },
  {
    name: "Reddit Pixel",
    presenceRegex: [/redditstatic\.com\/ads\/pixel\.js/i, /rdt\(['"]init['"]/i],
    idRegex: [/rdt\(\s*['"]init['"]\s*,\s*['"]([a-z0-9_]+)['"]/i],
  },
];

export function extractPixels(ctx: IntelligenceContext): PixelSignals {
  const haystack = `${ctx.allScriptSrcs.join("\n")}\n${ctx.allScriptInline}\n${ctx.combinedHtml}`;
  const detected: PixelEvidence[] = [];

  for (const d of DETECTORS) {
    const hit = d.presenceRegex.some((r) => r.test(haystack));
    if (!hit) continue;
    let id: string | null = null;
    for (const r of d.idRegex) {
      const m = haystack.match(r);
      if (m && m[1]) {
        id = m[1];
        break;
      }
    }
    detected.push({ name: d.name, id });
  }

  return {
    count: detected.length,
    detected,
    /** Convenience flag — SEOptimer-parity. */
    facebookPixelDetected: detected.some((d) => d.name === "Meta Pixel"),
    facebookPixelId: detected.find((d) => d.name === "Meta Pixel")?.id ?? null,
  };
}
