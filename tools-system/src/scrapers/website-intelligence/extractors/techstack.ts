import type { IntelligenceContext } from "../core/engine";
import { findMatches, firstHeader, type Pattern } from "../core/fingerprint";
import type { TechStackSignals } from "../types";

type Bucket = "frameworks" | "cms" | "hosting" | "cdn" | "buildTools";

const ENTRIES: Array<{ bucket: Bucket; pattern: Pattern }> = [
  // ── Frontend frameworks ────────────────────────
  {
    bucket: "frameworks",
    pattern: {
      name: "Next.js",
      scriptSrc: [/_next\/static/i],
      html: [/<div id="__next"/i, /__NEXT_DATA__/i],
      header: { "x-powered-by": [/Next\.js/i] },
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Nuxt",
      html: [/__NUXT__/i, /<div id="__nuxt"/i],
      scriptSrc: [/_nuxt\//i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "React",
      inline: [/__REACT_DEVTOOLS_GLOBAL_HOOK__/i],
      html: [/data-reactroot|data-reactid/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Vue.js",
      inline: [/__VUE_HMR_RUNTIME__|new Vue\(/i],
      html: [/data-v-[a-f0-9]{6,}/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Angular",
      html: [/ng-version=|ng-app=|ng-controller=/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Svelte",
      html: [/svelte-[a-z0-9]{6,}/i],
      scriptSrc: [/_app\/immutable/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "SvelteKit",
      scriptSrc: [/_app\/immutable\/start/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Remix",
      html: [/__remixContext|__remixManifest/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Gatsby",
      html: [/<div id="___gatsby"/i, /__GATSBY/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "Astro",
      html: [/astro-island|data-astro-cid/i],
    },
  },
  {
    bucket: "frameworks",
    pattern: {
      name: "jQuery",
      scriptSrc: [/jquery(?:\.min)?\.js/i, /jquery-\d/i],
    },
  },
  // ── CMS / site builders ────────────────────────
  {
    bucket: "cms",
    pattern: {
      name: "WordPress",
      html: [/\/wp-content\/|\/wp-includes\//i],
      meta: [/=WordPress\b/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Shopify",
      html: [/cdn\.shopify\.com|Shopify\.shop/i],
      header: { "x-shopid": [/.+/], "x-shopify-stage": [/.+/] },
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Wix",
      html: [/static\.wixstatic\.com|wix-bolt|X-Wix-Request-Id/i],
      header: { "x-wix-request-id": [/.+/] },
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Webflow",
      html: [/data-wf-(?:site|page|domain)|webflow\.com/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Framer",
      html: [/framerusercontent\.com|data-framer/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Squarespace",
      html: [/squarespace-cdn|static1\.squarespace\.com/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Drupal",
      html: [/Drupal\.settings|drupal-/i],
      meta: [/=Drupal\b/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Joomla",
      meta: [/=Joomla\b/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Ghost",
      meta: [/=Ghost\b/i],
      html: [/ghost-sdk|content\.ghost\.io/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "BigCommerce",
      html: [/cdn\.bcapp\.dev|bigcommerce\.com\/store/i],
    },
  },
  {
    bucket: "cms",
    pattern: {
      name: "Magento",
      html: [/Magento_|skin\/frontend\//i],
      header: { "x-magento-tags": [/.+/] },
    },
  },
  // ── Hosting / build / CDN ──────────────────────
  {
    bucket: "hosting",
    pattern: {
      name: "Vercel",
      header: { server: [/Vercel/i], "x-vercel-id": [/.+/], "x-vercel-cache": [/.+/] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "Netlify",
      header: { server: [/Netlify/i], "x-nf-request-id": [/.+/] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "GitHub Pages",
      header: { server: [/GitHub\.com/i] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "AWS",
      header: {
        server: [/AmazonS3|CloudFront/i],
        "x-amz-cf-id": [/.+/],
        "x-amz-request-id": [/.+/],
      },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "Google Cloud",
      header: { "x-cloud-trace-context": [/.+/], server: [/Google Frontend/i] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "Firebase Hosting",
      header: { "x-firebase-cache-status": [/.+/], "x-served-by": [/firebase/i] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "Heroku",
      header: { "via": [/vegur/i] },
    },
  },
  {
    bucket: "hosting",
    pattern: {
      name: "Render",
      header: { "x-render-origin-server": [/.+/] },
    },
  },
  {
    bucket: "cdn",
    pattern: {
      name: "Cloudflare",
      header: { server: [/cloudflare/i], "cf-ray": [/.+/], "cf-cache-status": [/.+/] },
    },
  },
  {
    bucket: "cdn",
    pattern: {
      name: "Fastly",
      header: { "x-served-by": [/cache-/i], "x-fastly-request-id": [/.+/] },
    },
  },
  {
    bucket: "cdn",
    pattern: {
      name: "Akamai",
      header: { "x-akamai-transformed": [/.+/], "x-cache-key": [/akamai/i] },
    },
  },
  {
    bucket: "cdn",
    pattern: {
      name: "Bunny CDN",
      header: { server: [/BunnyCDN/i], "cdn-cache-control": [/.+/] },
    },
  },
  {
    bucket: "buildTools",
    pattern: {
      name: "Webpack",
      inline: [/webpackChunk|__webpack_require__/i],
    },
  },
  {
    bucket: "buildTools",
    pattern: {
      name: "Vite",
      scriptSrc: [/\/@vite\/client/i, /\/assets\/index-[a-zA-Z0-9_-]+\.js/i],
      inline: [/import\.meta\.env/i],
    },
  },
  {
    bucket: "buildTools",
    pattern: {
      name: "Turbopack",
      inline: [/turbopack-/i],
    },
  },
];

export function extractTechStack(ctx: IntelligenceContext): TechStackSignals {
  const buckets: Record<Bucket, string[]> = {
    frameworks: [],
    cms: [],
    hosting: [],
    cdn: [],
    buildTools: [],
  };
  const evidence: TechStackSignals["evidence"] = [];
  for (const e of ENTRIES) {
    const found = findMatches(ctx, [e.pattern]);
    if (found.length === 0) continue;
    buckets[e.bucket].push(e.pattern.name);
    for (const m of found[0]!.matches) {
      evidence.push({ tech: e.pattern.name, via: m.via, sample: m.sample });
    }
  }
  // Bonus: x-powered-by header capture
  const xpb = firstHeader(ctx, "x-powered-by");
  if (xpb && !evidence.some((e) => e.via === "header" && /x-powered-by/i.test(e.sample))) {
    evidence.push({ tech: xpb, via: "header", sample: `x-powered-by: ${xpb}` });
  }

  return {
    frameworks: Array.from(new Set(buckets.frameworks)),
    cms: Array.from(new Set(buckets.cms)),
    hosting: Array.from(new Set(buckets.hosting)),
    cdn: Array.from(new Set(buckets.cdn)),
    buildTools: Array.from(new Set(buckets.buildTools)),
    evidence,
  };
}
