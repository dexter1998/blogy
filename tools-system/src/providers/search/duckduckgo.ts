/**
 * Public search-engine signal. We do NOT scrape Google's results page —
 * Google blocks bots, returns inconsistent counts, and our own SLA would
 * be terrible. DuckDuckGo Lite serves a stable HTML SERP without anti-bot
 * gates and is acceptable for use as a "does this site appear in search
 * at all?" corroboration signal.
 *
 * Returns:
 *   - hasResults: did the SERP contain any organic result rows?
 *   - approximateRowsObserved: how many rows we saw on page 1 (capped, banded).
 *
 * This is intentionally a *low-precision* signal used only to corroborate
 * authority — never as a backlink count.
 */

import * as cheerio from "cheerio";
import type { Provider } from "@/providers/types";
import { fetchText, timed } from "@/providers/_shared/cached-fetch";

export type SearchPresence = {
  hasResults: boolean;
  approximateRowsObserved: number;
};

export const duckduckgoSearch: Provider<{ host: string }, SearchPresence> = {
  name: "duckduckgo-lite",
  async fetch({ host }) {
    const { value, tookMs } = await timed(async () => {
      const q = encodeURIComponent(`site:${host}`);
      const res = await fetchText(`https://lite.duckduckgo.com/lite/?q=${q}`, { timeoutMs: 6000 });
      if (!res.ok) return null;
      const $ = cheerio.load(res.body);
      const rows = $("a.result-link").length || $("a[href*='uddg=']").length;
      if (rows === 0) {
        // Empty SERP is still useful info ("not indexed at all"); return zero
        return { hasResults: false, approximateRowsObserved: 0 } satisfies SearchPresence;
      }
      return { hasResults: true, approximateRowsObserved: Math.min(rows, 30) };
    });
    return { source: "duckduckgo-lite", data: value, tookMs };
  },
};
