/**
 * Normalized search-engine output shapes.
 *
 * Every engine parser returns the SAME shape so callers (SERP scraper, PAA
 * scraper, etc.) can treat them interchangeably. Engine-specific quirks are
 * absorbed inside the parser, never leaked outward.
 */

export type EngineId = "google" | "bing" | "yahoo" | "duckduckgo";

export type ResultKind =
  | "organic"
  | "ad"
  | "featured_snippet"
  | "video"
  | "image"
  | "news"
  | "knowledge_panel"
  | "local_pack"
  | "twitter";

export type SearchResult = {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  domain: string;
  snippet: string;
  kind: ResultKind;
  /** Optional sitelinks under the main result (Google, Bing). */
  sitelinks?: { title: string; url: string }[];
};

export type FeaturedSnippet = {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  /** Whether the engine actually labelled this as the featured/answer box. */
  source: EngineId;
};

export type PaaItem = {
  question: string;
  answer?: string;
  sourceUrl?: string;
  sourceDomain?: string;
};

export type RichBlocks = {
  ads: number;
  videos: number;
  images: number;
  news: number;
  hasFeaturedSnippet: boolean;
  hasKnowledgePanel: boolean;
  hasLocalPack: boolean;
};

export type EngineFetch = {
  engine: EngineId;
  query: string;
  country: string;
  language: string;
  fetchedAt: string;
  ok: boolean;
  /** Reason the fetch failed (rate-limit, captcha, no_results, etc.). */
  error?: string;
  results: SearchResult[];
  paa: PaaItem[];
  related: string[];
  featuredSnippet: FeaturedSnippet | null;
  blocks: RichBlocks;
};
