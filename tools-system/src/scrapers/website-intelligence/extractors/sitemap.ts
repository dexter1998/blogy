import type { IntelligenceContext } from "../core/engine";
import type { SitemapSignals } from "../types";

export function extractSitemap(ctx: IntelligenceContext): SitemapSignals {
  return {
    robotsTxtFound: ctx.robots.found,
    robotsTxtUrl: ctx.robots.url,
    disallows: ctx.robots.disallows,
    userAgents: ctx.robots.userAgents,
    sitemapsDeclared: ctx.sitemap.declared,
    sitemapsDiscovered: ctx.sitemap.discovered,
    totalUrls: ctx.sitemap.totalUrls,
    truncated: ctx.sitemap.truncated,
    sampleUrls: ctx.sitemap.sample,
  };
}
