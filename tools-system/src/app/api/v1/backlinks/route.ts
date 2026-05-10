import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { backlinksScraper } from "@/scrapers/backlinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const singleSchema = z.object({
  url: urlSchema,
  verify: z.boolean().optional(),
  maxVerify: z.number().int().min(1).max(20).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: backlinksScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const url = p.get("url");
    return url
      ? {
          url,
          verify: p.get("verify") === "true",
          maxVerify: p.get("maxVerify") ? Number(p.get("maxVerify")) : undefined,
          fresh: p.get("fresh") === "true",
        }
      : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
