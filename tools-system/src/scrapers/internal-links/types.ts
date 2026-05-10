export type InternalLinkInput = {
  url: string;
  maxPages?: number;
  fresh?: boolean;
};

export type LinkNode = {
  url: string;
  inboundCount: number;
  outboundCount: number;
  depth: number;
  isOrphan: boolean;
  noindex: boolean;
  status: number | null;
  title: string | null;
};

export type InternalLinkResult = {
  origin: string;
  startedFrom: string;
  fetchedAt: string;
  pagesCrawled: number;
  truncated: boolean;
  graph: {
    nodes: LinkNode[];
    edgeCount: number;
  };
  hubs: Array<{ url: string; inboundCount: number }>;
  orphans: string[];
  deepPages: Array<{ url: string; depth: number }>;
  noindexed: string[];
  brokenLinks: Array<{ url: string; status: number | null }>;
  scores: {
    overall: number;
    coverage: number;
    distribution: number;
    health: number;
  };
  recommendations: Array<{ priority: "high" | "medium" | "low"; message: string }>;
};
