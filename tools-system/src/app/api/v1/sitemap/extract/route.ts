import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { sitemapExtractScraper } from "@/scrapers/sitemap/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  url: urlSchema,
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: sitemapExtractScraper,
  schema,
  fromQuery: (p) => {
    const url = p.get("url");
    return url ? { url, fresh: p.get("fresh") === "true" } : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
