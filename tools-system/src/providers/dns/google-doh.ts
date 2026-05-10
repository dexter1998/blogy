import type { Provider } from "@/providers/types";
import { fetchJson, timed } from "@/providers/_shared/cached-fetch";
import type { DnsRecord } from "./types";

type GoogleDohResp = {
  Status: number;
  Answer?: Array<{ name: string; type: number; data: string }>;
};

const TYPE = { A: 1, AAAA: 28, MX: 15, TXT: 16 } as const;

async function lookup(domain: string, type: number): Promise<string[]> {
  const r = await fetchJson<GoogleDohResp>(
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
    { timeoutMs: 4000 },
  );
  if (!r || r.Status !== 0 || !r.Answer) return [];
  return r.Answer.filter((a) => a.type === type).map((a) =>
    type === TYPE.MX ? a.data.replace(/^\d+\s+/, "").replace(/\.$/, "") : a.data,
  );
}

export const googleDoh: Provider<{ domain: string }, DnsRecord> = {
  name: "google-doh",
  async fetch({ domain }) {
    const { value, tookMs } = await timed(async () => {
      const [a, aaaa, mx, txtRoot, txtDmarc] = await Promise.all([
        lookup(domain, TYPE.A),
        lookup(domain, TYPE.AAAA),
        lookup(domain, TYPE.MX),
        lookup(domain, TYPE.TXT),
        lookup(`_dmarc.${domain}`, TYPE.TXT),
      ]);
      const txt = txtRoot.map((s) => s.replace(/"/g, ""));
      const hasSpf = txt.some((t) => t.toLowerCase().includes("v=spf1"));
      const hasDmarc = txtDmarc.some((t) => t.toLowerCase().includes("v=dmarc1"));
      if (a.length === 0 && aaaa.length === 0 && mx.length === 0 && txt.length === 0) {
        return null;
      }
      return { a, aaaa, mx, txt, hasSpf, hasDmarc } satisfies DnsRecord;
    });
    return { source: "google-doh", data: value, tookMs };
  },
};
