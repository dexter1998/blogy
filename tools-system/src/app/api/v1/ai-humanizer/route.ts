import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { aiHumanizerScraper } from "@/scrapers/ai-humanizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  text: z.string().min(20).max(20_000),
  level: z.enum(["light", "medium", "heavy"]).optional(),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: aiHumanizerScraper,
  schema: singleSchema,
});

export const POST = handlers.POST;
export const OPTIONS = handlers.OPTIONS;
