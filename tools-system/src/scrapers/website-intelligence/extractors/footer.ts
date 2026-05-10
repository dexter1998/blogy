import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { FooterSignals } from "../types";

const PATTERNS: Array<{ key: keyof FooterSignals["detected"]; re: RegExp }> = [
  { key: "aboutUs", re: /\b(about(?:\s*us)?|company|who we are)\b/i },
  { key: "contact", re: /\b(contact(?:\s*us)?|get in touch|support)\b/i },
  { key: "privacyPolicy", re: /\bprivacy(?:\s*policy)?\b/i },
  { key: "terms", re: /\b(terms|t&c|terms\s*of\s*service|terms\s*&?\s*conditions)\b/i },
  { key: "refundPolicy", re: /\b(refund|return)\s*policy\b/i },
  { key: "shippingPolicy", re: /\b(shipping|delivery)\s*policy\b/i },
  { key: "careers", re: /\b(careers|jobs|hiring|we'?re hiring)\b/i },
  { key: "affiliate", re: /\b(affiliates?|partners?\s*program)\b/i },
  { key: "blog", re: /\b(blog|insights|resources|articles)\b/i },
  { key: "pricing", re: /\b(pricing|plans)\b/i },
];

const ENTITY_RE =
  /\b([A-Z][\w&.,'\- ]{2,80}?\s+(?:Pvt\.?\s*Ltd\.?|Private Limited|LLC|LLP|Inc\.?|Incorporated|Corporation|Corp\.?|Limited|Ltd\.?|GmbH|S\.?A\.?|S\.?L\.?|Pty\.?\s*Ltd\.?))\b/g;

export function extractFooter(ctx: IntelligenceContext): FooterSignals {
  const home = homePage(ctx);
  const $ = home.$;

  const footerEl = $("footer").last();
  const found = footerEl.length > 0;

  const links: FooterSignals["links"] = [];
  if (found) {
    footerEl.find("a[href]").each((_, el) => {
      const href = ($(el).attr("href") ?? "").trim();
      const text = ($(el).text() ?? "").replace(/\s+/g, " ").trim();
      if (!href) return;
      let abs: string;
      try {
        abs = new URL(href, home.finalUrl).toString();
      } catch {
        return;
      }
      links.push({ text: text || abs, href: abs });
    });
  }

  const hayLinks = links.map((l) => `${l.text} ${l.href}`).join("\n");
  const detected = {} as FooterSignals["detected"];
  for (const p of PATTERNS) {
    detected[p.key] = p.re.test(hayLinks);
  }

  // Legal entities — search footer text + visible bottom of page for "X Pvt Ltd"
  const footerText = footerEl.text().replace(/\s+/g, " ").trim();
  const tailText = ($("body").text() ?? "").replace(/\s+/g, " ").trim().slice(-1500);
  const entitySource = `${footerText}\n${tailText}`;
  const matches = Array.from(entitySource.matchAll(ENTITY_RE)).map((m) => m[1]!.trim());
  const legalEntities = Array.from(new Set(matches)).slice(0, 5);

  return {
    found,
    totalLinks: links.length,
    links,
    detected,
    legalEntities,
  };
}
