import type { Provider } from "@/providers/types";
import { timed } from "@/providers/_shared/cached-fetch";
import type { DnsRecord } from "./types";

type CfResp = {
  Status: number;
  Answer?: Array<{ name: string; type: number; data: string }>;
};

const TYPE = { A: 1, AAAA: 28, MX: 15, TXT: 16 } as const;

async function lookup(domain: string, type: number): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as CfResp;
    if (j.Status !== 0 || !j.Answer) return [];
    return j.Answer.filter((a) => a.type === type).map((a) =>
      type === TYPE.MX ? a.data.replace(/^\d+\s+/, "").replace(/\.$/, "") : a.data.replace(/^"|"$/g, ""),
    );
  } catch {
    return [];
  }
}

export const cloudflareDoh: Provider<{ domain: string }, DnsRecord> = {
  name: "cloudflare-doh",
  async fetch({ domain }) {
    const { value, tookMs } = await timed(async () => {
      const [a, aaaa, mx, txt, txtDmarc] = await Promise.all([
        lookup(domain, TYPE.A),
        lookup(domain, TYPE.AAAA),
        lookup(domain, TYPE.MX),
        lookup(domain, TYPE.TXT),
        lookup(`_dmarc.${domain}`, TYPE.TXT),
      ]);
      const hasSpf = txt.some((t) => t.toLowerCase().includes("v=spf1"));
      const hasDmarc = txtDmarc.some((t) => t.toLowerCase().includes("v=dmarc1"));
      if (a.length === 0 && aaaa.length === 0 && mx.length === 0 && txt.length === 0) {
        return null;
      }
      return { a, aaaa, mx, txt, hasSpf, hasDmarc } satisfies DnsRecord;
    });
    return { source: "cloudflare-doh", data: value, tookMs };
  },
};
