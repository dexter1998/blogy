/**
 * The Engine contract — every search-engine adapter implements it.
 *
 * Adapters are PURE PARSERS: input = (query, country); output = normalized
 * EngineFetch. No caching, no retry, no fan-out — those are the runner's
 * job. This is what lets the same Google parser be reused by the SERP API,
 * the PAA API, the keyword tools, etc., without coupling.
 */

import type { CountryEntry } from "./countries";
import type { EngineFetch, EngineId } from "./types";

export interface SearchEngine {
  readonly id: EngineId;
  readonly displayName: string;
  /** Stable order used to break ties when the same URL appears across engines. */
  readonly priority: number;
  fetch(query: string, country: CountryEntry, opts?: FetchOpts): Promise<EngineFetch>;
}

export type FetchOpts = {
  /** Hint to the parser: pull at most N organic results. */
  maxResults?: number;
  /** Abort signal forwarded to the underlying HTTP call. */
  signal?: AbortSignal;
};

export class EngineUnavailable extends Error {
  constructor(public readonly engine: EngineId, public readonly reason: string) {
    super(`engine:${engine} unavailable: ${reason}`);
    this.name = "EngineUnavailable";
  }
}

export function emptyFetch(
  engine: EngineId,
  query: string,
  country: CountryEntry,
  error: string,
): EngineFetch {
  return {
    engine,
    query,
    country: country.code,
    language: country.language,
    fetchedAt: new Date().toISOString(),
    ok: false,
    error,
    results: [],
    paa: [],
    related: [],
    featuredSnippet: null,
    blocks: {
      ads: 0,
      videos: 0,
      images: 0,
      news: 0,
      hasFeaturedSnippet: false,
      hasKnowledgePanel: false,
      hasLocalPack: false,
    },
  };
}
