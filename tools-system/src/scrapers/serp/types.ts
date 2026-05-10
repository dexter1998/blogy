import type {
  EngineFetch,
  EngineId,
  PaaItem,
  SearchResult,
  FeaturedSnippet,
  RichBlocks,
} from "@/scrapers/_shared/search";
import type { EngineRunStatus } from "@/scrapers/_shared/search";

export type SerpIntent =
  | "informational"
  | "navigational"
  | "transactional"
  | "commercial"
  | "mixed";

export type SerpScrapeInput = {
  query: string;
  /** ISO-3166 alpha-2, e.g. "US", "IN", "GB". */
  country?: string;
  /** Engines to query. Defaults to all four. */
  engines?: EngineId[];
  /** Cap merged organic results returned. Engines internally fetch ≤ 30. */
  maxResults?: number;
  /** Skip cache. */
  fresh?: boolean;
};

export type DomainCount = { domain: string; count: number };

export type SerpScrapeResult = {
  query: string;
  country: string;
  language: string;
  fetchedAt: string;
  /** Merged organic results across all engines (deduped + reranked). */
  totalResults: number;
  results: SearchResult[];
  /** Per-engine raw output (positions, blocks, status). */
  perEngine: EngineFetch[];
  engines: EngineRunStatus[];
  /** Top-of-SERP question box, when one engine surfaced one. */
  featuredSnippets: FeaturedSnippet[];
  /** People-also-ask questions normalized across engines. */
  paa: PaaItem[];
  related: string[];
  /** Aggregated rich-block presence across engines. */
  blocks: RichBlocks;
  intent: SerpIntent;
  intentSignals: { howTo: number; brand: number; commercial: number; comparison: number };
  domains: DomainCount[];
  ok: boolean;
  error?: string;
};
