import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import { extractFooter } from "./footer";
import { extractSchema } from "./schema";
import type { TrustSignals } from "../types";

const REVIEW_HOSTS: Record<string, RegExp> = {
  trustpilot: /trustpilot\.com\/review\//i,
  g2: /g2\.com\/(?:products|companies)\//i,
  capterra: /capterra\.com\/p\//i,
};

export function extractTrust(ctx: IntelligenceContext): TrustSignals {
  const footer = extractFooter(ctx);
  const schema = extractSchema(ctx);

  let trustpilotLink: string | null = null;
  let g2Link: string | null = null;
  let capterraLink: string | null = null;

  for (const p of ctx.pages) {
    p.$("a[href]").each((_, el) => {
      const href = (p.$(el).attr("href") ?? "").trim();
      if (!href) return;
      if (!trustpilotLink && REVIEW_HOSTS.trustpilot!.test(href)) trustpilotLink = href;
      if (!g2Link && REVIEW_HOSTS.g2!.test(href)) g2Link = href;
      if (!capterraLink && REVIEW_HOSTS.capterra!.test(href)) capterraLink = href;
    });
  }

  // Year founded — look for "Since YYYY", "© YYYY", or schema foundingDate.
  let yearFounded: number | null = null;
  const home = homePage(ctx);
  const footerText = home.$("footer").text();
  const sinceMatch =
    footerText.match(/©\s*(\d{4})/) ||
    footerText.match(/since\s+(\d{4})/i);
  if (sinceMatch && sinceMatch[1]) {
    const y = parseInt(sinceMatch[1]!, 10);
    if (y > 1990 && y <= new Date().getFullYear()) yearFounded = y;
  }
  for (const p of ctx.pages) {
    p.$('script[type="application/ld+json"]').each((_, el) => {
      const txt = p.$(el).contents().text();
      const m = txt.match(/"foundingDate"\s*:\s*"(\d{4})/);
      if (m && m[1]) {
        const y = parseInt(m[1], 10);
        if (!yearFounded || y < yearFounded) yearFounded = y;
      }
    });
  }

  return {
    hasContactPage: footer.detected.contact,
    hasAboutPage: footer.detected.aboutUs,
    hasPrivacyPolicy: footer.detected.privacyPolicy,
    hasTermsPage: footer.detected.terms,
    hasOrganizationSchema:
      schema.detectedTypes.includes("Organization") ||
      schema.detectedTypes.includes("LocalBusiness"),
    trustpilotLink,
    g2Link,
    capterraLink,
    yearFounded,
  };
}
