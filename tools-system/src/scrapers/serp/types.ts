import type { SerpIntent, SerpResult } from "@/scrapers/_shared/serp";

export type SerpScrapeInput = {
  query: string;
  region?: string;
  fresh?: boolean;
};

export type SerpScrapeResult = {
  query: string;
  region: string;
  source: "duckduckgo" | "bing";
  fetchedAt: string;
  totalResults: number;
  results: SerpResult[];
  related: string[];
  intent: SerpIntent;
  intentSignals: { howTo: number; brand: number; commercial: number; comparison: number };
  domains: { domain: string; count: number }[];
  ok: boolean;
  error?: string;
};
