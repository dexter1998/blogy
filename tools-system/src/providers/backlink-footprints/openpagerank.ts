/**
 * OpenPageRank (free, key-required, https://www.openpagerank.com/api).
 *
 * Returns Domcop's open PageRank value 0..10 plus a rank position. We
 * normalize to 0..1. When OPR_API_KEY is not set, this provider returns
 * data:null and the registry falls through silently.
 */

import type { Provider } from "@/providers/types";
import { timed } from "@/providers/_shared/cached-fetch";
import { env } from "@/lib/env";
import type { BacklinkFootprint } from "./types";

type OprResp = {
  status_code: number;
  response: Array<{
    domain: string;
    page_rank_decimal: number | string; // sometimes string "N/A"
    rank: string;
    error?: string;
  }>;
};

export const openPageRank: Provider<{ host: string }, BacklinkFootprint> = {
  name: "openpagerank",
  async fetch({ host }) {
    const key = env.openPageRankApiKey;
    if (!key) return { source: "openpagerank", data: null, tookMs: 0, error: "no_api_key" };
    const attempt = async () => {
      try {
        const res = await fetch(
          `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(host)}`,
          { headers: { "API-OPR": key }, signal: AbortSignal.timeout(7000) },
        );
        if (!res.ok) return null;
        const j = (await res.json()) as OprResp;
        const row = j.response?.[0];
        if (!row) return null;
        // OPR returns error: "Domain not found" + status_code 404 for unknown
        // domains. Treat as a real "unknown" rather than retrying.
        if (row.error && row.error.length > 0) return null;
        const pr =
          typeof row.page_rank_decimal === "number"
            ? row.page_rank_decimal
            : Number(row.page_rank_decimal);
        if (!Number.isFinite(pr) || pr <= 0) return null;
        return {
          refDomainsObserved: null,
          linkSamplesObserved: null,
          pageRank01: Math.max(0, Math.min(1, pr / 10)),
          confidence: 0.7,
        } satisfies BacklinkFootprint;
      } catch {
        return null;
      }
    };
    const { value, tookMs } = await timed(async () => {
      // One soft retry on transient failure (OPR has occasional flakes).
      const first = await attempt();
      if (first !== null) return first;
      return await attempt();
    });
    return { source: "openpagerank", data: value, tookMs };
  },
};
