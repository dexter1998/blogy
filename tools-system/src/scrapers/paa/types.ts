export type PaaInput = { query: string; depth?: 1 | 2; fresh?: boolean };

export type PaaQuestion = {
  question: string;
  source: "duckduckgo" | "bing" | "wikipedia" | "expansion";
  /** Depth in the question tree: 0 = directly from query, 1 = expanded */
  depth: number;
  /** Whether we successfully expanded children for this node. */
  expanded: boolean;
};

export type PaaResult = {
  query: string;
  fetchedAt: string;
  totalQuestions: number;
  questions: PaaQuestion[];
  related: string[];
  /** Question types we detected (how, what, why, …) */
  questionTypes: Record<string, number>;
};
