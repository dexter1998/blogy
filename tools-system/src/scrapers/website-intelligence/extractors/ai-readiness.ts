import { httpGet } from "@/scrapers/_shared/http";
import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { AIReadinessSignals } from "../types";

export async function extractAIReadiness(
  ctx: IntelligenceContext,
): Promise<AIReadinessSignals> {
  const llmsUrl = `${ctx.origin}/llms.txt`;
  const llmsRes = await httpGet(llmsUrl, { timeoutMs: 5000 });
  const llmsTxt = llmsRes.ok && /^#/.test((llmsRes.body ?? "").trim());

  const home = homePage(ctx);
  const $ = home.$;
  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;
  const semanticHeadings = h1 >= 1 && h2 + h3 >= 3;

  // FAQ depth: count question-style h2/h3 + dt elements + FAQ schema items
  let faqDepth = 0;
  $("h2, h3").each((_, el) => {
    if (/\?\s*$/.test($(el).text().trim())) faqDepth += 1;
  });
  faqDepth += $("dt").length;

  // Author entities from common selectors
  const authors = new Set<string>();
  $('[rel="author"], .author, .byline, [itemprop="author"]').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t && t.length < 60) authors.add(t);
  });
  $('meta[name="author"]').each((_, el) => {
    const v = ($(el).attr("content") ?? "").trim();
    if (v) authors.add(v);
  });

  // Citable blocks: paragraphs over 80 chars surrounded by headings (rough chunkability)
  let citableBlocks = 0;
  $("p").each((_, el) => {
    const t = $(el).text().trim();
    if (t.length >= 80 && t.length <= 600) citableBlocks += 1;
  });

  // Schema indicators
  let hasFaqSchema = false;
  let hasArticleSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).contents().text();
    if (/"@type"\s*:\s*"FAQPage"/.test(txt)) hasFaqSchema = true;
    if (/"@type"\s*:\s*"(?:Article|NewsArticle|BlogPosting)"/.test(txt))
      hasArticleSchema = true;
  });

  return {
    llmsTxt,
    llmsTxtUrl: llmsTxt ? llmsUrl : null,
    semanticHeadings,
    faqDepth,
    authorEntities: Array.from(authors).slice(0, 10),
    citableBlocks,
    hasFaqSchema,
    hasArticleSchema,
  };
}
