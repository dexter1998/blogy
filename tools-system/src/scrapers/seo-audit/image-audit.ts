/**
 * Image audit — extracts every <img> from the home page HTML, HEADs each
 * one to recover Content-Length + Content-Type, and flags oversized /
 * legacy-format / missing-alt items.
 *
 * Capped at 30 images so a gallery page doesn't run the audit out of
 * budget on Vercel.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { httpGet } from "@/scrapers/_shared/http";
import { env } from "@/lib/env";
import type { ImageAuditResult } from "./report-types";

const MAX_IMAGES = 30;
const HEAD_TIMEOUT_MS = 4000;
const OVERSIZED_BYTES = 200_000;

type ImgEntry = { src: string; alt: string; loading: string };

function extractImages($: cheerio.CheerioAPI, base: string): ImgEntry[] {
  const seen = new Set<string>();
  const out: ImgEntry[] = [];
  $("img").each((_, el) => {
    const $el = $(el);
    let src = ($el.attr("src") ?? "").trim();
    if (!src) {
      // Try srcset first entry.
      const srcset = ($el.attr("srcset") ?? "").trim();
      if (srcset) src = (srcset.split(",")[0] ?? "").trim().split(/\s+/)[0] ?? "";
    }
    if (!src || src.startsWith("data:")) return;
    let abs: string;
    try {
      abs = new URL(src, base).toString();
    } catch {
      return;
    }
    if (seen.has(abs)) return;
    seen.add(abs);
    out.push({
      src: abs,
      alt: ($el.attr("alt") ?? "").trim(),
      loading: ($el.attr("loading") ?? "").trim(),
    });
  });
  return out;
}

async function headOne(url: string): Promise<{ bytes: number | null; mime: string | null }> {
  try {
    const r = await axios.head(url, {
      timeout: HEAD_TIMEOUT_MS,
      maxRedirects: 3,
      validateStatus: () => true,
      headers: { "User-Agent": env.scrapeUserAgent },
    });
    const cl = r.headers["content-length"];
    const ct = r.headers["content-type"];
    return {
      bytes: typeof cl === "string" ? Number(cl) || null : null,
      mime: typeof ct === "string" ? ct.split(";")[0]?.trim() ?? null : null,
    };
  } catch {
    return { bytes: null, mime: null };
  }
}

const LEGACY_MIME = /^image\/(jpeg|jpg|png|gif)$/i;

export async function runImageAudit(url: string): Promise<ImageAuditResult | null> {
  const page = await httpGet(url);
  if (!page.ok) return null;
  const $ = cheerio.load(page.body);
  const imgs = extractImages($, page.finalUrl).slice(0, MAX_IMAGES);

  const missingAlt: string[] = [];
  const lazyImgs: string[] = [];
  for (const i of imgs) {
    if (!i.alt) missingAlt.push(i.src);
    if (i.loading.toLowerCase() === "lazy") lazyImgs.push(i.src);
  }

  // HEAD each image in parallel (bounded concurrency: just do them all
  // since we capped at MAX_IMAGES).
  const heads = await Promise.all(imgs.map((i) => headOne(i.src)));

  let totalBytes = 0;
  const oversized: ImageAuditResult["oversized"] = [];
  const legacy: string[] = [];
  let checked = 0;
  for (let i = 0; i < imgs.length; i += 1) {
    const meta = heads[i]!;
    const img = imgs[i]!;
    if (meta.bytes != null) {
      checked += 1;
      totalBytes += meta.bytes;
      if (meta.bytes >= OVERSIZED_BYTES) oversized.push({ src: img.src, bytes: meta.bytes, mime: meta.mime });
    }
    if (meta.mime && LEGACY_MIME.test(meta.mime)) legacy.push(img.src);
  }

  return {
    totalImages: imgs.length,
    checked,
    oversized,
    missingAlt,
    lazyCount: lazyImgs.length,
    legacyFormats: legacy,
    totalBytes,
  };
}
