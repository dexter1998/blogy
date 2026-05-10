export type SchemaInput = { url: string; fresh?: boolean };

export type SchemaItem = {
  format: "json-ld" | "microdata" | "rdfa";
  type: string;
  raw: unknown;
  errors: string[];
  warnings: string[];
};

export type SchemaIssue = {
  severity: "error" | "warning" | "info";
  type: string | null;
  message: string;
};

export type SchemaResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  totalItems: number;
  byFormat: { jsonLd: number; microdata: number; rdfa: number };
  detectedTypes: string[];
  recommendedTypes: string[];
  items: SchemaItem[];
  issues: SchemaIssue[];
  scores: {
    overall: number;
    coverage: number;
    quality: number;
  };
};
