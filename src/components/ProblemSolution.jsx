import './ProblemSolution.css';

const L = {
  chatgpt:    '/logos/chatgpt.png',
  claude:     '/logos/claude.png',
  ahrefs:     '/logos/ahrefs.png',
  canva:      '/logos/canva.png',
  photoshop:  '/logos/photoshop.png',
};

function BrandChip({ label, tone = '#0d9488' }) {
  return (
    <span
      className="ps-brand-chip"
      aria-hidden="true"
      style={{ background: tone }}
    >
      {label}
    </span>
  );
}

const PROBLEMS = [
  {
    avatar: { label: 'R', bg: '#0d9488' },
    text: (
      <>
        Monthly subscriptions for{' '}
        <img src={L.ahrefs} alt="Ahrefs" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>Ahrefs</strong>,{' '}
        <BrandChip label="S" tone="#10b981" />
        {' '}<strong>SEMrush</strong>,{' '}
        <img src={L.canva} alt="Canva" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>Canva</strong> &amp;{' '}
        <img src={L.photoshop} alt="Photoshop" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>Photoshop</strong> eat up{' '}
        <span className="ps-red">₹30,000+ of marketing budget</span> with nothing to show.
      </>
    ),
  },
  {
    avatar: { label: 'A', bg: '#3b82f6' },
    text: (
      <>
        Switching between{' '}
        <img src={L.chatgpt} alt="ChatGPT" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>ChatGPT</strong>,{' '}
        <img src={L.ahrefs} alt="Ahrefs" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>keyword tools</strong>, and your CMS —{' '}
        <span className="ps-red">losing hours every week to tool overload.</span>
      </>
    ),
  },
  {
    avatar: { label: 'M', bg: '#f97316' },
    text: (
      <>
        <span className="ps-red">Hours spent learning</span>{' '}
        <BrandChip label="S" tone="#10b981" />
        {' '}<strong>SEMrush</strong> &amp;{' '}
        <img src={L.ahrefs} alt="Ahrefs" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>Ahrefs</strong> that still don't publish content automatically to your site.
      </>
    ),
  },
  {
    avatar: { label: 'K', bg: '#7c3aed' },
    text: (
      <>
        Content gets created in{' '}
        <img src={L.chatgpt} alt="ChatGPT" width="14" height="14" className="ps-brand-icon" loading="lazy" decoding="async" />
        {' '}<strong>ChatGPT</strong>… but{' '}
        <span className="ps-red">never compounds</span> — no internal linking, no scaling system, no traffic flywheel.
      </>
    ),
  },
];

const SOLUTIONS = [
  'Keyword Research',
  'Content Generation',
  'SEO Optimization',
  'AI-ready Formatting',
  'Auto Publishing',
  'Multi-language Support',
];

export default function ProblemSolution() {
  return (
    <section className="ps-section">
      <div className="container">
        <div className="ps-grid">
          {/* Left — problems */}
          <div className="ps-left">
            <span className="ps-label">Problems & Solution</span>
            <h2 className="ps-heading">
              Your problem.<br />
              <em>Our solution.</em>
            </h2>
            <div className="ps-problems">
              {PROBLEMS.map((p, i) => (
                <div key={i} className="ps-chat-row">
                  <span
                    aria-hidden="true"
                    className="ps-chat-avatar"
                    style={{ background: p.avatar.bg, color: '#fff' }}
                  >
                    {p.avatar.label}
                  </span>
                  <div className="ps-chat-bubble">
                    <p>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — solution card */}
          <div className="ps-right">
            <div className="ps-solution-card">
              <div className="ps-card-header">
                <div className="ps-card-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <span className="ps-card-brand">Blogy</span>
              </div>
              <p className="ps-card-sub">Replace multiple tools with one powerful platform:</p>
              <ul className="ps-features">
                {SOLUTIONS.map((s, i) => (
                  <li key={i}>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 10l5 5 8-8"/>
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href="https://dashboard.blogy.in/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="ps-card-cta"
                data-analytics-event="cta_click_any"
                data-analytics-source="problem_solution_cta"
              >
                Start for free →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
