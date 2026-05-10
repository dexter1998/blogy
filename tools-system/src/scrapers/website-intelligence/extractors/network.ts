/**
 * Network signals — Server IP (A record), authoritative nameservers (NS),
 * raw DMARC + SPF TXT records. All via Google DoH (with a Cloudflare DoH
 * fallback) so it works in Vercel's serverless runtime without raw UDP.
 */

import type { IntelligenceContext } from "../core/engine";
import { fetchJson } from "@/providers/_shared/cached-fetch";
import type { NetworkSignals } from "../types";

type DohResp = {
  Status: number;
  Answer?: Array<{ name: string; type: number; data: string; TTL?: number }>;
};

const TYPE = { A: 1, NS: 2, TXT: 16 } as const;

async function dohLookup(name: string, type: number): Promise<string[]> {
  const endpoints = [
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
  ];
  for (const url of endpoints) {
    const r = await fetchJson<DohResp>(url, {
      timeoutMs: 4000,
      headers: { Accept: "application/dns-json" },
    });
    if (r && r.Status === 0 && r.Answer && r.Answer.length > 0) {
      return r.Answer
        .filter((a) => a.type === type)
        .map((a) => a.data.replace(/^"|"$/g, "").trim());
    }
  }
  return [];
}

function unquote(s: string): string {
  // DoH returns TXT records as joined chunks with embedded quotes; clean them.
  return s.replace(/^"|"$/g, "").replace(/"\s*"/g, "").trim();
}

export async function extractNetwork(ctx: IntelligenceContext): Promise<NetworkSignals> {
  const domain = ctx.rootDomain;
  if (!domain || !/\./.test(domain)) {
    return emptyNetwork();
  }

  const [a, ns, txtRoot, txtDmarc] = await Promise.all([
    dohLookup(domain, TYPE.A),
    dohLookup(domain, TYPE.NS),
    dohLookup(domain, TYPE.TXT),
    dohLookup(`_dmarc.${domain}`, TYPE.TXT),
  ]);

  const txt = txtRoot.map(unquote);
  const dmarcLines = txtDmarc.map(unquote).filter((t) => /v=DMARC1/i.test(t));
  const spfLines = txt.filter((t) => /v=spf1/i.test(t));

  return {
    serverIp: a[0] ?? null,
    allIps: a,
    dnsServers: ns.map((n) => n.replace(/\.$/, "")).sort(),
    spf: {
      present: spfLines.length > 0,
      records: spfLines,
    },
    dmarc: {
      present: dmarcLines.length > 0,
      records: dmarcLines,
    },
    txtRecords: txt,
  };
}

function emptyNetwork(): NetworkSignals {
  return {
    serverIp: null,
    allIps: [],
    dnsServers: [],
    spf: { present: false, records: [] },
    dmarc: { present: false, records: [] },
    txtRecords: [],
  };
}
