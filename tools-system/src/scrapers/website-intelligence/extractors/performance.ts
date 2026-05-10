import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { PerformanceSignals } from "../types";

export function extractPerformance(ctx: IntelligenceContext): PerformanceSignals {
  const home = homePage(ctx);
  const $ = home.$;
  const totalImages = $("img").length;
  let lazy = 0;
  $("img").each((_, el) => {
    const loading = ($(el).attr("loading") ?? "").toLowerCase();
    const dataSrc = $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (loading === "lazy" || dataSrc) lazy += 1;
  });
  let externalScripts = 0;
  let inlineScripts = 0;
  let renderBlockingScripts = 0;
  for (const s of home.scripts) {
    if (s.src) {
      externalScripts += 1;
      const headHas = home.html
        .slice(0, home.html.indexOf("</head>"))
        .includes(s.src);
      // crude: external script in head with no async/defer = render-blocking
      const tag = home.html.match(
        new RegExp(`<script[^>]*src=["']${s.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i"),
      )?.[0] ?? "";
      const blocking = headHas && !/\b(async|defer|type=["']module["'])\b/i.test(tag);
      if (blocking) renderBlockingScripts += 1;
    } else if (s.inline) {
      inlineScripts += 1;
    }
  }
  const styles = $("link[rel='stylesheet']").length + $("style").length;
  const fonts = home.links.filter((l) => /font/i.test(l.rel) || /\.woff2?(\?|$)/i.test(l.href)).length;
  const preconnects = home.links.filter((l) => /preconnect/i.test(l.rel)).length;
  const preloads = home.links.filter((l) => /preload/i.test(l.rel)).length;

  return {
    lazyLoadingImages: lazy,
    totalImages,
    scripts: home.scripts.length,
    externalScripts,
    inlineScripts,
    styles,
    fonts,
    preconnects,
    preloads,
    renderBlockingScripts,
  };
}
