export type HumanizerInput = {
  text: string;
  /** Aggression level. light: contractions only. medium: + variation. heavy: + restructure. */
  level?: "light" | "medium" | "heavy";
  /** Skip cache. Humanizer is deterministic so cache is per (text, level). */
  fresh?: boolean;
};

export type AiTellMatch = {
  pattern: string;
  count: number;
  category: "phrase" | "transition" | "hedge" | "structure";
};

export type HumanizerResult = {
  fetchedAt: string;
  level: "light" | "medium" | "heavy";
  input: {
    text: string;
    wordCount: number;
    sentenceCount: number;
    avgSentenceWords: number;
  };
  output: {
    text: string;
    wordCount: number;
    sentenceCount: number;
    avgSentenceWords: number;
  };
  changes: {
    contractionsApplied: number;
    sentencesRestructured: number;
    aiTellsRemoved: number;
    transitionsTrimmed: number;
  };
  aiTells: AiTellMatch[];
  scores: {
    aiLikelihoodBefore: number;
    aiLikelihoodAfter: number;
    readabilityBefore: number;
    readabilityAfter: number;
  };
};
