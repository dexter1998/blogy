/**
 * GEO scraper — Generative Engine Optimization analysis.
 *
 * GEO ≠ AI Readiness. AI Readiness checks whether a page *can* be
 * understood. GEO checks whether a page is *quotable*: do the AI
 * crawlers have access, are there short citable passages, does the
 * brand have entity signals, are there structured Q&A patterns the
 * answer engines like to lift directly.
 */

import * as cheerio from "cheerio";
import { env } from "@/lib/env";
import type { Scraper, ScrapeContext } from "@/scrapers/base/scraper";
import { ScrapeError } from "@/scrapers/base/scraper";
import { httpGet } from "@/scrapers/_shared/http";
import { loadPage, originOf } from "@/scrapers/_shared/html";
import type {
  AiCrawlerStatus,
  CitablePassage,
  GeoInput,
  GeoResult,
} from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// User-agents AI engines actually identify with. Source: each engine's
// public crawler documentation as of 2026.
const AI_BOTS = [
  "GPTBot", // OpenAI
  "OAI-SearchBot", // OpenAI ChatGPT search
  "ChatGPT-User", // OpenAI on-demand
  "ClaudeBot", // Anthropic
  "Claude-Web", // Anthropic
  "PerplexityBot",
  "Google-Extended", // Google AI training opt-out signal
  "Applebot-Extended",
  "CCBot", // Common Crawl (used by many)
  "Bytespider", // ByteDance / TikTok
  "FacebookBot",
];

function parseRobots(body: string): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  let current: string[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.split("#")[0]!.trim();
    if (!line) continue;
    const [k, ...rest] = line.split(":");
    const key = (k ?? "").trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      current = [value.toLowerCase()];
      groups[value.toLowerCase()] ??= [];
    } else if (current.length > 0) {
      for (const ua of current) {
        groups[ua] ??= [];
        groups[ua].push(`${key}: ${value}`);
      }
    }
  }
  return groups;
}

function isAllowed(groups: Record<string, string[]>, bot: string): { allowed: boolean; rule: string | null } {
  const target = bot.toLowerCase();
  const matchKey = Object.keys(groups).find((k) => k === target) ?? "*";
  const rules = groups[matchKey] ?? [];
  // If no specific rule and no wildcard, default allow
  if (rules.length === 0) return { allowed: true, rule: null };
  // Look for full disallow
  const fullDisallow = rules.find((r) => /^disallow:\s*\/\s*$/i.test(r));
  if (fullDisallow) return { allowed: false, rule: `${matchKey}: ${fullDisallow}` };
  return { allowed: true, rule: null };
}

function classifyPassage(text: string): CitablePassage["type"] {
  const t = text.trim();
  if (/^[A-Z][^.]*\bis\b\s/.test(t) && t.length < 280) return "definition";
  if (/\d/.test(t) && /(%|percent|million|billion|users?|customers?)/i.test(t)) return "stat";
  if (/^(yes|no)\b/i.test(t)) return "answer";
  if (t.startsWith('"') || t.startsWith("“")) return "quote";
  return "list-item";
}

function scorePassage(text: string, type: CitablePassage["type"]): number {
  let s = 30;
  const wc = text.split(/\s+/).filter(Boolean).length;
  if (wc >= 15 && wc <= 60) s += 30;
  else if (wc < 15) s += 10;
  else s += 0;
  if (/\d/.test(text)) s += 10;
  if (type === "definition") s += 20;
  if (type === "stat") s += 25;
  if (type === "answer") s += 15;
  if (text.includes(":")) s += 5;
  if (text.endsWith(".")) s += 5;
  return clamp(s);
}

function extractPassages($: cheerio.CheerioAPI): CitablePassage[] {
  const out: CitablePassage[] = [];
  let pos = 0;
  $("p, li").each((_, el) => {
    const text = ($(el).text() ?? "").replace(/\s+/g, " ").trim();
    if (!text) return;
    const wc = text.split(/\s+/).length;
    if (wc < 8 || wc > 90) return;
    pos += 1;
    const type = classifyPassage(text);
    out.push({
      text,
      type,
      position: pos,
      wordCount: wc,
      citabilityScore: scorePassage(text, type),
    });
  });
  return out
    .sort((a, b) => b.citabilityScore - a.citabilityScore)
    .slice(0, 25);
}

export const geoScraper: Scraper<GeoInput, GeoResult> = {
  name: "geo",
  cacheTtlSeconds: env.cacheTtlSeconds,

  cacheKey(input) {
    if (input.fresh) return null;
    return new URL(input.url).toString();
  },

  async execute(input, _ctx: ScrapeContext): Promise<GeoResult> {
    const loaded = await loadPage(input.url);
    if (!loaded.ok) {
      throw new ScrapeError("scrape_failed", `Could not fetch URL: ${loaded.error}`);
    }
    const { $, finalUrl } = loaded.page;
    const origin = originOf(finalUrl);
    const brandName = new URL(finalUrl).hostname.replace(/^www\./, "").split(".")[0]!;

    const robots = await httpGet(`${origin}/robots.txt`, { timeoutMs: 5000 });
    const groups = robots.ok ? parseRobots(robots.body) : {};
    const aiCrawlers: AiCrawlerStatus[] = AI_BOTS.map((bot) => {
      const r = isAllowed(groups, bot);
      return { bot, allowed: r.allowed, rule: r.rule };
    });

    const passages = extractPassages($);

    // ── Brand signals ──
    const visible = ($("body").text() ?? "").toLowerCase();
    const brandMentions = (visible.match(new RegExp(`\\b${brandName.toLowerCase()}\\b`, "g")) ?? []).length;

    let sameAsLinks: string[] = [];
    let organizationSchema = false;
    let websiteSchema = false;
    $('script[type="application/ld+json"]').each((_, el) => {
      const txt = ($(el).contents().text() ?? "").trim();
      if (!txt) return;
      try {
        const p = JSON.parse(txt);
        const arr: unknown[] = Array.isArray(p) ? p : (p && typeof p === "object" && Array.isArray((p as Record<string, unknown>)["@graph"]) ? ((p as Record<string, unknown>)["@graph"] as unknown[]) : [p]);
        for (const node of arr) {
          if (!node || typeof node !== "object") continue;
          const obj = node as Record<string, unknown>;
          const t = obj["@type"];
          const types = Array.isArray(t) ? t : typeof t === "string" ? [t] : [];
          if (types.includes("Organization") || types.includes("LocalBusiness")) {
            organizationSchema = true;
            const sa = obj["sameAs"];
            if (Array.isArray(sa)) sameAsLinks.push(...sa.filter((s): s is string => typeof s === "string"));
            else if (typeof sa === "string") sameAsLinks.push(sa);
          }
          if (types.includes("WebSite")) websiteSchema = true;
        }
      } catch {
        /* skip */
      }
    });
    sameAsLinks = Array.from(new Set(sameAsLinks));

    // ── Answerability signals ──
    const questionHeadings = $("h2, h3").toArray().filter((el) => /\?/.test($(el).text())).length;
    const answerability = {
      hasFaq: /"@type"\s*:\s*"FAQPage"/i.test(loaded.page.html),
      hasHowTo: /"@type"\s*:\s*"HowTo"/i.test(loaded.page.html),
      hasDefinitions: $("dl dt").length,
      hasNumberedLists: $("ol").length,
      hasBulletedLists: $("ul").length,
      hasTables: $("table").length,
      questionHeadings,
    };

    // ── Scores ──
    const top10Avg = passages.length
      ? passages.slice(0, 10).reduce((acc, p) => acc + p.citabilityScore, 0) / Math.min(10, passages.length)
      : 0;
    const citability = clamp(top10Avg);

    const allowedBots = aiCrawlers.filter((b) => b.allowed).length;
    const aiAccess = clamp((allowedBots / aiCrawlers.length) * 100);

    let brand = 0;
    if (organizationSchema) brand += 30;
    if (websiteSchema) brand += 15;
    brand += Math.min(25, sameAsLinks.length * 6);
    brand += Math.min(30, brandMentions * 3);

    let answer = 0;
    if (answerability.hasFaq) answer += 25;
    if (answerability.hasHowTo) answer += 15;
    answer += Math.min(15, answerability.questionHeadings * 5);
    if (answerability.hasDefinitions > 0) answer += 10;
    answer += Math.min(15, (answerability.hasNumberedLists + answerability.hasBulletedLists) * 4);
    if (answerability.hasTables > 0) answer += 10;
    answer += Math.min(10, passages.filter((p) => p.type === "answer" || p.type === "definition").length * 3);

    const scores = {
      citability,
      aiAccess,
      brandSignals: clamp(brand),
      answerability: clamp(answer),
      overall: 0,
    };
    scores.overall = clamp(
      scores.citability * 0.3 +
        scores.aiAccess * 0.25 +
        scores.brandSignals * 0.2 +
        scores.answerability * 0.25,
    );

    // ── Recommendations ──
    const recs: GeoResult["recommendations"] = [];
    const blocked = aiCrawlers.filter((b) => !b.allowed);
    if (blocked.length > 0)
      recs.push({ priority: "high", message: `Blocked AI crawlers: ${blocked.map((b) => b.bot).join(", ")}` });
    if (!organizationSchema) recs.push({ priority: "high", message: "Add Organization schema with sameAs to social profiles" });
    if (sameAsLinks.length < 3) recs.push({ priority: "medium", message: "Add more sameAs links to entity-link your brand" });
    if (!answerability.hasFaq && answerability.questionHeadings >= 3)
      recs.push({ priority: "medium", message: "Convert question headings into FAQPage schema" });
    if (top10Avg < 50)
      recs.push({ priority: "high", message: "Top passages are not citable: write 15–60 word definitions / stat-bearing answers" });
    if (answerability.hasNumberedLists + answerability.hasBulletedLists === 0)
      recs.push({ priority: "low", message: "Add lists — answer engines lift them directly" });
    void input.query;

    return {
      url: input.url,
      finalUrl,
      fetchedAt: new Date().toISOString(),
      scores,
      passages,
      aiCrawlers,
      brandSignals: { brandName, brandMentions, sameAsLinks, organizationSchema, websiteSchema },
      answerability,
      recommendations: recs,
    };
  },
};
