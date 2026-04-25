import './Integrations.css';

const SI = 'https://cdn.simpleicons.org';

const PLATFORMS = [
  { name: 'WordPress',     slug: 'wordpress',    tone: '#2563eb', bg: '#f0f7ff' },
  { name: 'Webflow',       slug: 'webflow',      tone: '#4f46e5', bg: '#f0f0ff' },
  { name: 'Shopify',       slug: 'shopify',      tone: '#16a34a', bg: '#f0fff5' },
  { name: 'Notion',        slug: 'notion',       tone: '#111827', bg: '#fafafa' },
  { name: 'HubSpot',       slug: 'hubspot',      tone: '#ea580c', bg: '#fff5f0' },
  { name: 'Zapier',        slug: 'zapier',       tone: '#f97316', bg: '#fff4f0' },
  { name: 'Make',          slug: 'make',         tone: '#7c3aed', bg: '#f8f0ff' },
  { name: 'Airtable',      slug: 'airtable',     tone: '#0891b2', bg: '#f0faff' },
  { name: 'Ghost',         slug: 'ghost',        tone: '#111827', bg: '#f5f5f5' },
  { name: 'Wix',           slug: 'wix',          tone: '#ca8a04', bg: '#fffbf0' },
  { name: 'Slack',         slug: 'slack',        tone: '#c026d3', bg: '#fdf0ff' },
  { name: 'Google Sheets', slug: 'googlesheets', tone: '#16a34a', bg: '#f0fff5' },
  { name: 'Medium',        slug: 'medium',       tone: '#111827', bg: '#f5f5f5' },
  { name: 'Contentful',    slug: 'contentful',   tone: '#2563eb', bg: '#f0f5ff' },
  {
    name: 'Webhooks',
    bg: '#f0f0ff',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
  },
  {
    name: 'REST API',
    bg: '#f0fdfa',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="int-section">
      <div className="container">
        <div className="int-layout">
          <div className="int-left">
            <span className="int-label">Integrations</span>
            <h2 className="int-heading">
              Seamless <em>publishing</em><br />to your stack
            </h2>
            <p className="int-desc">
              Push to your CMS, sync data, or automate workflows. Connect Blogy to the tools your team already uses — setup takes under 5 minutes.
            </p>
            <a
              href="https://dashboard.blogy.in/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="int-cta"
              data-analytics-event="cta_click_any"
              data-analytics-source="integrations_cta"
            >
              Start for Free →
            </a>
          </div>

          <div className="int-pills">
            {PLATFORMS.map((p, i) => (
              <div key={i} className="int-pill">
                <span className="int-pill-icon" style={{ background: p.bg }}>
                  {p.slug
                    ? <span className="int-pill-mark" style={{ background: p.tone }}>
                        <img src={`${SI}/${p.slug}/white`} alt={p.name} width="14" height="14" loading="lazy" decoding="async" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                      </span>
                    : p.icon}
                </span>
                <span className="int-pill-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
