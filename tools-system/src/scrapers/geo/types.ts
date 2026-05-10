export type GeoInput = { url: string; query?: string; fresh?: boolean };

export type CitablePassage = {
  text: string;
  type: "definition" | "stat" | "list-item" | "answer" | "quote";
  position: number;
  wordCount: number;
  citabilityScore: number;
};

export type AiCrawlerStatus = {
  bot: string;
  allowed: boolean;
  rule: string | null;
};

export type GeoResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  scores: {
    overall: number;
    citability: number;
    aiAccess: number;
    brandSignals: number;
    answerability: number;
  };
  passages: CitablePassage[];
  aiCrawlers: AiCrawlerStatus[];
  brandSignals: {
    brandName: string;
    brandMentions: number;
    sameAsLinks: string[];
    organizationSchema: boolean;
    websiteSchema: boolean;
  };
  answerability: {
    hasFaq: boolean;
    hasHowTo: boolean;
    hasDefinitions: number;
    hasNumberedLists: number;
    hasBulletedLists: number;
    hasTables: number;
    questionHeadings: number;
  };
  recommendations: Array<{ priority: "high" | "medium" | "low"; message: string }>;
};
