import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { serpScraper } from "@/scrapers/serp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  query: z.string().min(1).max(200),
  region: z.string().min(2).max(10).optional(),
  fresh: z.boolean().optional(),
});

const bulkSchema = z
  .object({
    queries: z.array(z.string().min(1).max(200)).min(1).max(10),
    region: z.string().min(2).max(10).optional(),
    fresh: z.boolean().optional(),
  })
  .transform((d) => ({ items: d.queries, fresh: d.fresh, region: d.region }));

const handlers = makeRouteHandler({
  scraper: serpScraper,
  schema: singleSchema,
  bulk: {
    schema: bulkSchema as unknown as z.ZodType<{ items: string[]; fresh?: boolean; debug?: boolean }>,
    toInput: (query: string, opts) => ({ query, fresh: opts.fresh }),
    fieldName: "queries",
  },
  fromQuery: (p) => {
    const query = p.get("q") ?? p.get("query");
    return query
      ? {
          query,
          region: p.get("region") ?? undefined,
          fresh: p.get("fresh") === "true",
        }
      : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
