import { z } from "zod";
import {
  ErrorCodes,
  failure,
  newRequestId,
  success,
} from "@/lib/api-response";
import { authenticate } from "@/lib/auth";
import { clientIdentifier, rateLimit } from "@/lib/ratelimit";
import { urlSchema, urlsSchema } from "@/lib/validation/url";
import { runScraper } from "@/scrapers/base/runner";
import { daPaScraper } from "@/scrapers/da-pa";
import type { DaPaResult } from "@/scrapers/da-pa/types";

export const runtime = "nodejs"; // whois + dns require node runtime
export const dynamic = "force-dynamic";

const singleSchema = z.object({
  url: urlSchema,
  fresh: z.boolean().optional(),
  debug: z.boolean().optional(),
});

const bulkSchema = z.object({
  urls: urlsSchema,
  fresh: z.boolean().optional(),
  debug: z.boolean().optional(),
});

type ResponsePayload =
  | { result: DaPaResult }
  | { results: Array<{ url: string; ok: true; result: DaPaResult } | { url: string; ok: false; error: string }> };

async function handle(req: Request, body: unknown) {
  const requestId = newRequestId();
  const t0 = Date.now();

  // Auth
  const auth = authenticate(req);
  if (!auth.ok) {
    return failure(401, ErrorCodes.Unauthorized, auth.reason, {
      requestId,
      durationMs: Date.now() - t0,
    });
  }

  // Rate limit
  const rl = rateLimit(clientIdentifier(req));
  if (!rl.allowed) {
    return failure(429, ErrorCodes.RateLimited, "Too many requests", {
      requestId,
      durationMs: Date.now() - t0,
    });
  }

  // Validate
  const single = singleSchema.safeParse(body);
  const bulk = bulkSchema.safeParse(body);
  if (!single.success && !bulk.success) {
    return failure(
      400,
      ErrorCodes.ValidationError,
      "Provide either { url } or { urls: [...] }",
      { requestId, durationMs: Date.now() - t0 },
      { single: single.error.flatten(), bulk: bulk.error.flatten() },
    );
  }

  try {
    let payload: ResponsePayload;
    let cached = false;

    if (single.success) {
      const run = await runScraper(daPaScraper, single.data, {
        requestId,
        bypassCache: single.data.fresh,
      });
      payload = { result: run.data };
      cached = run.cached;
    } else {
      const input = bulk.data!;
      const settled = await Promise.all(
        input.urls.map(async (url) => {
          try {
            const r = await runScraper(
              daPaScraper,
              { url, fresh: input.fresh, debug: input.debug },
              { requestId, bypassCache: input.fresh },
            );
            return { url, ok: true as const, result: r.data };
          } catch (e) {
            return {
              url,
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

export async function POST(req: Request) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body to fall through to validation error */
  }
  return handle(req, body);
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const url = u.searchParams.get("url");
  const fresh = u.searchParams.get("fresh") === "true";
  const debug = u.searchParams.get("debug") === "true";
  return handle(req, url ? { url, fresh, debug } : {});
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
