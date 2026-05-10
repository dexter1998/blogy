import type { IntelligenceContext } from "../core/engine";
import { findMatches, firstHeader, type Pattern } from "../core/fingerprint";
import type { CookieSignals } from "../types";

const PATTERNS: Pattern[] = [
  {
    name: "OneTrust",
    scriptSrc: [/cdn\.cookielaw\.org|onetrust\.com/i],
    inline: [/OneTrust\.|optanon/i],
  },
  {
    name: "CookieYes",
    scriptSrc: [/cookieyes\.com/i],
    inline: [/cookieyes/i],
  },
  {
    name: "Cookiebot",
    scriptSrc: [/consent\.cookiebot\.com/i],
    inline: [/Cookiebot/i],
  },
  {
    name: "TrustArc",
    scriptSrc: [/consent\.trustarc\.com|trustarc\.com\/asset/i],
  },
  {
    name: "Termly",
    scriptSrc: [/app\.termly\.io\/embed/i],
  },
  {
    name: "Iubenda",
    scriptSrc: [/cdn\.iubenda\.com/i],
    inline: [/iubenda/i],
  },
  {
    name: "Quantcast Choice",
    scriptSrc: [/quantcast\.mgr\.consensu\.org|quantcast\.com\/cmpinternal/i],
  },
  {
    name: "Osano",
    scriptSrc: [/cmp\.osano\.com/i],
  },
];

const BANNER_KEYWORDS = /(cookie|consent|gdpr|ccpa)/i;

export function extractCookies(ctx: IntelligenceContext): CookieSignals {
  const found = findMatches(ctx, PATTERNS);
  let consentManager: string | null = found[0]?.name ?? null;

  // Cheap banner detection: visible element with text like "We use cookies"
  let cookieBannerDetected = !!consentManager;
  if (!cookieBannerDetected) {
    for (const p of ctx.pages) {
      const $ = p.$;
      const candidates = $('[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i]');
      candidates.each((_, el) => {
        const t = $(el).text().replace(/\s+/g, " ").trim();
        if (t && BANNER_KEYWORDS.test(t)) cookieBannerDetected = true;
      });
      if (cookieBannerDetected) break;
    }
  }

  // Cookies actually set by server
  const setCookieHdr = firstHeader(ctx, "set-cookie") ?? "";
  const setCookies = setCookieHdr
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.split(";")[0]?.split("=")[0]?.trim())
    .filter((s): s is string => !!s)
    .slice(0, 15);

  return {
    cookieBannerDetected,
    consentManager,
    setCookies,
  };
}
