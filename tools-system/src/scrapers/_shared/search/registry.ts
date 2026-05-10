/**
 * Engine registry — single source of truth for "which engines exist".
 * The runner, the API zod schemas, and the UI dropdowns all read from here.
 */

import type { SearchEngine } from "./engine";
import type { EngineId } from "./types";
import { googleEngine } from "./engines/google";
import { bingEngine } from "./engines/bing";
import { yahooEngine } from "./engines/yahoo";
import { duckduckgoEngine } from "./engines/duckduckgo";

export const ENGINES: SearchEngine[] = [googleEngine, bingEngine, yahooEngine, duckduckgoEngine];

const INDEX = new Map<EngineId, SearchEngine>(ENGINES.map((e) => [e.id, e]));

export const ALL_ENGINE_IDS: EngineId[] = ENGINES.map((e) => e.id);
export const DEFAULT_ENGINE_IDS: EngineId[] = ["google", "bing", "yahoo", "duckduckgo"];

export function getEngine(id: EngineId): SearchEngine | undefined {
  return INDEX.get(id);
}

export function resolveEngines(ids: EngineId[] | undefined | null): SearchEngine[] {
  const list = ids && ids.length > 0 ? ids : DEFAULT_ENGINE_IDS;
  const seen = new Set<EngineId>();
  const out: SearchEngine[] = [];
  for (const id of list) {
    if (seen.has(id)) continue;
    const e = INDEX.get(id);
    if (e) {
      seen.add(id);
      out.push(e);
    }
  }
  return out;
}
