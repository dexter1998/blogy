import type { IntelligenceContext } from "../core/engine";
import type { FormSignals } from "../types";

export function extractForms(ctx: IntelligenceContext): FormSignals {
  let totalForms = 0;
  let newsletterForms = 0;
  let contactForms = 0;
  let searchForms = 0;
  let popups = 0;
  let ctaButtons = 0;
  let bookingWidgets = 0;

  for (const p of ctx.pages) {
    const $ = p.$;
    $("form").each((_, el) => {
      totalForms += 1;
      const txt = ($(el).text() + " " + ($(el).attr("action") ?? "") + " " + ($(el).attr("class") ?? "") +
        " " + $(el).find("input").map((_i, ipt) => $(ipt).attr("name") ?? "").get().join(" "))
        .toLowerCase();
      if (/\b(subscribe|newsletter|email\s*updates|signup\s*for\s*updates)\b/.test(txt)) newsletterForms += 1;
      if (/\b(contact|message|enquir|inquire|get\s*in\s*touch)\b/.test(txt)) contactForms += 1;
      if (/\bsearch\b/.test(txt) || $(el).attr("role") === "search") searchForms += 1;
    });

    // Popups / modals (heuristic)
    popups += $('[class*="modal" i],[class*="popup" i],[role="dialog"]').length;

    // CTA buttons
    $('a[class*="btn" i], a[class*="cta" i], button[class*="btn" i], button[class*="cta" i]')
      .each((_, el) => {
        const t = ($(el).text() ?? "").trim();
        if (t && t.length > 2) ctaButtons += 1;
      });

    // Booking widgets
    bookingWidgets += $('[class*="calendly" i],[class*="tidycal" i],[class*="cal-com" i],[data-cal-link]').length;
  }

  return {
    totalForms,
    newsletterForms,
    contactForms,
    searchForms,
    popups,
    ctaButtons,
    bookingWidgets,
  };
}
