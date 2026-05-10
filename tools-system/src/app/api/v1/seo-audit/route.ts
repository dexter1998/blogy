import { z } from "zod";
import { urlSchema } from "@/lib/validation/url";
import { makeRouteHandler } from "@/lib/route-helpers";
import { seoAuditScraper } from "@/scrapers/seo-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 2 pagespeed calls + website-intelligence crawl + image HEAD audit can
// run 30–60s on a cold cache; give Vercel headroom.
export const maxDuration = 120;

const singleSchema = z.object({
  url: urlSchema,
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: seoAuditScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const url = p.get("url");
    return url ? { url, fresh: p.get("fresh") === "true" } : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
