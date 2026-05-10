import type { IntelligenceContext } from "../core/engine";
import { homePage, firstHeader } from "../core/fingerprint";
import { extractTechStack } from "./techstack";
import type { CMSSignals } from "../types";

export function extractCMS(ctx: IntelligenceContext): CMSSignals {
  const home = homePage(ctx);
  const generator =
    home.$('meta[name="generator"]').attr("content")?.trim() || null;
  const tech = extractTechStack(ctx);
  const cms = tech.cms[0] ?? null;
  const evidence: string[] = [];
  if (generator) evidence.push(`<meta generator>: ${generator}`);
  const xpb = firstHeader(ctx, "x-powered-by");
  if (xpb) evidence.push(`x-powered-by: ${xpb}`);
  for (const e of tech.evidence.filter((e) => tech.cms.includes(e.tech))) {
    evidence.push(`${e.tech} (${e.via}): ${e.sample}`);
  }
  return {
    cms,
    generator,
    evidence: evidence.slice(0, 8),
  };
}
