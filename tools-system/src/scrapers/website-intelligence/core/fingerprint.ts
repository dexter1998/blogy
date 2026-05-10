/**
 * Tiny shared fingerprinting helper. Looks for known signatures across
 * (a) script src URLs, (b) inline script bodies, (c) raw HTML, (d) headers.
 *
 * Patterns are kept pragmatic and conservative — false positives are worse
 * than false negatives because they put bad data in the customer's UI.
 *
 * No remote APIs, no external lookups.
 */

import type { IntelligenceContext, FetchedPage } from "./engine";

export type Match = {
  via: "script-src" | "inline-script" | "html" | "header" | "link" | "meta" | "url";
  sample: string;
};

export type Pattern = {
  name: string;
  /** Match against script src URLs (substring or regex). */
  scriptSrc?: Array<string | RegExp>;
  /** Match against inline script content. */
  inline?: Array<string | RegExp>;
  /** Match against raw HTML. */
  html?: Array<string | RegExp>;
  /** Header lookup: header name lowercased → substring/regex. */
  header?: Record<string, Array<string | RegExp>>;
  /** Match against <link> rel=… href values. */
  link?: Array<string | RegExp>;
  /** Match against <meta name|property|content>. */
  meta?: Array<string | RegExp>;
};

function testStr(haystack: string, p: string | RegExp): string | null {
  if (typeof p === "string") {
    const i = haystack.indexOf(p);
    if (i === -1) return null;
    const start = Math.max(0, i - 20);
    return haystack.slice(start, Math.min(haystack.length, i + p.length + 30));
  }
  const m = haystack.match(p);
  return m ? m[0]!.slice(0, 120) : null;
}

export function findMatches(ctx: IntelligenceContext, patterns: Pattern[]): Array<{
  name: string;
  matches: Match[];
}> {
  const headerMap: Record<string, string> = {};
  for (const p of ctx.pages) {
    for (const [k, v] of Object.entries(p.headers)) {
      // first-seen wins; cheap and good enough for fingerprinting
      if (!(k in headerMap)) headerMap[k] = v;
    }
  }
  const linkBlob = ctx.pages.flatMap((p) => p.links.map((l) => `${l.rel} ${l.href}`)).join("\n");
  const metaBlob = ctx.pages
    .flatMap((p) => {
      const out: string[] = [];
      p.$("meta").each((_, el) => {
        const $el = p.$(el);
        const name = ($el.attr("name") ?? $el.attr("property") ?? "").trim();
        const content = ($el.attr("content") ?? "").trim();
        if (name || content) out.push(`${name}=${content}`);
      });
      return out;
    })
    .join("\n");

  const results: Array<{ name: string; matches: Match[] }> = [];
  for (const pat of patterns) {
    const matches: Match[] = [];

    if (pat.scriptSrc) {
      const blob = ctx.allScriptSrcs.join("\n");
      for (const p of pat.scriptSrc) {
        const s = testStr(blob, p);
        if (s) matches.push({ via: "script-src", sample: s });
      }
    }
    if (pat.inline) {
      for (const p of pat.inline) {
        const s = testStr(ctx.allScriptInline, p);
        if (s) matches.push({ via: "inline-script", sample: s });
      }
    }
    if (pat.html) {
      for (const p of pat.html) {
        const s = testStr(ctx.combinedHtml, p);
        if (s) matches.push({ via: "html", sample: s });
      }
    }
    if (pat.header) {
      for (const [hname, ps] of Object.entries(pat.header)) {
        const v = headerMap[hname.toLowerCase()];
        if (!v) continue;
        for (const p of ps) {
          const s = testStr(v, p);
          if (s) matches.push({ via: "header", sample: `${hname}: ${s}` });
        }
      }
    }
    if (pat.link) {
      for (const p of pat.link) {
        const s = testStr(linkBlob, p);
        if (s) matches.push({ via: "link", sample: s });
      }
    }
    if (pat.meta) {
      for (const p of pat.meta) {
        const s = testStr(metaBlob, p);
        if (s) matches.push({ via: "meta", sample: s });
      }
    }

    if (matches.length) {
      // Deduplicate by `via` to keep evidence list compact.
      const uniq = new Map<string, Match>();
      for (const m of matches) if (!uniq.has(m.via)) uniq.set(m.via, m);
      results.push({ name: pat.name, matches: Array.from(uniq.values()) });
    }
  }
  return results;
}

/** Convenience: header lookup across all pages. */
export function firstHeader(ctx: IntelligenceContext, name: string): string | null {
  const k = name.toLowerCase();
  for (const p of ctx.pages) {
    if (p.headers[k]) return p.headers[k]!;
  }
  return null;
}

export function homePage(ctx: IntelligenceContext): FetchedPage {
  return ctx.pages[0]!;
}
