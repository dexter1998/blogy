/**
 * YouTube channel activity scraper.
 *
 * Finds the first YouTube channel/handle link on the page (via the social
 * extractor) and fetches the channel "about" page to pull subscriber +
 * view counts from the embedded ytInitialData blob. No YouTube Data API.
 */

import type { IntelligenceContext } from "../core/engine";
import { httpGet } from "@/scrapers/_shared/http";
import { extractSocial } from "./social";
import type { YouTubeSignals } from "../types";

const SUB_PATTERNS = [
  /"subscriberCountText":\s*\{"accessibility":\{"accessibilityData":\{"label":"([^"]+?)"/,
  /"subscriberCountText":\s*\{"simpleText":"([^"]+?)"/,
  /"metadataParts":\[\{"text":\{"content":"([\d.,]+[KMB]?\s+subscribers?)"/i,
];

const VIEW_PATTERNS = [
  /"viewCountText":\s*\{"simpleText":"([^"]+?)"/,
  /"videosCountText":\s*\{"runs":\[\{"text":"([\d.,]+)"/,
];

function pickChannelUrl(yt: string[]): string | null {
  if (yt.length === 0) return null;
  // Prefer canonical channel/handle/user URLs.
  const canonical = yt.find((u) => /\/channel\/|\/@|\/user\/|\/c\//.test(u));
  return canonical ?? yt[0] ?? null;
}

function aboutUrl(channelUrl: string): string {
  // Strip trailing video/playlist params; append "/about".
  const cleaned = channelUrl.replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (/\/about$/.test(cleaned)) return cleaned;
  return `${cleaned}/about`;
}

function parseHumanNumber(raw: string): number | null {
  const m = raw.replace(/[,\s]/g, "").match(/([\d.]+)([KMB]?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const mult = (m[2] ?? "").toUpperCase();
  if (mult === "K") return Math.round(n * 1_000);
  if (mult === "M") return Math.round(n * 1_000_000);
  if (mult === "B") return Math.round(n * 1_000_000_000);
  return Math.round(n);
}

export async function extractYouTube(ctx: IntelligenceContext): Promise<YouTubeSignals> {
  const social = extractSocial(ctx);
  const yt = social.byPlatform.youtube ?? [];
  const channelUrl = pickChannelUrl(yt);

  if (!channelUrl) {
    return {
      linked: false,
      channelUrl: null,
      subscribers: null,
      subscribersText: null,
      totalViews: null,
      totalViewsText: null,
    };
  }

  // Try the about page first — it always has the subscriber count text.
  const candidates = [aboutUrl(channelUrl), channelUrl];
  let html = "";
  for (const url of candidates) {
    const r = await httpGet(url, { timeoutMs: 5000 });
    if (r.ok && r.body && r.body.length > 1000) {
      html = r.body;
      break;
    }
  }

  if (!html) {
    return {
      linked: true,
      channelUrl,
      subscribers: null,
      subscribersText: null,
      totalViews: null,
      totalViewsText: null,
    };
  }

  let subscribersText: string | null = null;
  for (const p of SUB_PATTERNS) {
    const m = html.match(p);
    if (m && m[1]) {
      subscribersText = m[1];
      break;
    }
  }
  const subscribers = subscribersText ? parseHumanNumber(subscribersText) : null;

  let totalViewsText: string | null = null;
  for (const p of VIEW_PATTERNS) {
    const m = html.match(p);
    if (m && m[1]) {
      totalViewsText = m[1];
      break;
    }
  }
  const totalViews = totalViewsText ? parseHumanNumber(totalViewsText) : null;

  return {
    linked: true,
    channelUrl,
    subscribers,
    subscribersText,
    totalViews,
    totalViewsText,
  };
}
