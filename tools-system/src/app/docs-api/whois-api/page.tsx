import type { Metadata } from "next";
import { DocsPage, makeStandardSamples } from "@/components/docs/docs-page";

export const metadata: Metadata = {
  title: "WHOIS / RDAP API Reference",
  description:
    "Real-time RDAP-backed WHOIS lookup API. Returns registration date, expiry, registrar, nameservers, DNSSEC, status codes, and abuse contact for any domain.",
  alternates: { canonical: "/docs-api/whois-api" },
};

const samples = makeStandardSamples({
  endpoint: "/api/v1/whois",
  exampleBody: { domain: "blogy.in" },
  responseExtractor: "data.result",
});

const responseSample = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        success: true,
        input: "https://blogy.in",
        host: "blogy.in",
        domain: "blogy.in",
        normalizedDomain: "blogy.in",
        tld: "in",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        source: "rdap",
        cached: false,
        rdapServer: "https://rdap.registry.in",
        registrationDate: "2024-08-12T10:42:01.000Z",
        updatedDate: "2025-08-13T03:11:47.000Z",
        expiryDate: "2027-08-12T10:42:01.000Z",
        age: { days: 636, years: 1.7, daysUntilExpiry: 824 },
        registrar: {
          name: "GoDaddy.com, LLC",
          ianaId: "146",
          url: "https://www.godaddy.com",
          abuseEmail: "abuse@godaddy.com",
          abusePhone: "tel:+1.4806242505",
        },
        nameservers: ["NS1.DIGITALOCEAN.COM", "NS2.DIGITALOCEAN.COM", "NS3.DIGITALOCEAN.COM"],
        status: ["client transfer prohibited", "client update prohibited"],
        dnssec: false,
        registryDomainId: "D403300000123456789-IN",
        entities: [
          { handle: "146", roles: ["registrar"], name: "GoDaddy.com, LLC", email: null },
          { handle: null, roles: ["abuse"], name: null, email: "abuse@godaddy.com" },
        ],
        raw: { "...": "verbatim RDAP JSON" },
        timings: { bootstrap: 124, fetch: 412, total: 538 },
        error: null,
      },
    },
    meta: {
      requestId: "req_w9k2lzm",
      apiVersion: "v1",
      durationMs: 542,
      cached: false,
      rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" },
    },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsPage
      apiName="WHOIS / RDAP API"
      endpoint="/api/v1/whois"
      method="POST"
      playgroundHref="/tools/whois-checker"
      intro={
        <>
          <p>
            Real-time WHOIS lookup powered by <strong>RDAP</strong> (RFC 7483),
            the modern JSON-based replacement for legacy port-43 WHOIS. We
            consult the IANA bootstrap registry to route each query directly
            to the authoritative TLD registry, with a transparent fallback to{" "}
            <a
              href="https://about.rdap.org/"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              rdap.org
            </a>{" "}
            for any TLD not yet in the bootstrap.
          </p>
          <p>
            Pass any of: bare domain, hostname with subdomains, or full URL.
            Inputs are auto-normalized to the <strong>registrable root</strong>{" "}
            (e.g. <code>https://blog.example.co.uk/path</code> →{" "}
            <code>example.co.uk</code>) before query.
          </p>
          <p>
            Results are cached for 24 hours since registration data changes
            slowly. Pass <code>{"{ fresh: true }"}</code> to bypass cache.
          </p>
        </>
      }
      params={[
        { name: "domain", type: "string", required: "yes", description: "Domain, host, or URL. Subdomains and protocols are stripped." },
        { name: "fresh", type: "boolean", required: "no", description: "Bypass cache and force a live RDAP query." },
      ]}
      responseFields={[
        { name: "success", type: "boolean", required: "yes", description: "True when an RDAP record was retrieved." },
        { name: "domain", type: "string", required: "yes", description: "Punycode registrable root used for the RDAP query." },
        { name: "normalizedDomain", type: "string", required: "yes", description: "Display form of the domain (Unicode where applicable)." },
        { name: "tld", type: "string", required: "yes", description: "Effective TLD (e.g. \"com\", \"co.uk\")." },
        { name: "rdapServer", type: "string", required: "yes", description: "Origin of the RDAP server that answered." },
        { name: "registrationDate", type: "ISO date", required: "yes", description: "First registration event from RDAP `events`." },
        { name: "updatedDate", type: "ISO date", required: "yes", description: "Last `last changed` event." },
        { name: "expiryDate", type: "ISO date", required: "yes", description: "Current term expiration event." },
        { name: "age.days / age.years", type: "number", required: "yes", description: "Computed locally from registrationDate." },
        { name: "age.daysUntilExpiry", type: "number", required: "yes", description: "Negative when already expired." },
        { name: "registrar", type: "object", required: "yes", description: "Name, URL, IANA ID, abuse email, abuse phone." },
        { name: "nameservers", type: "string[]", required: "yes", description: "Authoritative nameservers (uppercased ldhName)." },
        { name: "status", type: "string[]", required: "yes", description: "RDAP status codes (e.g. \"client transfer prohibited\")." },
        { name: "dnssec", type: "boolean | null", required: "yes", description: "True when secureDNS.delegationSigned is asserted." },
        { name: "registryDomainId", type: "string", required: "yes", description: "Registry-assigned domain handle." },
        { name: "entities[]", type: "object", required: "yes", description: "Flattened RDAP entities with handle, roles, name, email." },
        { name: "raw", type: "object", required: "yes", description: "Verbatim RDAP JSON response." },
        { name: "timings", type: "object", required: "yes", description: "Per-step durations: bootstrap, fetch, total (ms)." },
        { name: "error", type: "string", required: "no", description: "Reason when success=false (e.g. \"rdap_no_record\", \"invalid_domain\")." },
      ]}
      responseSample={responseSample}
      samples={samples}
      extraSections={[
        {
          id: "fallback",
          title: "Resolution chain",
          body: (
            <>
              <p>For each query we attempt:</p>
              <ol className="list-decimal pl-6">
                <li>
                  <strong>IANA bootstrap match.</strong> If the TLD is in{" "}
                  <code>data.iana.org/rdap/dns.json</code>, query that
                  registry's RDAP endpoint directly (e.g.{" "}
                  <code>rdap.verisign.com</code> for .com, <code>rdap.nic.in</code>{" "}
                  for .in).
                </li>
                <li>
                  <strong>rdap.org fallback.</strong> For unmapped TLDs (some
                  ccTLDs, new gTLDs in transition), <code>rdap.org/domain/&lt;name&gt;</code>{" "}
                  performs its own bootstrap and returns the same JSON shape.
                </li>
              </ol>
              <p>
                The <code>rdapServer</code> field exposes which endpoint
                ultimately answered. Bootstrap data itself is cached for 24h.
              </p>
            </>
          ),
        },
        {
          id: "limits",
          title: "Coverage notes",
          body: (
            <>
              <p>
                Most gTLDs (.com, .net, .org, .io, .ai, .dev, .xyz, …) and major
                ccTLDs (.us, .uk, .de, .in, .au, .ca, …) publish full RDAP. A
                handful of legacy ccTLDs still don't — for those, expect{" "}
                <code>success: false</code> with{" "}
                <code>error: "rdap_no_record"</code>.
              </p>
              <p>
                Privacy-redacted fields (registrant contact, post-GDPR) are
                returned as <code>null</code> rather than synthetic values.
                We never fabricate or scrape text WHOIS to fill the gap.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
