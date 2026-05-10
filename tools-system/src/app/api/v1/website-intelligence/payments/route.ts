import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { paymentsSubScraper } from "@/scrapers/website-intelligence/sub-scrapers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  url: urlSchema,
  fresh: z.boolean().optional(),
  depth: z.number().int().min(0).max(8).optional(),
});

const handlers = makeRouteHandler({
  scraper: paymentsSubScraper,
  schema,
  fromQuery: (p) => {
    const url = p.get("url");
    return url ? { url, fresh: p.get("fresh") === "true" } : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
