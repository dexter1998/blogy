export const metadata = {
  title: "Scoring Methodology",
  description:
    "How Blogy Tools derives Authority Score, Page Strength, Domain Strength, URL Strength, Spam Score, and Stability Score from public signals only.",
};

export default function MethodologyPage() {
  return (
    <div className="container max-w-3xl py-12 prose-docs">
      <h1 className="mb-2 text-3xl font-semibold">Scoring methodology</h1>
      <p className="mb-6 text-muted-fg">
        Every score is derived strictly from public signals collected at scrape
        time. No proprietary third-party SEO metrics are queried, copied, or
        emulated. This page documents exactly how each output is produced.
      </p>

      <Section title="Provider layer">
        <p className="text-sm">
          A pluggable <code>/providers</code> layer fetches realtime signals
          from public sources, with fallback chains for resilience:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>
            <strong>WHOIS / RDAP</strong> — RDAP first (JSON, ICANN-bootstrapped),
            falling back to port-43 WHOIS.
          </li>
          <li>
            <strong>DNS</strong> — Google DNS-over-HTTPS, falling back to
            Cloudflare DoH and finally <code>node:dns</code>.
          </li>
          <li>
            <strong>Crawl</strong> — robots.txt + sitemap.xml parsed per
            sitemaps.org spec.
          </li>
          <li>
            <strong>Backlink footprint</strong> — Common Crawl monthly indexes
            for coverage breadth, plus OpenPageRank when{" "}
            <code>OPR_API_KEY</code> is configured (graceful fallback when not).
          </li>
          <li>
            <strong>Metadata</strong> — single page fetch, parsed with cheerio,
            extracts on-page content + trust signals.
          </li>
          <li>
            <strong>Schema</strong> — JSON-LD + microdata extraction per
            schema.org spec.
          </li>
          <li>
            <strong>Search presence</strong> — DuckDuckGo Lite SERP probe.
            Used only as a corroborating signal, never as a backlink count.
          </li>
        </ul>
      </Section>

      <Section title="Six signal axes">
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>
            <strong>Domain</strong> — registration age, TLD quality, HTTPS, DNS
            health (A/AAAA, MX, SPF, DMARC).
          </li>
          <li>
            <strong>Indexation</strong> — robots.txt, sitemap, indexable URL
            count, public search-presence corroboration.
          </li>
          <li>
            <strong>Content</strong> — title and meta lengths, H1 count, link
            counts, word count, viewport, favicon, lang.
          </li>
          <li>
            <strong>Trust</strong> — privacy/about/contact pages, Schema.org
            markup richness, OpenGraph tags, social profile links.
          </li>
          <li>
            <strong>Authority</strong> — OpenPageRank reading (when
            available), Common Crawl footprint breadth, outbound host
            diversity, brand consistency. Scaled by a corroboration factor
            built from age + indexed footprint.
          </li>
          <li>
            <strong>Spam</strong> — outbound link ratio, empty anchor ratio,
            suspicious keyword hits, redirect chain length, content
            thinness, missing on-page basics.
          </li>
        </ul>
      </Section>

      <Section title="Combining into Blogy-native scores">
        <p className="text-sm">
          Authority Score (whole-domain composite):
        </p>
        <pre className="code-block">{`Authority Score = authority*0.40 + domain*0.25 + indexation*0.15 + trust*0.12 + content*0.08`}</pre>
        <p className="text-sm">Page Strength (single-page composite):</p>
        <pre className="code-block">{`Page Strength = content*0.32 + trust*0.22 + authority*0.22 + domain*0.14 + indexation*0.10`}</pre>
        <p className="text-sm">Domain Strength (backlink-weighted domain reading):</p>
        <pre className="code-block">{`Domain Strength = authority*0.50 + domain*0.22 + indexation*0.13 + trust*0.10 + content*0.05`}</pre>
        <p className="text-sm">URL Strength (backlink-weighted page reading):</p>
        <pre className="code-block">{`URL Strength = authority*0.30 + content*0.30 + trust*0.20 + domain*0.12 + indexation*0.08`}</pre>
        <p className="text-sm">Stability Score:</p>
        <pre className="code-block">{`Stability Score = trust*0.55 + (100 - spam)*0.25 + domain*0.20`}</pre>
        <p className="text-sm">
          A multiplicative Spam Score penalty (up to −60%) is applied to all
          four authority composites, and the upper tail is squashed so a single
          inflated axis can't push raw output past ~80. A confidence percentage
          reports how many sub-categories actually contributed.
        </p>
      </Section>

      <Section title="No curated authority floors">
        <p className="text-sm">
          The scorer does not maintain a list of "famous brands" pinned to
          high outputs. Every domain — including google.com — is scored from
          signals only. Big sites tend to score high because they actually
          have the signals (decades of registration, vast indexed footprint,
          high OpenPageRank, mature schema), not because they are on a list.
        </p>
      </Section>

      <Section title="Field naming and compatibility">
        <p className="text-sm">
          The API exposes Blogy-native field names (<code>authorityScore</code>,
          <code>pageStrength</code>, <code>domainStrength</code>,{" "}
          <code>urlStrength</code>, <code>spamScore</code>,{" "}
          <code>stabilityScore</code>) plus deprecated short aliases (
          <code>da, pa, dr, ur, ss, st</code>) for backward compatibility.
          The aliases will be removed in a future version.
        </p>
      </Section>

      <Section title="Stability">
        <p className="text-sm">
          Identical inputs produce identical outputs. Provider results are
          cached server-side so the same domain returns the same score across
          calls until the underlying signals change.
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
