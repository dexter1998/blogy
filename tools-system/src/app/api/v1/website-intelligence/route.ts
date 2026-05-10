import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { websiteIntelligenceScraper } from "@/scrapers/website-intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow long crawls on Vercel — multi-page crawl + sitemap can take 30s+.
export const maxDuration = 120;

const schema = z.object({
  url: urlSchema,
  fresh: z.boolean().optional(),
  depth: z.number().int().min(0).max(25).optional(),
});

const handlers = makeRouteHandler({
  scraper: websiteIntelligenceScraper,
  schema,
  fromQuery: (p) => {
    const url = p.get("url");
    if (!url) return {};
    const depth = p.get("depth");
    return {
      url,
      fresh: p.get("fresh") === "true",
      depth: depth ? Number(depth) : undefined,
    };
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
