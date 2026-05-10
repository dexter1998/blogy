import { z } from "zod";
import { makeRouteHandler } from "@/lib/route-helpers";
import { whoisLookupScraper } from "@/scrapers/whois/lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Accepts any of: bare domain, host with subdomains, full URL.
 * Normalization (URL → registrable root) happens inside the scraper, so
 * we only enforce a non-empty string and length bounds here.
 */
const schema = z.object({
  domain: z.string().min(3).max(2048),
  fresh: z.boolean().optional(),
});

const handlers = makeRouteHandler({
  scraper: whoisLookupScraper,
  schema,
  fromQuery: (p) => {
    const domain = p.get("domain") ?? p.get("url");
    return domain ? { domain, fresh: p.get("fresh") === "true" } : {};
  },
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const OPTIONS = handlers.OPTIONS;
