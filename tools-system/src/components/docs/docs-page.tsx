/**
 * High-level page builder for /docs-api/<slug>. Each docs page passes
 * its endpoint, params, response example, and code samples — this
 * component renders the consistent Stripe-style three-column layout.
 */

import type { ReactNode } from "react";
import { CodePanel, type CodeSample } from "@/components/docs/code-panel";
import { DocsLayout, type DocsSection } from "@/components/docs/docs-layout";
import { Badge } from "@/components/ui";
import { env } from "@/lib/env";

export type ParamRow = {
  name: string;
  type: string;
  required: string;
  description: string;
};

export function DocsPage({
  apiName,
  endpoint,
  method = "POST",
  status = "live",
  intro,
  params,
  responseFields,
  errors,
  responseSample,
  samples,
  extraSections,
  playgroundHref,
}: {
  apiName: string;
  endpoint: string;
  method?: "GET" | "POST";
  status?: "live" | "beta";
  intro: ReactNode;
  params: ParamRow[];
  responseFields: ParamRow[];
  errors?: ParamRow[];
  responseSample: string;
  samples: CodeSample[];
  extraSections?: Array<{ id: string; title: string; body: ReactNode }>;
  playgroundHref?: string;
}) {
  const baseSections: DocsSection[] = [
    { id: "overview", title: "Overview" },
    { id: "auth", title: "Authentication" },
    { id: "ratelimit", title: "Rate limits" },
    { id: "params", title: "Parameters" },
    { id: "response", title: "Response" },
    { id: "errors", title: "Errors" },
    ...(extraSections ?? []).map((s) => ({ id: s.id, title: s.title })),
    { id: "playground", title: "Playground" },
  ];

  const errorRows: ParamRow[] = errors ?? [
    { name: "400", type: "validation_error", required: "—", description: "Body shape invalid. See error.details." },
    { name: "401", type: "unauthorized", required: "—", description: "Missing or invalid API key (when key mode is on)." },
    { name: "429", type: "rate_limited", required: "—", description: "Per-IP/key rate limit exceeded." },
    { name: "500", type: "internal_error", required: "—", description: "Unexpected server error. Safe to retry once." },
  ];

  return (
    <DocsLayout
      apiName={apiName}
      endpoint={`${method} ${endpoint}`}
      method={method}
      status={status}
      sections={baseSections}
      content={
        <>
          <Section id="overview" title="Overview">
            {intro}
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
              Anonymous IPs are limited to{" "}
              <strong>{env.rateLimitPerMin} requests / minute</strong>. Every
              response includes <code>meta.rateLimit</code> with{" "}
              <code>remaining</code> and <code>resetAt</code>.
            </p>
          </Section>
          <Section id="params" title="Parameters">
            <ParamTable rows={params} />
          </Section>
          <Section id="response" title="Response">
            <p>All responses follow the standard envelope:</p>
            <pre className="code-block">{`{
  "ok": true,
  "data": { ... },
  "meta": { "requestId", "apiVersion", "durationMs", "cached", "rateLimit" }
}`}</pre>
            <p>
              The <code>data.result</code> object contains:
            </p>
            <ParamTable rows={responseFields} />
          </Section>
          <Section id="errors" title="Errors">
            <ParamTable rows={errorRows} />
          </Section>
          {(extraSections ?? []).map((s) => (
            <Section key={s.id} id={s.id} title={s.title}>
              {s.body}
            </Section>
          ))}
          <Section id="playground" title="Playground">
            <p>
              Try the endpoint live in the{" "}
              <a
                href={playgroundHref ?? "/tools"}
                className="text-accent hover:underline"
              >
                interactive tool
              </a>
              . Every UI run hits exactly the same API shown here.
            </p>
          </Section>
        </>
      }
      rightRail={<CodePanel title="Try it" samples={samples} responseSample={responseSample} />}
    />
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
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

export function ParamTable({ rows }: { rows: ParamRow[] }) {
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

export function makeStandardSamples(args: {
  endpoint: string;
  exampleBody: Record<string, unknown>;
  responseExtractor: string;
}): CodeSample[] {
  const { endpoint, exampleBody, responseExtractor } = args;
  const url = `${env.siteUrl}${endpoint}`;
  const bodyJson = JSON.stringify(exampleBody, null, 2);
  const flatJson = JSON.stringify(exampleBody);
  return [
    {
      language: "bash",
      label: "cURL",
      code: `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '${flatJson}'`,
    },
    {
      language: "javascript",
      label: "JavaScript",
      code: `const res = await fetch("${url}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${bodyJson}),
});
const { data } = await res.json();
console.log(${responseExtractor});`,
    },
    {
      language: "python",
      label: "Python",
      code: `import requests

res = requests.post(
    "${url}",
    json=${bodyJson.replace(/"([a-zA-Z_]+)":/g, '"$1":')},
    timeout=30,
)
data = res.json()["data"]
print(${responseExtractor.replace(/data\./g, 'data["').replace(/(\["[^"]+)/g, '$1"]').replace(/\.([a-zA-Z]+)/g, '["$1"]')})`,
    },
    {
      language: "node",
      label: "Node",
      code: `import { request } from "undici";

const { body } = await request("${url}", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(${bodyJson}),
});
const json = await body.json();
console.log(${responseExtractor.replace(/data\./, "json.data.")});`,
    },
  ];
}
