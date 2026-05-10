import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { internalLinksScraper } from "@/scrapers/internal-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const singleSchema = z.object({
  url: urlSchema,
  maxPages: z.number().int().min(5).max(50).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: internalLinksScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const url = p.get("url");
    const mp = p.get("maxPages");
    return url
      ? {
          url,
          maxPages: mp ? Number(mp) : undefined,
          fresh: p.get("fresh") === "true",
        }
      : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
