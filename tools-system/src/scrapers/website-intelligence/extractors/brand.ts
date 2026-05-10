import type { IntelligenceContext } from "../core/engine";
import { homePage } from "../core/fingerprint";
import type { BrandSignals } from "../types";

function absUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

export function extractBrand(ctx: IntelligenceContext): BrandSignals {
  const page = homePage(ctx);
  const $ = page.$;
  const finalUrl = page.finalUrl;

  // Website / brand name
  const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim() || null;
  const appleTitle = $('meta[name="apple-mobile-web-app-title"]').attr("content")?.trim() || null;
  const title = ($("title").first().text() ?? "").trim() || null;
  // common pattern: "Page · Brand" or "Page | Brand"
  let brandFromTitle: string | null = null;
  if (title) {
    const split = title.split(/[|·—–-]/).map((s) => s.trim()).filter(Boolean);
    if (split.length > 1) brandFromTitle = split[split.length - 1] ?? null;
  }
  const websiteName = ogSiteName ?? appleTitle ?? brandFromTitle ?? title;
  const brandName = ogSiteName ?? appleTitle ?? brandFromTitle ?? websiteName;

  // Tagline
  const tagline =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $("h1").first().text().trim() ||
    null;

  // Logo: try common signals
  const logoCandidate =
    $('img[alt*="logo" i]').first().attr("src") ||
    $('header img').first().attr("src") ||
    $('a[href="/"] img').first().attr("src") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    null;
  const logo = logoCandidate ? absUrl(finalUrl, logoCandidate) : null;

  const faviconCandidate =
    $('link[rel~="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    "/favicon.ico";
  const favicon = absUrl(finalUrl, faviconCandidate);

  const themeColor = $('meta[name="theme-color"]').attr("content")?.trim() || null;

  // Color palette: scrape inline <style> + common attribute occurrences.
  // We're not running CSS — we surface what's visible in the HTML/inline-CSS.
  const colorRe = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)/g;
  const colorBlob =
    ($("style").map((_, el) => $(el).text()).get().join("\n")) +
    "\n" +
    page.html.slice(0, 200_000);
  const colorMatches = colorBlob.match(colorRe) ?? [];
  const palette = Array.from(new Set(colorMatches.map((c) => c.toLowerCase())))
    .filter((c) => !/^#fff(f{0,5})?$/i.test(c) && !/^#000(0{0,5})?$/i.test(c))
    .slice(0, 12);

  // Fonts: from <link href="fonts.googleapis.com…"> + font-family in style
  const fonts = new Set<string>();
  for (const l of page.links) {
    if (/fonts\.googleapis|fonts\.gstatic/i.test(l.href)) {
      const m = l.href.match(/family=([^:&]+)/);
      if (m && m[1]) fonts.add(decodeURIComponent(m[1]).replace(/\+/g, " "));
    }
  }
  const ffMatches = colorBlob.match(/font-family\s*:\s*([^;{}\n]+)/gi) ?? [];
  for (const f of ffMatches.slice(0, 30)) {
    const fam = f.split(":")[1];
    if (!fam) continue;
    const first = fam.split(",")[0]?.trim().replace(/['";]/g, "");
    if (first && first.length < 40) fonts.add(first);
  }

  // Dark mode support
  const darkModeSupported =
    /prefers-color-scheme\s*:\s*dark/i.test(colorBlob) ||
    /\.dark\s*\{|data-theme="dark"|class="[^"]*\bdark\b/i.test(page.html);

  return {
    websiteName: websiteName || null,
    brandName: brandName || null,
    tagline,
    logo,
    favicon,
    themeColor,
    colorPalette: palette,
    fonts: Array.from(fonts).slice(0, 12),
    darkModeSupported,
  };
}
