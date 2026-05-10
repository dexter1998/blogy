/**
 * Country / locale registry for geo-targeted SERP fetching.
 *
 * Each engine accepts a different parameter set for region targeting:
 *  - Google     : gl (country) + hl (language) + uule (location)
 *  - Bing       : cc (country) + setlang
 *  - Yahoo      : per-country host (uk.search.yahoo.com, in.search.yahoo.com…)
 *  - DuckDuckGo : kl (region code, e.g. "us-en")
 *
 * We store one canonical descriptor per country and let each engine adapter
 * derive its own params from it. Adding a country means adding ONE row.
 */

export type CountryEntry = {
  code: string;            // ISO-3166 alpha-2 (uppercase)
  name: string;
  language: string;        // primary search language code (lowercase)
  /** DuckDuckGo region locale, e.g. "us-en". */
  ddg: string;
  /** Google `gl` param, lowercase ISO-3166. */
  gl: string;
  /** Google `hl` param. */
  hl: string;
  /** Bing `cc` param, lowercase. */
  bingCc: string;
  /** Bing `setlang` param. */
  bingLang: string;
  /** Yahoo subdomain ("" = www.search.yahoo.com). */
  yahooHost: string;
};

export const COUNTRIES: CountryEntry[] = [
  { code: "US", name: "United States",      language: "en", ddg: "us-en", gl: "us", hl: "en", bingCc: "us", bingLang: "en", yahooHost: "" },
  { code: "IN", name: "India",              language: "en", ddg: "in-en", gl: "in", hl: "en", bingCc: "in", bingLang: "en", yahooHost: "in" },
  { code: "GB", name: "United Kingdom",     language: "en", ddg: "uk-en", gl: "uk", hl: "en-GB", bingCc: "gb", bingLang: "en-GB", yahooHost: "uk" },
  { code: "CA", name: "Canada",             language: "en", ddg: "ca-en", gl: "ca", hl: "en-CA", bingCc: "ca", bingLang: "en-CA", yahooHost: "ca" },
  { code: "AU", name: "Australia",          language: "en", ddg: "au-en", gl: "au", hl: "en-AU", bingCc: "au", bingLang: "en-AU", yahooHost: "au" },
  { code: "DE", name: "Germany",            language: "de", ddg: "de-de", gl: "de", hl: "de", bingCc: "de", bingLang: "de", yahooHost: "de" },
  { code: "FR", name: "France",             language: "fr", ddg: "fr-fr", gl: "fr", hl: "fr", bingCc: "fr", bingLang: "fr", yahooHost: "fr" },
  { code: "ES", name: "Spain",              language: "es", ddg: "es-es", gl: "es", hl: "es", bingCc: "es", bingLang: "es", yahooHost: "es" },
  { code: "IT", name: "Italy",              language: "it", ddg: "it-it", gl: "it", hl: "it", bingCc: "it", bingLang: "it", yahooHost: "it" },
  { code: "NL", name: "Netherlands",        language: "nl", ddg: "nl-nl", gl: "nl", hl: "nl", bingCc: "nl", bingLang: "nl", yahooHost: "nl" },
  { code: "BR", name: "Brazil",             language: "pt", ddg: "br-pt", gl: "br", hl: "pt-BR", bingCc: "br", bingLang: "pt-BR", yahooHost: "br" },
  { code: "MX", name: "Mexico",             language: "es", ddg: "mx-es", gl: "mx", hl: "es-MX", bingCc: "mx", bingLang: "es-MX", yahooHost: "mx" },
  { code: "JP", name: "Japan",              language: "ja", ddg: "jp-jp", gl: "jp", hl: "ja", bingCc: "jp", bingLang: "ja", yahooHost: "jp" },
  { code: "KR", name: "South Korea",        language: "ko", ddg: "kr-kr", gl: "kr", hl: "ko", bingCc: "kr", bingLang: "ko", yahooHost: "" },
  { code: "SG", name: "Singapore",          language: "en", ddg: "sg-en", gl: "sg", hl: "en", bingCc: "sg", bingLang: "en", yahooHost: "sg" },
  { code: "AE", name: "United Arab Emirates", language: "en", ddg: "xa-en", gl: "ae", hl: "en", bingCc: "ae", bingLang: "en", yahooHost: "" },
  { code: "ZA", name: "South Africa",       language: "en", ddg: "za-en", gl: "za", hl: "en", bingCc: "za", bingLang: "en", yahooHost: "" },
  { code: "NG", name: "Nigeria",            language: "en", ddg: "ng-en", gl: "ng", hl: "en", bingCc: "ng", bingLang: "en", yahooHost: "" },
  { code: "ID", name: "Indonesia",          language: "id", ddg: "id-en", gl: "id", hl: "id", bingCc: "id", bingLang: "id", yahooHost: "id" },
  { code: "PH", name: "Philippines",        language: "en", ddg: "ph-en", gl: "ph", hl: "en", bingCc: "ph", bingLang: "en", yahooHost: "ph" },
  { code: "PK", name: "Pakistan",           language: "en", ddg: "pk-en", gl: "pk", hl: "en", bingCc: "pk", bingLang: "en", yahooHost: "" },
  { code: "BD", name: "Bangladesh",         language: "en", ddg: "xa-en", gl: "bd", hl: "en", bingCc: "bd", bingLang: "en", yahooHost: "" },
];

const INDEX = new Map(COUNTRIES.map((c) => [c.code.toUpperCase(), c]));

export const DEFAULT_COUNTRY_CODE = "US";

export function resolveCountry(code: string | undefined | null): CountryEntry {
  if (!code) return INDEX.get(DEFAULT_COUNTRY_CODE)!;
  const hit = INDEX.get(code.toUpperCase());
  return hit ?? INDEX.get(DEFAULT_COUNTRY_CODE)!;
}

export function listCountries(): CountryEntry[] {
  return COUNTRIES.slice();
}
