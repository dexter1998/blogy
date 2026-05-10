import type { IntelligenceContext } from "../core/engine";
import type { SchemaSignals } from "../types";

function getType(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const t = (node as Record<string, unknown>)["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t) && typeof t[0] === "string") return t[0];
  return null;
}

function flatten(node: unknown): unknown[] {
  if (!node || typeof node !== "object") return [];
  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) return obj["@graph"] as unknown[];
  return [obj];
}

export function extractSchema(ctx: IntelligenceContext): SchemaSignals {
  const typeCounts: Record<string, number> = {};
  let jsonLd = 0;
  let microdata = 0;
  let rdfa = 0;

  for (const page of ctx.pages) {
    const $ = page.$;
    $('script[type="application/ld+json"]').each((_, el) => {
      const txt = ($(el).contents().text() ?? "").trim();
      if (!txt) return;
      try {
        const parsed = JSON.parse(txt);
        const nodes = Array.isArray(parsed)
          ? parsed.flatMap(flatten)
          : flatten(parsed);
        for (const n of nodes) {
          jsonLd += 1;
          const type = getType(n) ?? "Unknown";
          typeCounts[type] = (typeCounts[type] ?? 0) + 1;
        }
      } catch {
        jsonLd += 1;
        typeCounts["InvalidJSON"] = (typeCounts["InvalidJSON"] ?? 0) + 1;
      }
    });
    $("[itemtype]").each((_, el) => {
      const itemtype = ($(el).attr("itemtype") ?? "").trim();
      if (!/schema\.org/i.test(itemtype)) return;
      microdata += 1;
      const type = itemtype.split("/").pop() ?? "Unknown";
      typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    });
    $("[typeof]").each(() => {
      rdfa += 1;
    });
  }

  const total = jsonLd + microdata + rdfa;
  return {
    totalItems: total,
    byFormat: { jsonLd, microdata, rdfa },
    detectedTypes: Object.keys(typeCounts),
    typeCounts,
  };
}
