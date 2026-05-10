/**
 * Top-level providers facade. Scrapers should import from here, not from
 * provider sub-paths, so future provider additions / replacements stay
 * fully encapsulated behind the existing function names.
 *
 * Each function:
 *   - runs a fallback chain across underlying providers
 *   - caches successful readings via lib/cache
 *   - returns a normalized shape — never a vendor-specific payload
 *   - reports which `source` answered + which providers were attempted
 *
 * To add a new provider for an existing signal, write a Provider<…> module
 * under the matching sub-folder, then prepend/append it to the chain in
 * that sub-folder's index.ts. No scraper changes required.
 */

export { lookupWhois, lookupRdap, type WhoisRecord, type RdapRecord } from "./whois";
export { resolveDns, type DnsRecord } from "./dns";
export { crawlSnapshot, type CrawlSnapshot } from "./crawl";
export {
  fetchBacklinkFootprint,
  type BacklinkFootprint,
  type FootprintReading,
} from "./backlink-footprints";
export { fetchPageMetadata, type PageMetadata, type MetadataReading } from "./metadata";
export { extractSchema, type SchemaReading } from "./schema";
export { searchPresence, type SearchPresence } from "./search";
