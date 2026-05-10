/**
 * Normalized backlink-footprint reading. Different providers contribute
 * different parts; the scorer combines whatever is available.
 *
 *   refDomainsObserved — distinct external hosts that have linked to this
 *     domain in the data source (Common Crawl). May undercount; cached.
 *   linkSamplesObserved — count of individual link records observed.
 *   pageRank01 — OpenPageRank value normalized to 0..1 (their scale is 0..10).
 *   confidence — 0..1, internal hint about how trustworthy the reading is.
 */
export type BacklinkFootprint = {
  refDomainsObserved: number | null;
  linkSamplesObserved: number | null;
  pageRank01: number | null;
  confidence: number;
};
