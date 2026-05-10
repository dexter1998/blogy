import whois from "whois-json";
import type { Provider } from "@/providers/types";
import { timed } from "@/providers/_shared/cached-fetch";
import type { WhoisRecord } from "./types";

function parseWhoisDate(value: unknown): Date | null {
  if (!value) return null;
  const s = Array.isArray(value) ? String(value[0]) : String(value);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() < 1985 || d > new Date()) return null;
  return d;
}

export const nativeWhois: Provider<{ domain: string }, WhoisRecord> = {
  name: "whois-tcp-43",
  async fetch({ domain }) {
    const { value, tookMs } = await timed(async () => {
      try {
        const w = (await whois(domain, { follow: 2, timeout: 6000 })) as Record<string, unknown>;
        if (!w) return null;
        const created =
          parseWhoisDate(w.creationDate) ||
          parseWhoisDate(w.created) ||
          parseWhoisDate(w.createdOn) ||
          parseWhoisDate(w.registered) ||
          parseWhoisDate(w["Creation Date"]);
        const r = w.registrar ?? w["Registrar"];
        const registrar = typeof r === "string" ? r : null;
        const ageDays = created
          ? Math.floor((Date.now() - created.getTime()) / 86_400_000)
          : null;
        const ageYears = ageDays !== null ? Math.round((ageDays / 365.25) * 10) / 10 : null;
        if (!created && !registrar) return null;
        return {
          domain,
          createdAt: created ? created.toISOString() : null,
          registrar,
          ageDays,
          ageYears,
        } satisfies WhoisRecord;
      } catch {
        return null;
      }
    });
    return { source: "whois-tcp-43", data: value, tookMs };
  },
};
