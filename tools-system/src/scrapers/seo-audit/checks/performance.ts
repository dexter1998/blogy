import type { CheckDef } from "./types";

export const performanceChecks: CheckDef[] = [
  {
    id: "cwv-mobile",
    title: "Core Web Vitals (mobile)",
    category: "performance",
    weight: 3,
    whyItMatters:
      "Google uses real-user CWV as a ranking signal for mobile. A failing assessment hurts visibility on the device that drives most search traffic.",
    howToFix:
      "Tackle the worst metric first: LCP > 2.5s usually means hero image / fonts; CLS > 0.1 means layout shifts; INP > 200ms means heavy JS on interaction.",
    run: (s) => {
      const ps = s.pagespeedMobile;
      if (!ps) return null;
      if (ps.field.coreWebVitalsAssessment === "PASS") {
        return { status: "pass", summary: "Real-user CWV: PASS.", evidence: ps.field.metrics.map((m) => ({ label: m.metric, value: `${m.value ?? "—"}${m.unit === "ms" ? "ms" : ""}` })) };
      }
      if (ps.field.coreWebVitalsAssessment === "FAIL") {
        const failing = ps.field.metrics.filter((m) => m.category === "poor" || m.category === "needs-improvement");
        return {
          status: "fail",
          summary: `Real-user CWV: FAIL — ${failing.map((m) => m.metric).join(", ")} need work.`,
          evidence: ps.field.metrics.map((m) => ({ label: m.metric, value: `${m.value ?? "—"} (${m.category})` })),
        };
      }
      return { status: "info", summary: "Google has no real-user CWV data for this URL yet.", evidence: [] };
    },
  },
  {
    id: "lighthouse-mobile",
    title: "PageSpeed score (mobile)",
    category: "performance",
    weight: 2,
    whyItMatters:
      "Lighthouse lab data is a deterministic proxy for performance. Sub-90 scores almost always reflect a real user-experience problem.",
    howToFix: "Open the PageSpeed Insights report (Tools → PageSpeed Checker) and work through the top opportunities by savings.",
    run: (s) => {
      const ps = s.pagespeedMobile;
      const score = ps?.lab.performanceScore;
      if (score == null) return null;
      if (score >= 90) return { status: "pass", summary: `Lighthouse mobile score: ${score}.`, evidence: [{ label: "Score", value: score }] };
      if (score >= 50) return { status: "warn", summary: `Lighthouse mobile score: ${score} (target ≥ 90).`, evidence: [{ label: "Score", value: score }] };
      return { status: "fail", summary: `Lighthouse mobile score: ${score} — poor.`, evidence: [{ label: "Score", value: score }] };
    },
  },
  {
    id: "lighthouse-desktop",
    title: "PageSpeed score (desktop)",
    category: "performance",
    weight: 1,
    whyItMatters: "Desktop scores set the ceiling — a slow desktop site usually means slow infrastructure or heavy assets.",
    howToFix: "Same opportunities as mobile, but desktop has less budget — sub-95 here means real waste.",
    run: (s) => {
      const score = s.pagespeedDesktop?.lab.performanceScore;
      if (score == null) return null;
      if (score >= 95) return { status: "pass", summary: `Lighthouse desktop score: ${score}.`, evidence: [{ label: "Score", value: score }] };
      if (score >= 70) return { status: "warn", summary: `Lighthouse desktop score: ${score}.`, evidence: [{ label: "Score", value: score }] };
      return { status: "fail", summary: `Lighthouse desktop score: ${score} — poor.`, evidence: [{ label: "Score", value: score }] };
    },
  },
  {
    id: "render-blocking",
    title: "No render-blocking scripts",
    category: "performance",
    weight: 1,
    whyItMatters: "Render-blocking <script> in <head> delays First Contentful Paint and pushes LCP further out.",
    howToFix: "Add `defer` or `async` to non-critical scripts. Move analytics to the end of <body>.",
    run: (s) => {
      const n = s.intelligence?.signals.performance.renderBlockingScripts;
      if (n == null) return null;
      if (n === 0) return { status: "pass", summary: "No render-blocking scripts.", evidence: [] };
      if (n <= 2) return { status: "warn", summary: `${n} render-blocking script(s).`, evidence: [{ label: "Count", value: n }] };
      return { status: "fail", summary: `${n} render-blocking scripts.`, evidence: [{ label: "Count", value: n }] };
    },
  },
  {
    id: "script-count",
    title: "Reasonable number of <script> tags",
    category: "performance",
    weight: 0.5,
    whyItMatters: "Each script adds parse/eval cost. Sites with 50+ scripts almost always have third-party bloat.",
    howToFix: "Audit third-party scripts (chat, A/B, ads). Lazy-load anything not needed for the initial render.",
    run: (s) => {
      const n = s.intelligence?.signals.performance.scripts;
      if (n == null) return null;
      if (n <= 20) return { status: "pass", summary: `${n} <script> tags.`, evidence: [{ label: "Count", value: n }] };
      if (n <= 40) return { status: "warn", summary: `${n} <script> tags — consider trimming.`, evidence: [{ label: "Count", value: n }] };
      return { status: "fail", summary: `${n} <script> tags — heavy.`, evidence: [{ label: "Count", value: n }] };
    },
  },
  {
    id: "preconnect-hints",
    title: "Preconnect / preload hints used",
    category: "performance",
    weight: 0.3,
    whyItMatters: "Preconnect cuts DNS+TLS round-trips on third-party origins. Preload pre-warms critical resources.",
    howToFix: "Add <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin> for major third-party origins.",
    run: (s) => {
      const p = s.intelligence?.signals.performance.preconnects;
      if (p == null) return null;
      if (p > 0) return { status: "pass", summary: `${p} preconnect hint(s).`, evidence: [{ label: "Count", value: p }] };
      return { status: "info", summary: "No preconnect hints.", evidence: [] };
    },
  },
  {
    id: "image-lazy-loading",
    title: "Images are lazy-loaded",
    category: "performance",
    weight: 1,
    whyItMatters: "Eagerly-loaded below-the-fold images steal bandwidth from the LCP element.",
    howToFix: "Add `loading=\"lazy\"` to every <img> below the fold. Keep the LCP image eager.",
    run: (s) => {
      const perf = s.intelligence?.signals.performance;
      if (!perf || perf.totalImages === 0) return null;
      const ratio = perf.lazyLoadingImages / perf.totalImages;
      if (ratio >= 0.6) return { status: "pass", summary: `${perf.lazyLoadingImages}/${perf.totalImages} images lazy-loaded.`, evidence: [{ label: "Ratio", value: `${(ratio * 100).toFixed(0)}%` }] };
      if (ratio >= 0.2) return { status: "warn", summary: `Only ${perf.lazyLoadingImages}/${perf.totalImages} images lazy-loaded.`, evidence: [{ label: "Ratio", value: `${(ratio * 100).toFixed(0)}%` }] };
      return { status: "fail", summary: `Only ${perf.lazyLoadingImages}/${perf.totalImages} images lazy-loaded.`, evidence: [{ label: "Ratio", value: `${(ratio * 100).toFixed(0)}%` }] };
    },
  },
  {
    id: "image-weight",
    title: "Total image weight under budget",
    category: "performance",
    weight: 1,
    whyItMatters: "Images dominate page weight on most sites. Anything over 2MB of images on a single page is a smell.",
    howToFix: "Convert to WebP/AVIF, resize to actual rendered dimensions, and use `srcset` for responsive serving.",
    run: (s) => {
      const ia = s.images;
      if (!ia) return null;
      const kb = Math.round(ia.totalBytes / 1024);
      if (ia.totalBytes <= 1_500_000) return { status: "pass", summary: `${kb} KB of images.`, evidence: [{ label: "Total", value: `${kb} KB` }] };
      if (ia.totalBytes <= 3_000_000) return { status: "warn", summary: `${kb} KB of images — heavy.`, evidence: [{ label: "Total", value: `${kb} KB` }] };
      return { status: "fail", summary: `${kb} KB of images — way over budget.`, evidence: [{ label: "Total", value: `${kb} KB` }] };
    },
  },
  {
    id: "image-oversized",
    title: "No oversized images",
    category: "performance",
    weight: 1,
    whyItMatters: "Individual images over 200 KB are almost always larger than they need to be.",
    howToFix: "Compress with mozjpeg/oxipng or convert to WebP/AVIF. Resize to the rendered display size.",
    run: (s) => {
      const ia = s.images;
      if (!ia) return null;
      if (ia.oversized.length === 0) return { status: "pass", summary: "No oversized images.", evidence: [] };
      const big = ia.oversized.slice(0, 5).map((i) => `${i.src} (${Math.round(i.bytes / 1024)} KB)`);
      return {
        status: ia.oversized.length > 3 ? "fail" : "warn",
        summary: `${ia.oversized.length} image(s) over 200 KB.`,
        evidence: [{ label: "Worst", value: big }],
        affectedUrls: ia.oversized.map((i) => i.src),
      };
    },
  },
  {
    id: "image-modern-format",
    title: "Modern image formats (WebP/AVIF)",
    category: "performance",
    weight: 0.5,
    whyItMatters: "WebP is ~30% smaller than JPEG, AVIF ~50%. Modern browsers all support both.",
    howToFix: "Serve WebP/AVIF with a <picture> fallback or via your image CDN.",
    run: (s) => {
      const ia = s.images;
      if (!ia || ia.checked === 0) return null;
      const ratio = ia.legacyFormats.length / Math.max(1, ia.checked);
      if (ratio <= 0.2) return { status: "pass", summary: "Most images use modern formats.", evidence: [{ label: "Legacy", value: ia.legacyFormats.length }] };
      if (ratio <= 0.6) return { status: "warn", summary: `${ia.legacyFormats.length} legacy-format image(s).`, evidence: [{ label: "Legacy", value: ia.legacyFormats.length }] };
      return { status: "fail", summary: `${ia.legacyFormats.length} legacy-format image(s).`, evidence: [{ label: "Legacy", value: ia.legacyFormats.length }] };
    },
  },
];
