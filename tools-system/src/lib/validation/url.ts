import { z } from "zod";

const URL_PROTOCOL_RE = /^https?:\/\//i;

/**
 * Accepts both bare hostnames ("blogy.in") and full URLs ("https://blogy.in/foo"),
 * normalizes to a full URL with protocol, lowercases hostname, strips fragment.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProto = URL_PROTOCOL_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProto);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  return u.toString().replace(/\/$/, "");
}

export const urlSchema = z
  .string()
  .min(3)
  .max(2048)
  .transform((v, ctx) => {
    try {
      return normalizeUrl(v);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL" });
      return z.NEVER;
    }
  });

export const urlsSchema = z
  .array(urlSchema)
  .min(1, "At least one URL required")
  .max(25, "Max 25 URLs per request");
