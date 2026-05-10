export type AiReadinessInput = { url: string; fresh?: boolean };

export type EeatSignals = {
  hasAuthorByline: boolean;
  hasAuthorBio: boolean;
  hasPublishedDate: boolean;
  hasModifiedDate: boolean;
  ageDays: number | null;
  hasOrganizationSchema: boolean;
  hasArticleSchema: boolean;
  hasReviewSchema: boolean;
  externalCitations: number;
};

export type StructureSignals = {
  hasH1: boolean;
  h2Count: number;
  paragraphCount: number;
  avgParagraphWords: number;
  hasFaqSchema: boolean;
  hasHowToSchema: boolean;
  hasBreadcrumbSchema: boolean;
};

export type AiReadinessResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  scores: {
    overall: number;
    eeat: number;
    structure: number;
    machineReadability: number;
    freshness: number;
  };
  eeat: EeatSignals;
  structure: StructureSignals;
  machineReadability: {
    canonical: string | null;
    hasMetaDescription: boolean;
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    hasJsonLd: boolean;
    hasLlmsTxt: boolean;
    hasRobotsAllow: boolean;
  };
  recommendations: Array<{ priority: "high" | "medium" | "low"; message: string }>;
};
