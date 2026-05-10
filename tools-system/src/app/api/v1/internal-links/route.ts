/**
 * Internal Link extractor route.
 *
 * Unlike most tools we don't use makeRouteHandler() — the scraper produces
 * the FULL link list (cached by URL only) and we slice it here per request
 * using offset/limit, so paginated "load next 500" calls hit cache and
 * never re-fetch the page or re-run the broken-link checks.
 */

import { z } from "zod";
import {
  ErrorCodes,
  failure,
  newRequestId,
  success,
} from "@/lib/api-response";
import { authenticate } from "@/lib/auth";
import { clientIdentifier, rateLimit } from "@/lib/ratelimit";
import { runScraper } from "@/scrapers/base/runner";
import { urlSchema } from "@/lib/validation/url";
import { internalLinksScraper } from "@/scrapers/internal-links";
import type { InternalLinkResult } from "@/scrapers/internal-links/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGE_LIMIT = 500;

const schema = z.object({
  url: urlSchema,
  offset: z.number().int().min(0).max(50_000).optional(),
  limit: z.number().int().min(1).max(PAGE_LIMIT).optional(),
  fresh: z.boolean().optional(),
});

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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return failure(
      400,
      ErrorCodes.ValidationError,
      "Invalid request body",
      { requestId, durationMs: Date.now() - t0 },
      parsed.error.flatten(),
    );
  }

  try {
    const run = await runScraper(internalLinksScraper, parsed.data, {
      requestId,
      bypassCache: parsed.data.fresh === true,
    });

    const full = run.data as InternalLinkResult;
    const offset = Math.min(parsed.data.offset ?? 0, full.page.links.length);
    const limit = Math.min(parsed.data.limit ?? PAGE_LIMIT, PAGE_LIMIT);
    const slice = full.page.links.slice(offset, offset + limit);

    const sliced: InternalLinkResult = {
      ...full,
      page: {
        offset,
        limit,
        total: full.page.links.length,
        links: slice,
      },
    };

    return success(
      { result: sliced },
      {
        requestId,
        durationMs: Date.now() - t0,
        cached: run.cached,
        rateLimit: {
          limit: rl.limit,
          remaining: rl.remaining,
          resetAt: rl.resetAt.toISOString(),
        },
      },
    );
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
    /* fall through */
  }
  return handle(req, body);
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const url = u.searchParams.get("url");
  const offset = u.searchParams.get("offset");
  const limit = u.searchParams.get("limit");
  return handle(req, {
    ...(url ? { url } : {}),
    ...(offset ? { offset: Number(offset) } : {}),
    ...(limit ? { limit: Number(limit) } : {}),
    fresh: u.searchParams.get("fresh") === "true",
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
