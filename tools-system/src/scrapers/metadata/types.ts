export type MetadataInput = { url: string; fresh?: boolean };

export type OpenGraph = {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  siteName: string | null;
  type: string | null;
  locale: string | null;
};

export type TwitterCard = {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  site: string | null;
  creator: string | null;
};

export type Hreflang = { hreflang: string; href: string };

export type MetadataIssue = {
  severity: "error" | "warning" | "info";
  field: string;
  message: string;
};

export type MetadataResult = {
  url: string;
  finalUrl: string;
  status: number;
  fetchedAt: string;
  basic: {
    title: string | null;
    titleLength: number | null;
    description: string | null;
    descriptionLength: number | null;
    canonical: string | null;
    robots: string | null;
    viewport: string | null;
    charset: string | null;
    language: string | null;
    favicon: string | null;
    themeColor: string | null;
  };
  openGraph: OpenGraph;
  twitter: TwitterCard;
  hreflang: Hreflang[];
  headings: {
    h1: string[];
    h2Count: number;
    h3Count: number;
  };
  scores: {
    overall: number;
    basic: number;
    social: number;
    international: number;
  };
  issues: MetadataIssue[];
};
