/**
 * Public contracts for the /providers layer.
 *
 * A *Provider* is one source of a single signal type (whois, dns, crawl, …).
 * A *ProviderResult* is always a normalized shape, never a vendor-specific
 * payload — that's what lets us swap providers or fall through to the next
 * one without touching the scoring engine.
 *
 * Every provider call returns:
 *   - source:  the human label of which provider answered ("google-doh", …)
 *   - data:    the normalized payload (or null when nothing usable)
 *   - error:   short reason string when data is null
 *   - tookMs:  wall-clock cost, useful for telemetry + provider ranking
 *
 * The provider *registry* picks providers in declared priority order, falls
 * through on null/error, and caches successful results via lib/cache.
 */

export type ProviderResult<T> = {
  source: string;
  data: T | null;
  error?: string;
  tookMs: number;
};

export interface Provider<TInput, TOutput> {
  name: string;
  fetch(input: TInput, signal?: AbortSignal): Promise<ProviderResult<TOutput>>;
}

/** Race-with-fallback runner. Tries providers in order until one returns data. */
export async function runWithFallback<TIn, TOut>(
  providers: Provider<TIn, TOut>[],
  input: TIn,
  signal?: AbortSignal,
): Promise<ProviderResult<TOut> & { attempted: string[] }> {
  const attempted: string[] = [];
  let lastError: string | undefined;
  for (const p of providers) {
    attempted.push(p.name);
    try {
      const r = await p.fetch(input, signal);
      if (r.data !== null) return { ...r, attempted };
      lastError = r.error;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "provider_threw";
    }
  }
  return {
    source: "none",
    data: null,
    error: lastError ?? "all_providers_failed",
    tookMs: 0,
    attempted,
  };
}
