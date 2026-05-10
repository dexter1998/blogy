import type { IntelligenceContext } from "../core/engine";
import { findMatches, type Pattern } from "../core/fingerprint";
import type { AdsSignals } from "../types";

const PATTERNS: Pattern[] = [
  {
    name: "Google AdSense",
    scriptSrc: [/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/i],
    inline: [/\(adsbygoogle = window\.adsbygoogle/i],
    html: [/data-ad-client="ca-pub-/i],
  },
  {
    name: "Google Ad Manager",
    scriptSrc: [/securepubads\.g\.doubleclick\.net\/tag\/js\/gpt\.js/i],
    inline: [/googletag\.cmd\.push/i],
  },
  {
    name: "Google Ads Conversion",
    inline: [/gtag\(['"]event['"],\s*['"]conversion['"]/i, /AW-\d+/],
  },
  {
    name: "Taboola",
    scriptSrc: [/cdn\.taboola\.com\/libtrc/i],
    inline: [/_taboola\.push/i],
  },
  {
    name: "Outbrain",
    scriptSrc: [/widgets\.outbrain\.com\/outbrain\.js/i],
    inline: [/OBR/i],
  },
  {
    name: "Mediavine",
    scriptSrc: [/scripts\.mediavine\.com/i],
  },
  {
    name: "Ezoic",
    scriptSrc: [/the\.gatekeeperconsent\.com|ezoic\.net/i],
  },
  {
    name: "AdThrive / Raptive",
    scriptSrc: [/ads\.adthrive\.com|btloader\.com/i],
  },
  {
    name: "Amazon Affiliates",
    scriptSrc: [/amazon-adsystem\.com/i],
    html: [/amzn\.to\/[\w]+/i],
  },
  {
    name: "Impact (impact.com)",
    scriptSrc: [/d\.impactcdn\.com/i],
  },
  {
    name: "Awin",
    scriptSrc: [/dwin1\.com\/[\w/]+/i],
  },
];

export function extractAds(ctx: IntelligenceContext): AdsSignals {
  const found = findMatches(ctx, PATTERNS);
  return {
    detected: found.map((f) => f.name),
    evidence: found.flatMap((f) =>
      f.matches.map((m) => ({ network: f.name, via: m.via, sample: m.sample })),
    ),
  };
}
