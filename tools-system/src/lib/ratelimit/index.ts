/**
 * Sliding-window in-memory rate limiter, keyed by IP or API key.
 * Replace with Upstash/Redis in production by implementing the same interface.
 */

import { env } from "@/lib/env";

type Bucket = { count: number; windowStart: number };

declare global {
  // eslint-disable-next-line no-var
  var __toolsRateBuckets: Map<string, Bucket> | undefined;
}

const buckets: Map<string, Bucket> =
  globalThis.__toolsRateBuckets ?? new Map<string, Bucket>();
if (!globalThis.__toolsRateBuckets) globalThis.__toolsRateBuckets = buckets;

const WINDOW_MS = 60_000;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

export function rateLimit(
  identifier: string,
  limitPerMin: number = env.rateLimitPerMin,
): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(identifier);
  const limit = Math.max(1, limitPerMin);

  if (!b || now - b.windowStart > WINDOW_MS) {
    buckets.set(identifier, { count: 1, windowStart: now });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: new Date(now + WINDOW_MS),
    };
  }

  b.count += 1;
  const remaining = Math.max(0, limit - b.count);
  return {
    allowed: b.count <= limit,
    limit,
    remaining,
    resetAt: new Date(b.windowStart + WINDOW_MS),
  };
}

export function clientIdentifier(req: Request): string {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) return `key:${apiKey}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip") ?? "anon";
  return `ip:${ip}`;
}
