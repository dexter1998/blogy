import type { EngineId, HarvestedQuestion } from "@/scrapers/_shared/search";

export type PaaInput = {
  query: string;
  /** ISO-3166 country code, e.g. "US", "IN". */
  country?: string;
  /** Engines to query. Defaults to all four. */
  engines?: EngineId[];
  /** Maximum questions returned (post-dedupe). */
  limit?: 10 | 25 | 50 | 100 | number;
  /** Recursion depth for expansion. 1 = no expansion. */
  depth?: 1 | 2 | 3;
  /** Whether to include synthetic deterministic seeds. */
  includeSeeds?: boolean;
  fresh?: boolean;
};

export type PaaQuestion = HarvestedQuestion;

export type PaaResult = {
  query: string;
  country: string;
  language: string;
  fetchedAt: string;
  totalQuestions: number;
  depth: number;
  questions: PaaQuestion[];
  byEngine: Record<string, number>;
  byClassification: Record<string, number>;
};
