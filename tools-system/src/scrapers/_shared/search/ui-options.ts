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

/** Per-engine quota choices for the PAA tool — applied to each selected engine. */
export const PAA_PER_ENGINE_OPTIONS = [5, 10, 15, 20, 25] as const;
export const DEFAULT_PAA_PER_ENGINE = 10;
