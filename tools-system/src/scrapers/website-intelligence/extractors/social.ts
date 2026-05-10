import type { IntelligenceContext } from "../core/engine";
import type { SocialSignals } from "../types";

const PLATFORMS: Record<string, RegExp> = {
  linkedin: /^(?:https?:)?\/\/(?:www\.)?linkedin\.com\//i,
  twitter: /^(?:https?:)?\/\/(?:www\.)?(?:x\.com|twitter\.com)\//i,
  instagram: /^(?:https?:)?\/\/(?:www\.)?instagram\.com\//i,
  facebook: /^(?:https?:)?\/\/(?:www\.)?facebook\.com\//i,
  youtube: /^(?:https?:)?\/\/(?:www\.)?youtube\.com\//i,
  github: /^(?:https?:)?\/\/(?:www\.)?github\.com\//i,
  discord: /^(?:https?:)?\/\/(?:www\.)?discord\.(?:gg|com)\//i,
  telegram: /^(?:https?:)?\/\/(?:t\.me|telegram\.me)\//i,
  pinterest: /^(?:https?:)?\/\/(?:www\.)?pinterest\.[a-z.]+\//i,
  tiktok: /^(?:https?:)?\/\/(?:www\.)?tiktok\.com\//i,
  medium: /^(?:https?:)?\/\/(?:[\w-]+\.)?medium\.com\//i,
  reddit: /^(?:https?:)?\/\/(?:www\.)?reddit\.com\//i,
  threads: /^(?:https?:)?\/\/(?:www\.)?threads\.net\//i,
  whatsapp: /^(?:https?:)?\/\/(?:wa\.me|chat\.whatsapp\.com)\//i,
};

export function extractSocial(ctx: IntelligenceContext): SocialSignals {
  const seen = new Set<string>();
  const links: SocialSignals["links"] = [];
  const byPlatform: Record<string, string[]> = {};

  const consider = (href: string) => {
    for (const [platform, re] of Object.entries(PLATFORMS)) {
      if (re.test(href)) {
        const key = `${platform}:${href}`;
        if (seen.has(key)) return;
        seen.add(key);
        links.push({ platform, url: href });
        if (!byPlatform[platform]) byPlatform[platform] = [];
        byPlatform[platform]!.push(href);
        return;
      }
    }
  };

  for (const p of ctx.pages) {
    p.$("a[href]").each((_, el) => {
      const href = (p.$(el).attr("href") ?? "").trim();
      if (!href) return;
      try {
        const abs = new URL(href, p.finalUrl).toString();
        consider(abs);
      } catch {
        /* ignore bad URL */
      }
    });
  }

  return {
    count: links.length,
    byPlatform,
    links,
  };
}
