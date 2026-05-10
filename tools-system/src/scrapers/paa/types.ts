import type { EngineId, HarvestedQuestion } from "@/scrapers/_shared/search";

export type PaaInput = {
  query: string;
  /** ISO-3166 country code, e.g. "US", "IN". */
  country?: string;
  /** Engines to query. Defaults to all four. */
  engines?: EngineId[];
  /**
   * Maximum questions returned PER engine (post-dedupe). Each engine —
   * including the synthetic "expansion" source — gets its own quota.
   * Default 10.
   */
  perEngineLimit?: number;
  /**
   * Legacy global cap. When set, returns at most this many questions across
   * all engines combined (after the per-engine quota is applied). Older
   * callers can keep using this; new callers should use `perEngineLimit`.
   */
  limit?: number;
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
  /** Per-engine quota that was applied to this run. */
  perEngineLimit: number;
  questions: PaaQuestion[];
  byEngine: Record<string, number>;
  byClassification: Record<string, number>;
};
