/**
 * Reusable API-route handler. Every public endpoint follows the same
 * pipeline (auth → rate limit → validate → run scraper → wrap envelope),
 * so we factor it out here. Each route exports only its scraper, schema,
 * and (optionally) bulk schema, then calls makeRouteHandler().
 */

import { z, type ZodType } from "zod";
import {
  ErrorCodes,
  failure,
  newRequestId,
  success,
} from "@/lib/api-response";
import { authenticate } from "@/lib/auth";
import { clientIdentifier, rateLimit } from "@/lib/ratelimit";
import { runScraper } from "@/scrapers/base/runner";
import type { Scraper } from "@/scrapers/base/scraper";

export type BulkParsed<BulkI> = {
  items: BulkI[];
  fresh?: boolean;
  debug?: boolean;
};

export type RouteOptions<I, O, BulkI = never> = {
  scraper: Scraper<I, O>;
  schema: ZodType<I>;
  bulk?: {
    /** Any zod schema (ZodObject, ZodEffects, etc.) whose output matches BulkParsed. */
    schema: ZodType<BulkParsed<BulkI>, z.ZodTypeDef, unknown>;
    /** Convert one bulk-item into the scraper's input shape. */
    toInput: (item: BulkI, opts: { fresh?: boolean; debug?: boolean }) => I;
    /** What field key to expose ("urls", "queries", etc.). */
    fieldName: string;
  };
  /** Optional GET → JSON body adapter (e.g. ?url=… → { url: "…" }). */
  fromQuery?: (params: URLSearchParams) => unknown;
};

type BulkRow<O> =
  | { input: unknown; ok: true; result: O }
  | { input: unknown; ok: false; error: string };

export function makeRouteHandler<I, O, BulkI>(opts: RouteOptions<I, O, BulkI>) {
  async function handle(req: Request, body: unknown) {
    const requestId = newRequestId();
    const t0 = Date.now();

    const auth = authenticate(req);
    if (!auth.ok) {
      return failure(401, ErrorCodes.Unauthorized, auth.reason, {
        requestId,
        durationMs: Date.now() - t0,
      });
    }

    const rl = rateLimit(clientIdentifier(req));
    if (!rl.allowed) {
      return failure(429, ErrorCodes.RateLimited, "Too many requests", {
        requestId,
        durationMs: Date.now() - t0,
      });
    }

    const single = opts.schema.safeParse(body);
    const bulk = opts.bulk ? opts.bulk.schema.safeParse(body) : undefined;

    if (!single.success && !(bulk && bulk.success)) {
      return failure(
        400,
        ErrorCodes.ValidationError,
        opts.bulk
          ? `Provide a single ${opts.bulk.fieldName.replace(/s$/, "")} or { ${opts.bulk.fieldName}: [...] }`
          : "Invalid request body",
        { requestId, durationMs: Date.now() - t0 },
        {
          single: !single.success ? single.error.flatten() : undefined,
          bulk: bulk && !bulk.success ? bulk.error.flatten() : undefined,
        },
      );
    }

    try {
      let payload: { result: O } | { results: BulkRow<O>[] };
      let cached = false;

      if (single.success) {
        const run = await runScraper(opts.scraper, single.data, {
          requestId,
          bypassCache:
            (single.data as unknown as { fresh?: boolean }).fresh === true,
        });
        payload = { result: run.data };
        cached = run.cached;
      } else {
        const data = (bulk as z.SafeParseSuccess<BulkParsed<BulkI>>).data;
        const items = data.items;
        const settled = await Promise.all(
          items.map(async (item) => {
            try {
              const input = opts.bulk!.toInput(item, {
                fresh: data.fresh,
                debug: data.debug,
              });
              const r = await runScraper(opts.scraper, input, {
                requestId,
                bypassCache: data.fresh === true,
              });
              return { input: item, ok: true as const, result: r.data };
            } catch (e) {
              return {
                input: item,
                ok: false as const,
                error: e instanceof Error ? e.message : "scrape_failed",
              };
            }
          }),
        );
        payload = { results: settled };
      }

      return success(payload, {
        requestId,
        durationMs: Date.now() - t0,
        cached,
        rateLimit: {
          limit: rl.limit,
          remaining: rl.remaining,
          resetAt: rl.resetAt.toISOString(),
        },
      });
    } catch (e) {
      return failure(
        500,
        ErrorCodes.Internal,
        e instanceof Error ? e.message : "Unknown error",
        { requestId, durationMs: Date.now() - t0 },
      );
    }
  }

  return {
    POST: async (req: Request) => {
      let body: unknown = {};
      try {
        body = await req.json();
      } catch {
        /* fall through */
      }
      return handle(req, body);
    },
    GET: async (req: Request) => {
      const u = new URL(req.url);
      const adapted = opts.fromQuery
        ? opts.fromQuery(u.searchParams)
        : Object.fromEntries(u.searchParams.entries());
      return handle(req, adapted);
    },
    OPTIONS: async () => new Response(null, { status: 204 }),
  };
}
