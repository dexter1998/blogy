import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { geoScraper } from "@/scrapers/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  url: urlSchema,
  query: z.string().min(1).max(200).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: geoScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const url = p.get("url");
    return url
      ? { url, query: p.get("query") ?? undefined, fresh: p.get("fresh") === "true" }
      : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
