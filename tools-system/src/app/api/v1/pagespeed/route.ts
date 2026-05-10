import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { pagespeedScraper } from "@/scrapers/pagespeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  url: urlSchema,
  strategy: z.enum(["mobile", "desktop"]).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: pagespeedScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const url = p.get("url");
    const s = p.get("strategy");
    const strategy = s === "desktop" ? "desktop" : s === "mobile" ? "mobile" : undefined;
    return url ? { url, strategy, fresh: p.get("fresh") === "true" } : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
