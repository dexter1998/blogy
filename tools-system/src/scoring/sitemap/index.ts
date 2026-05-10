import type { SitemapResult } from "@/scrapers/sitemap/types";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function scoreSitemap(r: SitemapResult): {
  scores: SitemapResult["scores"];
  issues: SitemapResult["issues"];
} {
  const issues: SitemapResult["issues"] = [];
  const okFetched = r.fetched.filter((f) => f.ok);
  if (okFetched.length === 0) {
    issues.push({ severity: "error", message: "No reachable sitemap found" });
  }
  if (r.fetched.some((f) => !f.ok)) {
    issues.push({
      severity: "warning",
      message: `${r.fetched.filter((f) => !f.ok).length} sitemap URLs failed to fetch`,
    });
  }
  if (r.stats.totalUrls === 0 && okFetched.length > 0) {
    issues.push({ severity: "warning", message: "Sitemap is empty" });
  }
  if (r.truncated) {
    issues.push({ severity: "info", message: "Output truncated — site has more sitemaps/URLs than the cap" });
  }
  if (r.stats.totalUrls > 0 && r.stats.withLastmod / r.stats.totalUrls < 0.3) {
    issues.push({ severity: "warning", message: "Less than 30% of URLs have lastmod — Google leans on this signal" });
  }
  if (r.stats.uniqueHosts > 1) {
    issues.push({ severity: "info", message: `Sitemap spans ${r.stats.uniqueHosts} hosts` });
  }

  // ── Coverage ──
  let coverage = 0;
  if (okFetched.length > 0) coverage += 30;
  if (r.stats.totalUrls > 0) coverage += 30;
  coverage += Math.min(40, Math.log10(r.stats.totalUrls + 1) * 18);

  // ── Freshness ──
  let freshness = 50; // neutral baseline
  const lastmodRatio = r.stats.totalUrls ? r.stats.withLastmod / r.stats.totalUrls : 0;
  freshness += lastmodRatio * 30;
  const med = r.stats.freshnessDays.median;
  if (med !== null) {
    if (med < 30) freshness += 20;
    else if (med < 90) freshness += 10;
    else if (med > 365) freshness -= 20;
  } else if (r.stats.totalUrls > 0) {
    freshness -= 10;
  }

  // ── Structure ──
  let structure = 0;
  if (r.discovered.length > 0) structure += 20;
  if (r.fetched.some((f) => f.type === "sitemapindex")) structure += 15;
  if (r.stats.uniqueHosts === 1 || r.stats.totalUrls === 0) structure += 15;
  if (r.stats.avgPathDepth > 0 && r.stats.avgPathDepth <= 4) structure += 25;
  else if (r.stats.avgPathDepth > 4) structure += 10;
  if (r.stats.topPaths.length > 0) structure += 15;
  if (r.stats.withPriority / Math.max(1, r.stats.totalUrls) > 0.5) structure += 10;

  const scores = {
    coverage: clamp(coverage),
    freshness: clamp(freshness),
    structure: clamp(structure),
    overall: 0,
  };
  scores.overall = Math.round(
    scores.coverage * 0.45 + scores.freshness * 0.3 + scores.structure * 0.25,
  );
  return { scores, issues };
}
