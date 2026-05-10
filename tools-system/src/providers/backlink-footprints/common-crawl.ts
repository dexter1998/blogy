/**
 * Common Crawl CDX provider. We query the most recent monthly index for
 * pages whose URL belongs to the *target* domain — actually that's a bad
 * proxy for inbound links because CDX indexes the URL itself, not its
 * outbound links. The richer signal lives in the WAT/WET segments which
 * are too heavy to fetch live.
 *
 * For a real inbound-link estimate we'd need the public web-graph dataset
 * (cc-webgraph). That's downloadable but huge. So this provider gives a
 * *coverage* signal — how widely the target appears in CC at all — which
 * correlates with web visibility, and the scorer treats it as one input
 * among several rather than a backlink count.
 */

import type { Provider } from "@/providers/types";
import { fetchText, timed } from "@/providers/_shared/cached-fetch";
import type { BacklinkFootprint } from "./types";

const CDX_INDEXES = [
  "CC-MAIN-2026-13",
  "CC-MAIN-2026-09",
  "CC-MAIN-2025-51",
];

const PER_INDEX_LIMIT = 30;

async function probeIndex(index: string, host: string): Promise<number> {
  const params = new URLSearchParams({
    url: host,
    matchType: "domain",
    output: "json",
    limit: String(PER_INDEX_LIMIT),
    fl: "url",
  });
  const url = `https://index.commoncrawl.org/${index}-index?${params.toString()}`;
  const res = await fetchText(url, { timeoutMs: 10_000 });
  if (!res.ok) return 0;
  const lines = res.body.split(/\r?\n/).filter((l) => l.trim());
  return lines.length;
}

export const commonCrawlFootprint: Provider<{ host: string }, BacklinkFootprint> = {
  name: "common-crawl",
  async fetch({ host }) {
    const { value, tookMs } = await timed(async () => {
      let total = 0;
      const distinctHosts = new Set<string>();
      for (const idx of CDX_INDEXES) {
        const count = await probeIndex(idx, host);
        total += count;
        if (count > 0) distinctHosts.add(idx); // each index = 1 "vintage"
      }
      if (total === 0) return null;
      // Distinct *referring* domains — we don't know precisely, but # of CC
      // captures across multiple monthly indexes is a proxy for breadth.
      return {
        refDomainsObserved: total,
        linkSamplesObserved: total,
        pageRank01: null,
        confidence: 0.4,
      } satisfies BacklinkFootprint;
    });
    return { source: "common-crawl", data: value, tookMs };
  },
};
