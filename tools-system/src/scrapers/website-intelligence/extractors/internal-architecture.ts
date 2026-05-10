import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { InternalArchitectureSignals } from "../types";

export function extractInternalArchitecture(
  ctx: IntelligenceContext,
): InternalArchitectureSignals {
  const internalCount = new Map<string, number>();
  const externalDomains = new Set<string>();
  const anchorCount = new Map<string, number>();
  let totalInternal = 0;
  let totalExternal = 0;

  for (const page of ctx.pages) {
    for (const l of page.internalLinks) {
      totalInternal += 1;
      internalCount.set(l.href, (internalCount.get(l.href) ?? 0) + 1);
      const a = l.text.slice(0, 60);
      if (a) anchorCount.set(a, (anchorCount.get(a) ?? 0) + 1);
    }
    for (const l of page.externalLinks) {
      totalExternal += 1;
      try {
        externalDomains.add(new URL(l.href).hostname.replace(/^www\./, ""));
      } catch {
        /* ignore */
      }
    }
  }

  // Nav menu links: pull from header/nav of the home page only.
  const home = homePage(ctx);
  const navMenuLinks: InternalArchitectureSignals["navMenuLinks"] = [];
  const navSeen = new Set<string>();
  home.$("header a[href], nav a[href]").each((_, el) => {
    const $el = home.$(el);
    const href = ($el.attr("href") ?? "").trim();
    if (!href) return;
    let abs: string;
    try {
      abs = new URL(href, home.finalUrl).toString();
    } catch {
      return;
    }
    if (navSeen.has(abs)) return;
    navSeen.add(abs);
    const text = ($el.text() ?? "").replace(/\s+/g, " ").trim();
    navMenuLinks.push({ text: text || abs, href: abs });
  });

  const topAnchors = Array.from(anchorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([anchor, count]) => ({ anchor, count }));

  const internalSample = Array.from(internalCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([url, count]) => ({ url, count }));

  return {
    totalInternalLinks: totalInternal,
    totalExternalLinks: totalExternal,
    uniqueInternalUrls: internalCount.size,
    uniqueExternalDomains: externalDomains.size,
    navMenuLinks: navMenuLinks.slice(0, 30),
    topAnchors,
    pagesCrawled: ctx.pages.length,
    internalSample,
  };
}
