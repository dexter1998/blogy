/**
 * Pure data exports safe to import into client components. Avoids pulling
 * engine adapters (which depend on axios + cheerio) into the browser bundle.
 */

import type { EngineId } from "./types";
import { COUNTRIES } from "./countries";

export type EngineOption = { id: EngineId; label: string };

export const ENGINE_OPTIONS: EngineOption[] = [
  { id: "google", label: "Google" },
  { id: "bing", label: "Bing" },
  { id: "yahoo", label: "Yahoo" },
  { id: "duckduckgo", label: "DuckDuckGo" },
];

export const DEFAULT_ENGINE_OPTION_IDS: EngineId[] = ["google", "bing", "yahoo", "duckduckgo"];

export type CountryOption = { code: string; name: string };

export const COUNTRY_OPTIONS: CountryOption[] = COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
}));

export const DEFAULT_COUNTRY_OPTION = "US";

export const PAA_LIMIT_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAA_LIMIT = 25;
