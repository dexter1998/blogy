/**
 * Tiny shared helpers for engine parsers. Kept separate from the engine
 * files so we can unit-test these without firing real HTTP requests.
 */

export function clean(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim();
}

export function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

/**
 * Bing/Yahoo wrap outbound links through internal redirects. We unwrap so
 * the consumer sees the actual destination, never the engine's tracker.
 */
export function unwrapRedirect(href: string, host: string): string {
  if (!href) return href;
  try {
    const u = new URL(href, `https://${host}`);
    // Bing: /search?q=…&url=… or /ck/a?…&u=a1<base64>
    if (u.hostname.endsWith("bing.com")) {
      const direct = u.searchParams.get("url");
      if (direct && isHttpUrl(direct)) return direct;
      const u64 = u.searchParams.get("u");
      if (u64 && u64.startsWith("a1")) {
        try {
          const raw = Buffer.from(u64.slice(2), "base64").toString("utf8");
          if (isHttpUrl(raw)) return raw;
        } catch {
          /* ignore */
        }
      }
    }
    // Yahoo: /RU=<encoded>/RK=…
    if (u.hostname.endsWith("yahoo.com")) {
      const m = u.pathname.match(/\/RU=([^/]+)/);
      if (m && m[1]) {
        try {
          const decoded = decodeURIComponent(m[1]);
          if (isHttpUrl(decoded)) return decoded;
        } catch {
          /* ignore */
        }
      }
    }
    // DuckDuckGo: //duckduckgo.com/l/?uddg=…
    if (u.hostname.endsWith("duckduckgo.com")) {
      const t = u.searchParams.get("uddg");
      if (t) {
        try {
          const decoded = decodeURIComponent(t);
          if (isHttpUrl(decoded)) return decoded;
        } catch {
          /* ignore */
        }
      }
    }
    // Google: /url?q=… (rare with html pages)
    if (u.hostname.endsWith("google.com") || u.pathname.startsWith("/url")) {
      const direct = u.searchParams.get("q") ?? u.searchParams.get("url");
      if (direct && isHttpUrl(direct)) return direct;
    }
    return href;
  } catch {
    return href;
  }
}
