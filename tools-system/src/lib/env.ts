export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiAuthMode: (process.env.API_AUTH_MODE ?? "open") as "open" | "key",
  apiKeys: (process.env.API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean),
  rateLimitPerMin: Number(process.env.RATE_LIMIT_PER_MIN ?? 30),
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 900),
  scrapeTimeoutMs: Number(process.env.SCRAPE_TIMEOUT_MS ?? 8000),
  /**
   * User-Agent for outbound page fetches. Defaults to a browser-shaped UA
   * with a tools attribution suffix — many real sites (anti-bot CDNs,
   * Cloudflare, AWS WAF) hard-block obviously-bot UAs with 403, which
   * starves the scoring engine of on-page signals. Override per-deployment
   * via SCRAPE_USER_AGENT if needed.
   */
  scrapeUserAgent:
    process.env.SCRAPE_USER_AGENT ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 BlogyToolsBot/1.0 (+https://blogy.in/tools)",
  /** Optional. Free key from openpagerank.com — when set, used as a corroborating
   * signal for the authority axis. Pipeline degrades gracefully when missing. */
  openPageRankApiKey: process.env.OPR_API_KEY ?? "",
};
