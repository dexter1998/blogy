import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getTool } from "@/lib/registry";
import { env } from "@/lib/env";
import { WhoisForm } from "./whois-form";

const tool = getTool("whois-checker")!;

export const metadata: Metadata = {
  title: "WHOIS / RDAP Lookup — Live Domain Registration Data",
  description:
    "Real-time WHOIS / RDAP lookup. Registrar, registration date, expiry, nameservers, DNSSEC, status — pulled directly from the authoritative TLD registry. Free API.",
  alternates: { canonical: "/tools/whois-checker" },
};

const exampleCurl = `curl -X POST ${env.siteUrl}/api/v1/whois \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "blogy.in"}'`;

export default function Page() {
  return (
    <ToolShell
      tool={tool}
      badge="Technical · WHOIS / RDAP"
      howItWorks={[
        "Accepts any input: bare domain, subdomain, full URL — auto-normalized to the registrable root",
        "Resolves the authoritative RDAP server via the IANA bootstrap registry",
        "Falls back to rdap.org when a TLD isn't yet in IANA bootstrap",
        "Parses RFC 7483 RDAP JSON: events, nameservers, statuses, DNSSEC, vCard entities",
        "Computes domain age, expiry countdown, and abuse contact when published",
        "Cached 24h (registration data changes slowly); use 'fresh' to bypass",
      ]}
      exampleCurl={exampleCurl}
    >
      <WhoisForm />
    </ToolShell>
  );
}
