import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { ContentSignals } from "../types";

export function extractContent(ctx: IntelligenceContext): ContentSignals {
  let totalWords = 0;
  const titles = new Set<string>();
  for (const p of ctx.pages) {
    const $ = p.$;
    const clone = $("body").clone();
    clone.find("script,style,noscript,template").remove();
    const text = clone.text().replace(/\s+/g, " ").trim();
    totalWords += text ? text.split(/\s+/).length : 0;
    const t = ($("title").first().text() ?? "").trim();
    if (t) titles.add(t);
  }
  const home = homePage(ctx);
  const $ = home.$;
  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;
  const h4 = $("h4").length;

  return {
    wordCount: totalWords,
    language: $("html").attr("lang")?.trim() || null,
    headingHierarchy: { h1, h2, h3, h4 },
    duplicateTitleAcrossPages: titles.size === 1 && ctx.pages.length > 1,
    readingTimeMinutes: Math.max(1, Math.round(totalWords / 220)),
    pagesAnalyzed: ctx.pages.length,
  };
}
