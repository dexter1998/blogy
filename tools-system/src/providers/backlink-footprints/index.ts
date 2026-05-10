/**
 * Backlink-footprint composite. Unlike DNS/whois where we want a single
 * winning provider, here we *merge* — OpenPageRank gives a global score,
 * Common Crawl gives a local-coverage signal. A combined reading is more
 * useful than either alone, so we run both and merge non-null fields.
 */

import { cache } from "@/lib/cache";
import { commonCrawlFootprint } from "./common-crawl";
import { openPageRank } from "./openpagerank";
import type { BacklinkFootprint } from "./types";

export type { BacklinkFootprint } from "./types";

const CACHE_TTL = 12 * 60 * 60;

export type FootprintReading = {
  data: BacklinkFootprint;
  sources: string[];
};

function emptyFootprint(): BacklinkFootprint {
  return { refDomainsObserved: null, linkSamplesObserved: null, pageRank01: null, confidence: 0 };
}

export async function fetchBacklinkFootprint(host: string): Promise<FootprintReading> {
  const key = `provider:footprint:${host}`;
  const hit = await cache.get<FootprintReading>(key);
  if (hit) return hit;

  const [opr, cc] = await Promise.all([
    openPageRank.fetch({ host }),
    commonCrawlFootprint.fetch({ host }),
  ]);

  const merged = emptyFootprint();
  const sources: string[] = [];
  let totalConfidence = 0;
  let count = 0;

  for (const r of [opr, cc]) {
    if (!r.data) continue;
    sources.push(r.source);
    if (r.data.refDomainsObserved !== null) {
      merged.refDomainsObserved =
        (merged.refDomainsObserved ?? 0) + r.data.refDomainsObserved;
    }
    if (r.data.linkSamplesObserved !== null) {
      merged.linkSamplesObserved =
        (merged.linkSamplesObserved ?? 0) + r.data.linkSamplesObserved;
    }
    if (r.data.pageRank01 !== null) merged.pageRank01 = r.data.pageRank01;
    totalConfidence += r.data.confidence;
    count += 1;
  }
  merged.confidence = count > 0 ? totalConfidence / count : 0;

  const reading: FootprintReading = { data: merged, sources };
  if (sources.length > 0) await cache.set(key, reading, CACHE_TTL);
  return reading;
}
