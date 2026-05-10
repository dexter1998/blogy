/**
 * Base contract every scraper implements.
 *
 * Scrapers are PURE service modules — no HTTP, no auth, no rate limits.
 * That belongs to the API layer. Scrapers take typed input, do the work,
 * return typed output. They can be called from API routes, queue workers,
 * server components, or other scrapers.
 */

export interface ScrapeContext {
  requestId: string;
  signal?: AbortSignal;
  /** Best-effort hint for caching layer; scrapers themselves don't cache. */
  bypassCache?: boolean;
}

export interface Scraper<Input, Output> {
  /** Stable identifier used for cache keys, logs, telemetry. */
  readonly name: string;
  /** Cache key derived from input. Return null to disable caching for this call. */
  cacheKey(input: Input): string | null;
  /** Default TTL (seconds) for results in shared cache. */
  readonly cacheTtlSeconds: number;
  /** Do the work. Throw on hard failure; return partial result on soft failure. */
  execute(input: Input, ctx: ScrapeContext): Promise<Output>;
}

export class ScrapeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ScrapeError";
  }
}
