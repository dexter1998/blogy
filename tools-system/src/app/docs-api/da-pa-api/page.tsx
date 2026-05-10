import type { Metadata } from "next";
import { CodePanel } from "@/components/docs/code-panel";
import { DocsLayout } from "@/components/docs/docs-layout";
import { Badge } from "@/components/ui";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "DA / PA API Reference",
  description:
    "REST API for domain & page authority estimation. Single or bulk URLs, JSON response, transparent scoring breakdown.",
  alternates: { canonical: "/docs-api/da-pa-api" },
};

const BASE = env.siteUrl;

const sections = [
  { id: "overview", title: "Overview" },
  { id: "auth", title: "Authentication" },
  { id: "ratelimit", title: "Rate limits" },
  { id: "request", title: "Request" },
  { id: "params", title: "Parameters" },
  { id: "response", title: "Response" },
  { id: "errors", title: "Errors" },
  { id: "playground", title: "Playground" },
];

const samples = [
  {
    language: "bash",
    label: "cURL",
    code: `curl -X POST ${BASE}/api/v1/da-pa \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "blogy.in"
  }'`,
  },
  {
    language: "javascript",
    label: "JavaScript",
    code: `const res = await fetch("${BASE}/api/v1/da-pa", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "blogy.in" }),
});
const { data } = await res.json();
console.log(data.result.scores);`,
  },
  {
    language: "python",
    label: "Python",
    code: `import requests

res = requests.post(
    "${BASE}/api/v1/da-pa",
    json={"url": "blogy.in"},
    timeout=30,
)
data = res.json()["data"]
print(data["result"]["scores"])`,
  },
  {
    language: "node",
    label: "Node",
    code: `import { request } from "undici";

const { body } = await request("${BASE}/api/v1/da-pa", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: "blogy.in" }),
});
const json = await body.json();
console.log(json.data.result.scores);`,
  },
];

const exampleResponse = JSON.stringify(
  {
    ok: true,
    data: {
      result: {
        url: "https://blogy.in",
        domain: "blogy.in",
        fetchedAt: "2026-05-10T08:14:22.318Z",
        scores: { da: 24, pa: 28, spam: 4, trust: 31, confidence: 100 },
        metrics: {
          domainAgeYears: 0.3,
          indexedPages: 18,
          referringDomainsEstimate: 25,
          backlinkEstimate: 75,
          https: true,
        },
        signals: {
          domain: { /* … */ },
          indexation: { /* … */ },
          content: { /* … */ },
          trust: { /* … */ },
          authority: { /* … */ },
          spam: { /* … */ },
        },
        explanations: [
          "Domain is under a year old — limited authority.",
          "Sitemap reports 18 URLs.",
          "All three trust pages (about, contact, privacy) found.",
        ],
      },
    },
    meta: {
      requestId: "req_x9k2lzm",
      apiVersion: "v1",
      durationMs: 1842,
      cached: false,
      rateLimit: { limit: 30, remaining: 29, resetAt: "2026-05-10T08:15:00.000Z" },
    },
  },
  null,
  2,
);

export default function Page() {
  return (
    <DocsLayout
      apiName="DA / PA API"
      endpoint="POST /api/v1/da-pa"
      method="POST"
      sections={sections}
      content={
        <>
          <Section id="overview" title="Overview">
            <p>
              Estimate <strong>Domain Authority</strong>, <strong>Page Authority</strong>,{" "}
              <strong>Spam Score</strong>, and underlying signals for any public URL.
              The engine combines WHOIS, DNS, robots/sitemap inspection, on-page
              parsing, and external-link diversity into a single deterministic score.
            </p>
            <p>
              Identical input produces identical output (cached for{" "}
              <code>{env.cacheTtlSeconds}</code> seconds). Pass{" "}
              <code>fresh: true</code> to bypass cache.
            </p>
          </Section>

          <Section id="auth" title="Authentication">
            <p>
              The public endpoint is{" "}
              <Badge tone={env.apiAuthMode === "open" ? "good" : "warn"}>
                {env.apiAuthMode === "open" ? "open" : "API key required"}
              </Badge>
              . When key auth is enabled, send your key in the{" "}
              <code>x-api-key</code> header.
            </p>
            <pre className="code-block">x-api-key: blgy_live_xxxxxxxxxxxxxxxx</pre>
          </Section>

          <Section id="ratelimit" title="Rate limits">
            <p>
              Anonymous IPs are limited to <strong>{env.rateLimitPerMin} requests / minute</strong>.
              Every response includes <code>meta.rateLimit</code> with <code>remaining</code> and{" "}
              <code>resetAt</code>. Exceeding the limit returns <code>429</code> with{" "}
              <code>error.code = "rate_limited"</code>.
            </p>
          </Section>

          <Section id="request" title="Request">
            <p>
              Send a JSON body to <code>POST /api/v1/da-pa</code>. Two shapes are accepted:
            </p>
            <ul className="list-disc pl-6">
              <li>
                <code>{"{ url: string }"}</code> — single URL, returns one{" "}
                <code>result</code>.
              </li>
              <li>
                <code>{"{ urls: string[] }"}</code> — up to 25 URLs, returns{" "}
                <code>results[]</code> with per-URL ok/error.
              </li>
            </ul>
            <p>
              <code>GET /api/v1/da-pa?url=blogy.in</code> is also accepted for quick browser checks.
            </p>
          </Section>

          <Section id="params" title="Parameters">
            <ParamTable
              rows={[
                { name: "url", type: "string", required: "for single", description: "Domain or full URL. Bare hostnames are auto-promoted to https://." },
                { name: "urls", type: "string[]", required: "for bulk", description: "Up to 25 URLs in one call." },
                { name: "fresh", type: "boolean", required: "no", description: "Bypass cache, force a fresh scrape." },
                { name: "debug", type: "boolean", required: "no", description: "Include the raw scoring breakdown in the response." },
              ]}
            />
          </Section>

          <Section id="response" title="Response">
            <p>All responses follow the envelope:</p>
            <pre className="code-block">{`{
  "ok": true,
  "data": { ... },
  "meta": { "requestId", "apiVersion", "durationMs", "cached", "rateLimit" }
}`}</pre>
            <p>The <code>data.result</code> object contains:</p>
            <ParamTable
              rows={[
                { name: "scores.da", type: "number 0–100", required: "yes", description: "Domain Authority estimate." },
                { name: "scores.pa", type: "number 0–100", required: "yes", description: "Page Authority estimate." },
                { name: "scores.spam", type: "number 0–100", required: "yes", description: "Higher = more spam signals." },
                { name: "scores.trust", type: "number 0–100", required: "yes", description: "Composite trust signal." },
                { name: "scores.confidence", type: "number 0–100", required: "yes", description: "How many sub-signals contributed." },
                { name: "metrics.*", type: "object", required: "yes", description: "Headline numbers: age, indexed pages, ref domains, backlinks, https." },
                { name: "signals.*", type: "object", required: "yes", description: "Per-category raw signals used by the scoring engine." },
                { name: "explanations", type: "string[]", required: "yes", description: "Human-readable reasons for the score." },
                { name: "breakdown", type: "object", required: "no (debug only)", description: "Per-category sub-scores before weighting." },
              ]}
            />
          </Section>

          <Section id="errors" title="Errors">
            <ParamTable
              rows={[
                { name: "400", type: "validation_error", required: "—", description: "Body shape invalid. See error.details." },
                { name: "401", type: "unauthorized", required: "—", description: "Missing or invalid API key (when key mode is on)." },
                { name: "429", type: "rate_limited", required: "—", description: "Per-IP/key rate limit exceeded." },
                { name: "500", type: "internal_error", required: "—", description: "Unexpected server error. Safe to retry once." },
              ]}
            />
          </Section>

          <Section id="playground" title="Playground">
            <p>
              Try the endpoint live in the{" "}
              <a href="/tools/da-pa-checker" className="text-accent hover:underline">
                interactive tool
              </a>
              . Every UI run hits exactly the same API shown here.
            </p>
          </Section>
        </>
      }
      rightRail={<CodePanel title="Try it" samples={samples} responseSample={exampleResponse} />}
    />
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-muted-fg [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-fg [&_strong]:text-fg">
        {children}
      </div>
    </section>
  );
}

function ParamTable({
  rows,
}: {
  rows: Array<{ name: string; type: string; required: string; description: string }>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-app">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-fg">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Required</th>
            <th className="px-3 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-app">
              <td className="px-3 py-2 font-mono text-xs text-fg">{r.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{r.type}</td>
              <td className="px-3 py-2 text-xs">{r.required}</td>
              <td className="px-3 py-2 text-xs">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
