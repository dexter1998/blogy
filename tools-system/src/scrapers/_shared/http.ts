/**
 * Shared HTTP client used by all scrapers.
 * - Sensible default timeout
 * - Consistent User-Agent (so we don't look like a botnet)
 * - Soft retry on transient network errors (max 1 retry)
 * - Always returns a *result* object instead of throwing on HTTP errors,
 *   because scrapers want to score "site responded with 500" as a signal,
 *   not crash the whole tool.
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import { env } from "@/lib/env";

export type HttpResult =
  | {
      ok: true;
      status: number;
      headers: Record<string, string>;
      body: string;
      finalUrl: string;
    }
  | {
      ok: false;
      status: number | null;
      error: "timeout" | "network" | "http" | "unknown";
      message: string;
      finalUrl?: string;
    };

const TRANSIENT_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"]);

export async function httpGet(
  url: string,
  opts: { timeoutMs?: number; signal?: AbortSignal; maxRedirects?: number } = {},
): Promise<HttpResult> {
  const timeoutMs = opts.timeoutMs ?? env.scrapeTimeoutMs;

  const attempt = async (): Promise<HttpResult> => {
    try {
      const res: AxiosResponse<string> = await axios.get(url, {
        timeout: timeoutMs,
        signal: opts.signal,
        maxRedirects: opts.maxRedirects ?? 5,
        responseType: "text",
        validateStatus: () => true,
        transformResponse: (d) => (typeof d === "string" ? d : String(d ?? "")),
        headers: {
          "User-Agent": env.scrapeUserAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.headers)) {
        if (typeof v === "string") headers[k.toLowerCase()] = v;
        else if (Array.isArray(v)) headers[k.toLowerCase()] = v.join(", ");
      }
      const finalUrl = (res.request?.res?.responseUrl as string | undefined) ?? url;
      if (res.status >= 200 && res.status < 400) {
        return { ok: true, status: res.status, headers, body: res.data, finalUrl };
      }
      return {
        ok: false,
        status: res.status,
        error: "http",
        message: `HTTP ${res.status}`,
        finalUrl,
      };
    } catch (e) {
      const ax = e as AxiosError;
      if (ax.code === "ECONNABORTED" || ax.message?.includes("aborted")) {
        return { ok: false, status: null, error: "timeout", message: "Request timed out" };
      }
      if (ax.code && TRANSIENT_CODES.has(ax.code)) {
        return { ok: false, status: null, error: "network", message: ax.message };
      }
      return {
        ok: false,
        status: null,
        error: "unknown",
        message: ax.message || "Unknown error",
      };
    }
  };

  let result = await attempt();
  if (!result.ok && (result.error === "network" || result.error === "timeout")) {
    result = await attempt();
  }
  return result;
}
