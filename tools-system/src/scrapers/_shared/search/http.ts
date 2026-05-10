/**
 * Search-engine specific HTTP. Wraps the shared httpGet with:
 *  - User-Agent rotation (search engines aggressively fingerprint default UAs)
 *  - Retry on rate-limit / network blips with exponential backoff
 *  - Captcha / consent-page detection (so a "200 OK with captcha" isn't
 *    silently treated as success)
 */

import axios, { AxiosError } from "axios";
import { env } from "@/lib/env";

const UAS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

let uaCursor = 0;

function pickUa(): string {
  const ua = UAS[uaCursor % UAS.length]!;
  uaCursor = (uaCursor + 1) % UAS.length;
  return ua;
}

export type SearchHttpResult =
  | { ok: true; status: number; body: string; finalUrl: string }
  | { ok: false; status: number | null; error: SearchHttpError; message: string };

export type SearchHttpError =
  | "timeout"
  | "network"
  | "blocked"     // captcha / consent / 429
  | "http"
  | "unknown";

const CAPTCHA_PATTERNS = [
  /detected unusual traffic/i,
  /enablejs\?sei=/i,                                 // Google /sorry/index page
  /Our systems have detected unusual traffic/i,
  /id=["']captcha["']/i,
  /\/sorry\/index\?continue=/i,
  /Please verify you are a human/i,
  /<title>[^<]*Bing<\/title>[^<]*\b403\b/i,
];

function looksLikeBlock(body: string): boolean {
  if (!body) return false;
  const head = body.slice(0, 8000);
  return CAPTCHA_PATTERNS.some((re) => re.test(head));
}

export async function searchHttpGet(
  url: string,
  opts: {
    timeoutMs?: number;
    signal?: AbortSignal;
    retries?: number;
    headers?: Record<string, string>;
  } = {},
): Promise<SearchHttpResult> {
  const timeoutMs = opts.timeoutMs ?? env.scrapeTimeoutMs;
  const retries = opts.retries ?? 2;

  let lastError: { status: number | null; kind: SearchHttpError; message: string } = {
    status: null,
    kind: "unknown",
    message: "no attempt",
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ua = pickUa();
    try {
      const res = await axios.get<string>(url, {
        timeout: timeoutMs,
        signal: opts.signal,
        responseType: "text",
        validateStatus: () => true,
        maxRedirects: 5,
        transformResponse: (d) => (typeof d === "string" ? d : String(d ?? "")),
        headers: {
          "User-Agent": ua,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          ...(opts.headers ?? {}),
        },
      });

      const finalUrl =
        (res.request?.res?.responseUrl as string | undefined) ?? url;

      if (res.status === 429 || res.status === 503) {
        lastError = { status: res.status, kind: "blocked", message: `HTTP ${res.status}` };
      } else if (res.status >= 200 && res.status < 400) {
        if (looksLikeBlock(res.data)) {
          lastError = { status: res.status, kind: "blocked", message: "captcha_or_consent" };
        } else {
          return { ok: true, status: res.status, body: res.data, finalUrl };
        }
      } else {
        lastError = { status: res.status, kind: "http", message: `HTTP ${res.status}` };
      }
    } catch (e) {
      const ax = e as AxiosError;
      if (ax.code === "ECONNABORTED" || /aborted/i.test(ax.message ?? "")) {
        lastError = { status: null, kind: "timeout", message: "Request timed out" };
      } else if (ax.code === "ERR_CANCELED") {
        return { ok: false, status: null, error: "network", message: "canceled" };
      } else {
        lastError = { status: null, kind: "network", message: ax.message ?? "network error" };
      }
    }

    if (attempt < retries) {
      const backoff = 200 * Math.pow(2, attempt) + Math.floor(Math.random() * 150);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  return {
    ok: false,
    status: lastError.status,
    error: lastError.kind,
    message: lastError.message,
  };
}
