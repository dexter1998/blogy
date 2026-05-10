/**
 * Schema.org structured-data extractor. Counts JSON-LD blocks + microdata
 * itemscope tags. Per spec at https://schema.org and Google's structured-data
 * guidelines, presence of valid schema is a real-world ranking + trust signal.
 */

import * as cheerio from "cheerio";

export type SchemaReading = {
  jsonLdCount: number;
  microdataCount: number;
  detectedTypes: string[];
  hasOrganization: boolean;
  hasWebSite: boolean;
  hasBreadcrumb: boolean;
};

function collectTypes(node: unknown, out: Set<string>) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) collectTypes(n, out);
    return;
  }
  if (typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") out.add(t);
  else if (Array.isArray(t)) t.forEach((s) => typeof s === "string" && out.add(s));
  for (const k of Object.keys(obj)) {
    if (k === "@context") continue;
    const v = obj[k];
    if (typeof v === "object" && v !== null) collectTypes(v, out);
  }
}

export function extractSchema(html: string): SchemaReading {
  const $ = cheerio.load(html);
  const types = new Set<string>();

  let jsonLdCount = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLdCount += 1;
    try {
      const parsed = JSON.parse($(el).text());
      collectTypes(parsed, types);
    } catch {
      /* malformed schema is its own signal but not fatal */
    }
  });

  const microdataCount = $('[itemscope]').length;
  $('[itemtype]').each((_, el) => {
    const it = $(el).attr("itemtype") ?? "";
    const m = it.match(/schema\.org\/(\w+)/);
    if (m) types.add(m[1]!);
  });

  const detected = Array.from(types);
  return {
    jsonLdCount,
    microdataCount,
    detectedTypes: detected,
    hasOrganization: detected.some((t) => /^(Organization|Corporation|LocalBusiness)$/.test(t)),
    hasWebSite: detected.includes("WebSite"),
    hasBreadcrumb: detected.includes("BreadcrumbList"),
  };
}
