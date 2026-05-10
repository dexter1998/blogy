import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { paaScraper } from "@/scrapers/paa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  query: z.string().min(1).max(200),
  depth: z.union([z.literal(1), z.literal(2)]).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: paaScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const query = p.get("q") ?? p.get("query");
    const depth = p.get("depth");
    return query
      ? { query, depth: depth === "2" ? 2 : 1, fresh: p.get("fresh") === "true" }
      : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
