"use client";

import { useMemo, useRef, useState } from "react";
import { Badge, Button, Card, CopyButton, Stat } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { WhoisLookupResult } from "@/scrapers/whois/lookup";

type ApiResp =
  | { ok: true; data: { result: WhoisLookupResult }; meta: { cached: boolean } }
  | { ok: false; error: { message: string } };

type FieldRow = {
  key: string;
  label: string;
  value: string | string[] | null;
  /** Tooltip content shown next to the ⓘ. */
  info: string;
  /** Optional badge tone — paints the value pill. */
  tone?: "good" | "warn" | "bad" | "neutral" | "accent";
  /** Render multi-line value (for nameserver lists, statuses, etc). */
  multi?: boolean;
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10) + "  ·  " + d.toUTCString().slice(5, 16);
}

function formatAge(days: number | null, years: number | null): string | null {
  if (days == null || years == null) return null;
  if (days < 0) return `expires in ${Math.abs(days).toLocaleString()} days`;
  return `${years} years  ·  ${days.toLocaleString()} days`;
}

function expiryTone(days: number | null): "good" | "warn" | "bad" | "neutral" {
  if (days == null) return "neutral";
  if (days < 0) return "bad";
  if (days < 30) return "warn";
  if (days < 90) return "warn";
  return "good";
}

function buildRows(r: WhoisLookupResult): FieldRow[] {
  const reg = r.registrar;
  return [
    {
      key: "domain",
      label: "Domain",
      value: r.normalizedDomain,
      info: "The registrable root domain queried via RDAP. Subdomains are normalized to the parent registrable name (e.g. blog.example.co.uk → example.co.uk).",
    },
    {
      key: "tld",
      label: "TLD",
      value: r.tld,
      info: "Top-level domain or effective TLD. Multi-label public suffixes like co.uk are recognized.",
    },
    {
      key: "registrationDate",
      label: "Registered On",
      value: formatDate(r.registrationDate),
      info: "First registration date as recorded by the registry. Often the most reliable trust signal — domains with multi-year history rank higher in trust models.",
    },
    {
      key: "age",
      label: "Domain Age",
      value: formatAge(r.age.days, r.age.years),
      info: "Time since first registration. Computed locally from the registration event — older domains tend to carry more topical authority and link equity.",
      tone: r.age.years != null && r.age.years > 5 ? "good" : "neutral",
    },
    {
      key: "updatedDate",
      label: "Last Updated",
      value: formatDate(r.updatedDate),
      info: "When the registrant last modified registry records (transfer, nameserver change, contact update). Frequent updates can indicate ownership instability.",
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      value: formatDate(r.expiryDate),
      info: "When the current registration term ends. Domains expiring within 30 days that aren't on auto-renew are at risk of being dropped.",
      tone: expiryTone(r.age.daysUntilExpiry),
    },
    {
      key: "daysUntilExpiry",
      label: "Days Until Expiry",
      value:
        r.age.daysUntilExpiry == null
          ? null
          : `${r.age.daysUntilExpiry.toLocaleString()} days`,
      info: "Countdown to the registry's expiration event. Negative means the domain has already passed its expiry and is in redemption / pending-delete.",
      tone: expiryTone(r.age.daysUntilExpiry),
    },
    {
      key: "registrar",
      label: "Registrar",
      value: reg?.name ?? null,
      info: "The ICANN-accredited company where the domain is currently registered. Different from the registry — registries operate the TLD; registrars sell to end users.",
    },
    {
      key: "registrarUrl",
      label: "Registrar URL",
      value: reg?.url ?? null,
      info: "Public website of the registrar. Useful for transfer / renewal / abuse reporting.",
    },
    {
      key: "ianaId",
      label: "Registrar IANA ID",
      value: reg?.ianaId ?? null,
      info: "Numeric IANA-assigned identifier for the registrar. Stable across rebrands and acquisitions.",
    },
    {
      key: "abuseEmail",
      label: "Abuse Contact",
      value: reg?.abuseEmail ?? null,
      info: "Registrar's published abuse-reporting address (RFC 7485). Use this to report phishing, malware, or trademark abuse hosted on the domain.",
    },
    {
      key: "abusePhone",
      label: "Abuse Phone",
      value: reg?.abusePhone ?? null,
      info: "Registrar's published abuse-reporting phone number, in vCard tel format.",
    },
    {
      key: "registryDomainId",
      label: "Registry Domain ID",
      value: r.registryDomainId,
      info: "Globally unique domain handle assigned by the registry. Used in transfer requests and dispute filings.",
    },
    {
      key: "nameservers",
      label: "Name Servers",
      value: r.nameservers.length ? r.nameservers : null,
      info: "Authoritative DNS servers delegated by the registry. Identifies the hosting / DNS provider (Cloudflare, AWS Route 53, registrar-default, etc.).",
      multi: true,
    },
    {
      key: "dnssec",
      label: "DNSSEC",
      value:
        r.dnssec == null ? null : r.dnssec ? "signed (delegationSigned: true)" : "unsigned",
      info: "Indicates whether DNS records are cryptographically signed. DNSSEC protects against cache poisoning and spoofing — enabled domains are considered more trustworthy.",
      tone: r.dnssec === true ? "good" : r.dnssec === false ? "neutral" : "neutral",
    },
    {
      key: "status",
      label: "Domain Status",
      value: r.status.length ? r.status : null,
      info: "EPP status codes set by the registry / registrar. 'clientTransferProhibited' is normal protection; 'pendingDelete' or 'redemptionPeriod' signal a domain about to be dropped.",
      multi: true,
    },
    {
      key: "rdapServer",
      label: "RDAP Server",
      value: r.rdapServer,
      info: "The RDAP endpoint that answered this query. Resolved via IANA bootstrap when available; falls back to rdap.org otherwise.",
    },
  ];
}

function exportRowsToCsv(rows: FieldRow[]): string {
  const header = "field,value\n";
  const body = rows
    .filter((r) => r.value != null)
    .map((r) => {
      const v = Array.isArray(r.value) ? r.value.join("; ") : (r.value as string);
      return [r.label, v]
        .map((x) => (/[",\n\r]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x))
        .join(",");
    })
    .join("\n");
  return header + body;
}

function exportRowsToTxt(rows: FieldRow[]): string {
  return rows
    .filter((r) => r.value != null)
    .map((r) => {
      const v = Array.isArray(r.value) ? r.value.join(", ") : r.value;
      return `${r.label.padEnd(22)} ${v}`;
    })
    .join("\n");
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function InfoIcon({ tip }: { tip: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        aria-label={tip}
        tabIndex={0}
        className="inline-flex h-4 w-4 cursor-help select-none items-center justify-center rounded-full border border-app text-[10px] font-semibold text-muted-fg hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
      >
        i
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-md border border-app bg-card p-2 text-xs leading-relaxed text-fg shadow-lg group-hover:block group-focus-within:block">
        {tip}
      </span>
    </span>
  );
}

export function WhoisForm() {
  const [domain, setDomain] = useState("blogy.in");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhoisLookupResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const rows = useMemo(() => (result ? buildRows(result) : []), [result]);

  async function onSubmit(e: React.FormEvent, opts: { fresh?: boolean } = {}) {
    e.preventDefault();
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setError(null);
    setPhase("loading");

    try {
      const res = await fetch("/api/v1/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, fresh: opts.fresh }),
        signal: abortRef.current.signal,
      });
      const json = (await res.json()) as ApiResp;
      if (!json.ok) {
        setError(json.error.message);
        setResult(null);
        setPhase("idle");
        return;
      }
      const r = json.data.result;
      setResult(r);
      setPhase("done");
      if (!r.success) {
        setError(r.error ?? "Lookup failed");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Request failed");
      setPhase("idle");
    }
  }

  const isLoading = phase === "loading";

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <form onSubmit={(e) => onSubmit(e)} className="space-y-3">
          <label className="block text-sm font-medium">
            Domain or URL
            <span className="ml-2 text-xs font-normal text-muted-fg">
              accepts bare domain, subdomain, or full URL — normalized automatically
            </span>
          </label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com  ·  https://blog.example.co.uk/article  ·  sub.example.io"
            className="w-full rounded-lg border border-app bg-app px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Looking up…" : "Lookup WHOIS / RDAP"}
            </Button>
            {result && (
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                onClick={(e) => onSubmit(e as unknown as React.FormEvent, { fresh: true })}
              >
                Force fresh (bypass cache)
              </Button>
            )}
          </div>
          {error && (
            <p className="rounded border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
        </form>
      </Card>

      {/* Loading skeleton */}
      {isLoading && (
        <Card>
          <div className="space-y-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </Card>
      )}

      {/* Stats */}
      {result?.success && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Domain Age"
            value={
              result.age.years != null
                ? `${result.age.years}y`
                : "—"
            }
            hint={
              result.age.days != null
                ? `${result.age.days.toLocaleString()} days`
                : undefined
            }
            tone={result.age.years != null && result.age.years > 5 ? "good" : "neutral"}
          />
          <Stat
            label="Expires In"
            value={
              result.age.daysUntilExpiry != null
                ? `${result.age.daysUntilExpiry.toLocaleString()}d`
                : "—"
            }
            tone={expiryTone(result.age.daysUntilExpiry)}
          />
          <Stat
            label="Nameservers"
            value={result.nameservers.length || "—"}
          />
          <Stat
            label="DNSSEC"
            value={result.dnssec === true ? "ON" : result.dnssec === false ? "OFF" : "—"}
            tone={result.dnssec === true ? "good" : "neutral"}
          />
        </div>
      )}

      {/* Result table */}
      {result && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
                Registration record
              </h3>
              {result.cached && <Badge>cached</Badge>}
              {!result.cached && result.success && <Badge tone="good">live</Badge>}
              {!result.success && <Badge tone="bad">no record</Badge>}
              {result.timings && (
                <span className="text-xs text-muted-fg">
                  {result.timings.total} ms
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  download(
                    `whois-${result.domain}.json`,
                    JSON.stringify(result, null, 2),
                    "application/json",
                  )
                }
              >
                Export JSON
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  download(
                    `whois-${result.domain}.csv`,
                    exportRowsToCsv(rows),
                    "text/csv",
                  )
                }
              >
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  download(
                    `whois-${result.domain}.txt`,
                    exportRowsToTxt(rows),
                    "text/plain",
                  )
                }
              >
                Export TXT
              </Button>
              <CopyButton
                text={exportRowsToTxt(rows)}
                label="Copy all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-fg">
                <tr className="border-b border-app">
                  <th className="px-2 py-2 font-medium">Field</th>
                  <th className="px-2 py-2 font-medium">Value</th>
                  <th className="px-2 py-2 font-medium text-right">Info</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-b border-app/60 last:border-b-0",
                      row.value == null && "opacity-50",
                    )}
                  >
                    <td className="w-[28%] whitespace-nowrap px-2 py-2.5 font-medium text-fg">
                      {row.label}
                    </td>
                    <td className="px-2 py-2.5">
                      {row.value == null ? (
                        <span className="italic text-muted-fg">—</span>
                      ) : Array.isArray(row.value) ? (
                        <div className="flex flex-col gap-1">
                          {row.value.map((v, i) => (
                            <code
                              key={i}
                              className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-fg"
                            >
                              {v}
                            </code>
                          ))}
                        </div>
                      ) : row.tone ? (
                        <Badge tone={row.tone}>{row.value}</Badge>
                      ) : (
                        <span className="break-all font-mono text-xs text-fg">
                          {row.value}
                        </span>
                      )}
                    </td>
                    <td className="w-12 px-2 py-2.5 text-right">
                      <InfoIcon tip={row.info} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Raw RDAP */}
      {result?.success && result.raw != null && (
        <Card>
          <button
            type="button"
            onClick={() => setShowRaw((s) => !s)}
            className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wider text-muted-fg hover:text-fg"
          >
            <span>Raw RDAP response</span>
            <span className="text-xs">{showRaw ? "hide ▲" : "show ▼"}</span>
          </button>
          {showRaw && (
            <div className="mt-3">
              <div className="mb-2 flex justify-end">
                <CopyButton
                  text={JSON.stringify(result.raw, null, 2)}
                  label="Copy JSON"
                />
              </div>
              <pre className="code-block max-h-96 overflow-auto whitespace-pre text-xs">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
