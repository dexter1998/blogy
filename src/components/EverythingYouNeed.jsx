import './EverythingYouNeed.css';

const KW_PILLS = ['best CRM software', 'CRM for startups', 'free CRM tools', 'HubSpot vs Salesforce'];
const AI_BARS = [
  { label: 'ChatGPT', pct: 91 },
  { label: 'Perplexity', pct: 78 },
  { label: 'Gemini', pct: 85 },
];
const PUB_DOTS = ['W', 'Sh', 'Wf', 'Gh', '+8'];
const CHART_BARS = [22, 35, 28, 48, 40, 62, 55, 80, 72, 95, 88, 100];

const FEATURES = [
  {
    title: 'Topic discovery on autopilot',
    desc: 'Surface high-intent, low-competition keywords before your competitors even know they exist.',
    preview: (
      <div className="eyn-preview eyn-preview--kw">
        <div className="eyn-pre-label">Keyword suggestions</div>
        <div className="eyn-kw-pills">
          {KW_PILLS.map((k, i) => (
            <span key={i} className={`eyn-kw-pill${i === 0 ? ' active' : ''}`}>{k}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'SEO baked into every paragraph',
    desc: 'Semantic density, entity coverage, and readability signals — automatically tuned.',
    preview: (
      <div className="eyn-preview eyn-preview--score">
        <div className="eyn-pre-label">SEO Score</div>
        <div className="eyn-score-wrap">
          <svg viewBox="0 0 80 80" className="eyn-score-ring">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--teal-100)" strokeWidth="7"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--teal-600)" strokeWidth="7"
              strokeDasharray="201" strokeDashoffset="28" strokeLinecap="round"
              transform="rotate(-90 40 40)"/>
          </svg>
          <div className="eyn-score-num">86<span>/100</span></div>
        </div>
        <div className="eyn-score-tags">
          <span className="eyn-tag ok">Entities ✓</span>
          <span className="eyn-tag ok">Readability ✓</span>
          <span className="eyn-tag warn">Schema !</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Optimized for AI search',
    desc: 'Content formatted to get cited in AI Overviews, ChatGPT, Perplexity, and Gemini.',
    preview: (
      <div className="eyn-preview eyn-preview--ai">
        <div className="eyn-pre-label">AI citation readiness</div>
        <div className="eyn-ai-bars">
          {AI_BARS.map((b, i) => (
            <div key={i} className="eyn-ai-row">
              <span className="eyn-ai-label">{b.label}</span>
              <div className="eyn-ai-track">
                <div className="eyn-ai-fill" style={{ width: `${b.pct}%` }}/>
              </div>
              <span className="eyn-ai-pct">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Programmatic SEO at scale',
    desc: 'Generate thousands of landing pages from structured data — locations, comparisons, templates.',
    preview: (
      <div className="eyn-preview eyn-preview--pg">
        <div className="eyn-pre-label">Pages generated</div>
        <div className="eyn-pg-count">2,847</div>
        <div className="eyn-pg-meta">
          <span className="eyn-tag ok">+143 today</span>
          <span className="eyn-tag ok">Auto-indexed</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Direct publishing',
    desc: 'Push live to WordPress, Webflow, Shopify, Ghost, or any CMS via API — no copy-pasting.',
    preview: (
      <div className="eyn-preview eyn-preview--pub">
        <div className="eyn-pre-label">Connected platforms</div>
        <div className="eyn-pub-dots">
          {PUB_DOTS.map((d, i) => (
            <div key={i} className={`eyn-pub-dot${i === PUB_DOTS.length - 1 ? ' eyn-pub-more' : ''}`}>{d}</div>
          ))}
        </div>
        <div className="eyn-pub-status">
          <span className="eyn-status-dot"/> Article published to WordPress
        </div>
      </div>
    ),
  },
  {
    title: 'Track what compounds',
    desc: 'See which articles drive clicks, backlinks, and AI citations — and double down on what moves the needle.',
    preview: (
      <div className="eyn-preview eyn-preview--ch">
        <div className="eyn-pre-label">Organic traffic</div>
        <div className="eyn-chart">
          {CHART_BARS.map((h, i) => (
            <div key={i} className="eyn-bar" style={{ height: `${h}%` }}/>
          ))}
        </div>
        <div className="eyn-chart-label">+312% in 90 days</div>
      </div>
    ),
  },
];

export default function EverythingYouNeed() {
  return (
    <section className="eyn-section">
      <div className="container">
        <div className="eyn-header">
          <span className="eyn-label">Features</span>
          <h2 className="eyn-heading">
            Everything you need to<br />
            crack <em>SEO + GEO</em>
          </h2>
          <p className="eyn-sub">
            One platform to research, write, optimize, publish, and track — built for the era of AI search.
          </p>
        </div>

        <div className="eyn-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="eyn-card">
              {f.preview}
              <div className="eyn-card-body">
                <h3 className="eyn-card-title">{f.title}</h3>
                <p className="eyn-card-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
