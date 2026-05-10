/**
 * Metadata scoring engine. Pure function: extracted metadata → category
 * scores + issue list. Issues are deduplicated by field+severity so the
 * same problem is never reported twice.
 */

import type { MetadataIssue, MetadataResult } from "@/scrapers/metadata/types";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function scoreMetadata(r: MetadataResult): {
  scores: MetadataResult["scores"];
  issues: MetadataIssue[];
} {
  const issues: MetadataIssue[] = [];
  const add = (severity: MetadataIssue["severity"], field: string, message: string) =>
    issues.push({ severity, field, message });

  // ─── Basic ─────────────────────────────────────────────────────
  let basic = 0;
  const title = r.basic.title;
  if (!title) add("error", "title", "Missing <title> tag");
  else {
    const len = title.length;
    if (len < 10) add("warning", "title", `Title is too short (${len} chars). Aim for 30–60.`);
    else if (len > 70) add("warning", "title", `Title is too long (${len} chars). Aim for 30–60.`);
    if (len >= 10 && len <= 70) basic += 25;
    else if (len > 0) basic += 10;
  }

  const desc = r.basic.description;
  if (!desc) add("error", "meta_description", "Missing meta description");
  else {
    const len = desc.length;
    if (len < 50) add("warning", "meta_description", `Description is too short (${len} chars). Aim for 120–160.`);
    else if (len > 170) add("warning", "meta_description", `Description is too long (${len} chars). Aim for 120–160.`);
    if (len >= 50 && len <= 170) basic += 20;
    else if (len > 0) basic += 8;
  }

  if (r.basic.canonical) basic += 15;
  else add("warning", "canonical", "No canonical URL declared");

  if (r.basic.viewport) basic += 10;
  else add("error", "viewport", "Missing viewport meta tag — page is not mobile-ready");

  if (r.basic.language) basic += 10;
  else add("warning", "lang", "No <html lang> declared");

  if (r.basic.charset) basic += 5;
  if (r.basic.favicon) basic += 5;
  if (r.basic.themeColor) basic += 5;
  if (r.basic.robots && /noindex/i.test(r.basic.robots))
    add("error", "robots", "Page is marked noindex");
  else basic += 5;

  if (r.headings.h1.length === 0)
    add("error", "h1", "No <h1> heading on page");
  else if (r.headings.h1.length > 2)
    add("warning", "h1", `${r.headings.h1.length} <h1> tags found. Use only one.`);

  // ─── Social ────────────────────────────────────────────────────
  let social = 0;
  if (r.openGraph.title) social += 15;
  else add("warning", "og:title", "Missing og:title — link previews will fall back to <title>");
  if (r.openGraph.description) social += 15;
  if (r.openGraph.image) social += 25;
  else add("warning", "og:image", "No og:image — social cards will be plain links");
  if (r.openGraph.type) social += 5;
  if (r.openGraph.url) social += 5;
  if (r.openGraph.siteName) social += 5;
  if (r.twitter.card) social += 15;
  else add("info", "twitter:card", "No twitter:card declared");
  if (r.twitter.image || r.openGraph.image) social += 10;
  if (r.twitter.title || r.openGraph.title) social += 5;

  // ─── International ────────────────────────────────────────────
  let international = 0;
  if (r.hreflang.length === 0) {
    international = 60; // not international = full marks for "not applicable"
    add("info", "hreflang", "No hreflang tags — fine for single-locale sites");
  } else {
    international += 30;
    const hasXDefault = r.hreflang.some((h) => h.hreflang === "x-default");
    if (hasXDefault) international += 30;
    else add("warning", "hreflang", "Missing x-default hreflang");
    const codes = new Set(r.hreflang.map((h) => h.hreflang));
    if (codes.size === r.hreflang.length) international += 20;
    else add("warning", "hreflang", "Duplicate hreflang codes detected");
    const langPattern = /^([a-z]{2,3})(-[A-Za-z]{2,4})?$|^x-default$/;
    const invalid = r.hreflang.find((h) => !langPattern.test(h.hreflang));
    if (invalid) add("error", "hreflang", `Invalid hreflang code: ${invalid.hreflang}`);
    else international += 20;
  }

  const scores = {
    basic: clamp(basic),
    social: clamp(social),
    international: clamp(international),
    overall: 0,
  };
  scores.overall = Math.round(
    scores.basic * 0.55 + scores.social * 0.3 + scores.international * 0.15,
  );

  return { scores, issues };
}
