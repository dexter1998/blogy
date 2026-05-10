import type { IntelligenceContext } from "../core/engine";
import { findMatches, type Pattern } from "../core/fingerprint";
import type { LeadGenSignals } from "../types";

const PATTERNS: Pattern[] = [
  {
    name: "Calendly",
    scriptSrc: [/assets\.calendly\.com\/assets\/external\/widget\.js/i],
    html: [/calendly\.com\/[\w-]+/i],
  },
  {
    name: "Cal.com",
    html: [/cal\.com\/[\w-]+/i],
    scriptSrc: [/cal\.com\/embed/i],
  },
  {
    name: "Typeform",
    scriptSrc: [/embed\.typeform\.com\/next\/embed\.js/i],
    html: [/typeform\.com\/to\//i],
  },
  {
    name: "Tally",
    scriptSrc: [/tally\.so\/widgets\/embed\.js/i],
    html: [/tally\.so\/r\//i],
  },
  {
    name: "Tawk.to",
    scriptSrc: [/embed\.tawk\.to/i],
    inline: [/Tawk_API/i],
  },
  {
    name: "Intercom",
    scriptSrc: [/widget\.intercom\.io|js\.intercomcdn\.com/i],
    inline: [/Intercom\(/i],
  },
  {
    name: "Drift",
    scriptSrc: [/js\.driftt\.com/i],
    inline: [/drift\.load/i],
  },
  {
    name: "Freshchat",
    scriptSrc: [/wchat\.freshchat\.com|fw-cdn\.com\/(?:.+\/)?fc\/widget/i],
  },
  {
    name: "HubSpot Forms",
    scriptSrc: [/js\.hsforms\.net|js\.hsforms\.com/i],
    inline: [/hbspt\.forms/i],
  },
  {
    name: "Crisp Chat",
    scriptSrc: [/client\.crisp\.chat/i],
    inline: [/\$crisp/i],
  },
  {
    name: "Zendesk",
    scriptSrc: [/static\.zdassets\.com\/ekr/i, /zdchat\.io/i],
  },
  {
    name: "LiveChat",
    scriptSrc: [/cdn\.livechatinc\.com/i],
  },
  {
    name: "Chatlio",
    scriptSrc: [/js\.chatlio\.com/i],
  },
];

export function extractLeadGen(ctx: IntelligenceContext): LeadGenSignals {
  const found = findMatches(ctx, PATTERNS);
  return {
    detected: found.map((f) => f.name),
    evidence: found.flatMap((f) =>
      f.matches.map((m) => ({ tool: f.name, via: m.via, sample: m.sample })),
    ),
  };
}
