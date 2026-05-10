/**
 * Last-resort DNS provider using node:dns. Only used when both DoH endpoints
 * are unreachable (e.g. egress firewall blocks public resolvers).
 */

import dns from "node:dns/promises";
import type { Provider } from "@/providers/types";
import { timed } from "@/providers/_shared/cached-fetch";
import type { DnsRecord } from "./types";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const nativeDns: Provider<{ domain: string }, DnsRecord> = {
  name: "node-dns",
  async fetch({ domain }) {
    const { value, tookMs } = await timed(async () => {
      const [a, aaaa, mxRecs, txtRecs, dmarcTxt] = await Promise.all([
        safe(() => dns.resolve4(domain), [] as string[]),
        safe(() => dns.resolve6(domain), [] as string[]),
        safe(() => dns.resolveMx(domain), [] as Array<{ exchange: string }>),
        safe(() => dns.resolveTxt(domain), [] as string[][]),
        safe(() => dns.resolveTxt(`_dmarc.${domain}`), [] as string[][]),
      ]);
      const mx = mxRecs.map((r) => r.exchange.replace(/\.$/, ""));
      const txt = txtRecs.map((r) => r.join(""));
      const hasSpf = txt.some((t) => t.toLowerCase().includes("v=spf1"));
      const hasDmarc = dmarcTxt.some((r) => r.join("").toLowerCase().includes("v=dmarc1"));
      if (a.length === 0 && aaaa.length === 0 && mx.length === 0 && txt.length === 0) {
        return null;
      }
      return { a, aaaa, mx, txt, hasSpf, hasDmarc } satisfies DnsRecord;
    });
    return { source: "node-dns", data: value, tookMs };
  },
};
