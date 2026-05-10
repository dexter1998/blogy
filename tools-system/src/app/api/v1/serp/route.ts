import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { serpScraper } from "@/scrapers/serp";
import { ALL_ENGINE_IDS, type EngineId } from "@/scrapers/_shared/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const engineSchema = z.enum(ALL_ENGINE_IDS as [EngineId, ...EngineId[]]);

const singleSchema = z.object({
  query: z.string().min(1).max(200),
  country: z.string().min(2).max(3).optional(),
  engines: z.array(engineSchema).min(1).max(4).optional(),
  maxResults: z.number().int().min(5).max(50).optional(),
  fresh: z.boolean().optional(),
});

const bulkSchema = z
  .object({
    queries: z.array(z.string().min(1).max(200)).min(1).max(10),
    country: z.string().min(2).max(3).optional(),
    engines: z.array(engineSchema).min(1).max(4).optional(),
    maxResults: z.number().int().min(5).max(50).optional(),
    fresh: z.boolean().optional(),
  })
  .transform((d) => ({
    items: d.queries,
    fresh: d.fresh,
    country: d.country,
    engines: d.engines,
    maxResults: d.maxResults,
  }));

type BulkParsed = z.infer<typeof bulkSchema>;

const handlers = makeRouteHandler({
  scraper: serpScraper,
  schema: singleSchema,
  bulk: {
    schema: bulkSchema as unknown as z.ZodType<{
      items: string[];
      fresh?: boolean;
      debug?: boolean;
    }>,
    toInput: (query: string, opts) => {
      const o = opts as unknown as BulkParsed;
      const out: z.infer<typeof singleSchema> = { query };
      if (o.country) out.country = o.country;
      if (o.engines) out.engines = o.engines;
      if (typeof o.maxResults === "number") out.maxResults = o.maxResults;
      if (o.fresh) out.fresh = true;
      return out;
    },
    fieldName: "queries",
  },
  fromQuery: (p) => {
    const query = p.get("q") ?? p.get("query");
    if (!query) return {};
    const enginesParam = p.get("engines");
    const engines = enginesParam
      ? (enginesParam
          .split(",")
          .map((s) => s.trim())
          .filter((s): s is EngineId => (ALL_ENGINE_IDS as string[]).includes(s)))
      : undefined;
    const maxResultsParam = p.get("maxResults");
    const maxResults = maxResultsParam ? Number(maxResultsParam) : undefined;
    const out: Record<string, unknown> = { query };
    const country = p.get("country");
    if (country) out.country = country;
    if (engines && engines.length > 0) out.engines = engines;
    if (maxResults && Number.isFinite(maxResults)) out.maxResults = maxResults;
    if (p.get("fresh") === "true") out.fresh = true;
    return out;
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
