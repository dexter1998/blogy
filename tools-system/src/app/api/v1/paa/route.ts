import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { paaScraper } from "@/scrapers/paa";
import { ALL_ENGINE_IDS, type EngineId } from "@/scrapers/_shared/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const engineSchema = z.enum(ALL_ENGINE_IDS as [EngineId, ...EngineId[]]);

const singleSchema = z.object({
  query: z.string().min(1).max(200),
  country: z.string().min(2).max(3).optional(),
  engines: z.array(engineSchema).min(1).max(4).optional(),
  limit: z.number().int().min(1).max(250).optional(),
  depth: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  includeSeeds: z.boolean().optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: paaScraper,
  schema: singleSchema,
  fromQuery: (p) => {
    const query = p.get("q") ?? p.get("query");
    if (!query) return {};
    const out: Record<string, unknown> = { query };

    const country = p.get("country");
    if (country) out.country = country;

    const enginesParam = p.get("engines");
    if (enginesParam) {
      const engines = enginesParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is EngineId => (ALL_ENGINE_IDS as string[]).includes(s));
      if (engines.length > 0) out.engines = engines;
    }

    const limit = p.get("limit");
    if (limit) {
      const n = Number(limit);
      if (Number.isFinite(n)) out.limit = n;
    }

    const depth = p.get("depth");
    if (depth === "1" || depth === "2" || depth === "3") out.depth = Number(depth);

    if (p.get("includeSeeds") === "false") out.includeSeeds = false;
    if (p.get("fresh") === "true") out.fresh = true;
    return out;
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
