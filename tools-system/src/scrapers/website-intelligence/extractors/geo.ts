import type { IntelligenceContext } from "../core/engine";
import type { GeoSignals } from "../types";

const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

export function extractGeo(ctx: IntelligenceContext): GeoSignals {
  const phones = new Set<string>();
  const emails = new Set<string>();
  const addresses = new Set<string>();
  const cities = new Set<string>();
  const mapLinks = new Set<string>();
  let hasLocalBusinessSchema = false;

  for (const p of ctx.pages) {
    const $ = p.$;
    // Phone / email — search visible text only
    const text = $("body").clone().find("script,style").remove().end().text();
    for (const m of text.match(PHONE_RE) ?? []) {
      const cleaned = m.replace(/\s+/g, " ").trim();
      const digits = cleaned.replace(/\D/g, "");
      if (digits.length >= 8 && digits.length <= 15) phones.add(cleaned);
    }
    for (const m of text.match(EMAIL_RE) ?? []) emails.add(m.toLowerCase());

    // tel:/mailto: cover anything obfuscated
    $('a[href^="tel:"]').each((_, el) => {
      const v = ($(el).attr("href") ?? "").replace(/^tel:/i, "").trim();
      if (v) phones.add(v);
    });
    $('a[href^="mailto:"]').each((_, el) => {
      const v = ($(el).attr("href") ?? "").replace(/^mailto:/i, "").trim();
      if (v) emails.add(v.toLowerCase());
    });

    // Map links
    $('a[href*="google.com/maps"], a[href*="goo.gl/maps"], a[href*="maps.app.goo.gl"], a[href*="openstreetmap.org"]').each((_, el) => {
      const v = ($(el).attr("href") ?? "").trim();
      if (v) mapLinks.add(v);
    });

    // Address microdata + JSON-LD
    $('[itemtype*="PostalAddress"]').each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t && t.length < 300) addresses.add(t);
    });
    $('script[type="application/ld+json"]').each((_, el) => {
      const txt = $(el).contents().text();
      if (/"@type"\s*:\s*"LocalBusiness"/.test(txt)) hasLocalBusinessSchema = true;
      const addrMatches = txt.match(/"streetAddress"\s*:\s*"([^"]+)"/g) ?? [];
      for (const a of addrMatches) {
        const m = a.match(/"streetAddress"\s*:\s*"([^"]+)"/);
        if (m && m[1]) addresses.add(m[1]);
      }
      const cityMatches = txt.match(/"addressLocality"\s*:\s*"([^"]+)"/g) ?? [];
      for (const c of cityMatches) {
        const m = c.match(/"addressLocality"\s*:\s*"([^"]+)"/);
        if (m && m[1]) cities.add(m[1]);
      }
    });
  }

  return {
    addresses: Array.from(addresses).slice(0, 10),
    cities: Array.from(cities).slice(0, 10),
    phones: Array.from(phones).slice(0, 10),
    emails: Array.from(emails).slice(0, 10),
    mapLinks: Array.from(mapLinks).slice(0, 10),
    hasLocalBusinessSchema,
  };
}
