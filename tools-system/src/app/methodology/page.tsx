export const metadata = {
  title: "Scoring Methodology",
  description: "How Blogy Tools estimates DA, PA, and Spam Score from public signals.",
};

export default function MethodologyPage() {
  return (
    <div className="container max-w-3xl py-12 prose-docs">
      <h1 className="mb-2 text-3xl font-semibold">Scoring methodology</h1>
      <p className="mb-6 text-muted-fg">
        We do not query Moz, Ahrefs, or any paid index. The scores you see are
        derived entirely from public signals collected at scrape time. This page
        explains exactly how.
      </p>

      <Section title="Six signal categories">
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>
            <strong>Domain</strong> — WHOIS age, TLD quality, HTTPS, DNS health
            (A, MX, SPF presence).
          </li>
          <li>
            <strong>Indexation</strong> — robots.txt presence/permissions,
            sitemap presence, URL count in sitemap.
          </li>
          <li>
            <strong>Content</strong> — title and meta lengths, H1 count,
            internal/external link counts, word count, viewport, favicon, lang.
          </li>
          <li>
            <strong>Trust</strong> — privacy/about/contact pages, Schema.org
            markup, OpenGraph tags, social profile links.
          </li>
          <li>
            <strong>Authority</strong> — diversity of external hosts linked from
            the homepage (proxy for link-graph centrality), brand consistency
            across title/OG.
          </li>
          <li>
            <strong>Spam</strong> — outbound link ratio, empty anchor ratio,
            suspicious keyword hits, redirect chain length.
          </li>
        </ul>
      </Section>

      <Section title="Combining into DA / PA">
        <p className="text-sm">DA is weighted toward whole-domain signals:</p>
        <pre className="code-block">{`DA = authority*0.35 + domain*0.20 + indexation*0.15 + trust*0.15 + content*0.15`}</pre>
        <p className="text-sm">PA is weighted toward page-level signals:</p>
        <pre className="code-block">{`PA = content*0.35 + trust*0.20 + authority*0.20 + indexation*0.15 + domain*0.10`}</pre>
        <p className="text-sm">
          A multiplicative spam penalty (max −40%) is then applied to both. A
          confidence percentage tells you how many sub-categories actually
          contributed.
        </p>
      </Section>

      <Section title="Why estimates, not exact values">
        <p className="text-sm">
          DA/PA as marketed by Moz are proprietary metrics. Faking them would be
          dishonest and unreliable. Instead we publish a transparent estimator
          whose output you can audit signal-by-signal via the{" "}
          <code>signals</code> object in the API response — and tune for your
          own use case.
        </p>
      </Section>

      <Section title="Stability">
        <p className="text-sm">
          Identical inputs produce identical outputs. Results are cached
          server-side so the same domain returns the same score across calls
          until signals actually change.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-fg [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs">
        {children}
      </div>
    </section>
  );
}
