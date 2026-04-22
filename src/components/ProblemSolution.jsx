import './ProblemSolution.css';

const PROBLEMS = [
  {
    avatar: 'A',
    color: '#a78bfa',
    text: (
      <>
        Monthly subscriptions for <strong>Ahrefs</strong>, <strong>Canva</strong>, ChatGPT etc. eat up{' '}
        <span className="ps-red">₹30,000+ of marketing budget</span> with nothing to show.
      </>
    ),
  },
  {
    avatar: 'S',
    color: '#34d399',
    text: (
      <>
        Switching between <strong>ChatGPT</strong>, keyword tools, and your CMS —{' '}
        <span className="ps-red">losing hours every week to tool overload.</span>
      </>
    ),
  },
  {
    avatar: 'M',
    color: '#fbbf24',
    text: (
      <>
        <span className="ps-red">Hours spent learning SEO tools</span> that still don't publish content
        automatically to your site.
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
                <div key={i} className="ps-problem">
                  <div className="ps-avatar" style={{ background: p.color }}>{p.avatar}</div>
                  <p>{p.text}</p>
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
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.5">
                      <path d="M4 10l5 5 8-8"/>
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
              <a href="https://dashboard.blogy.in/signup" target="_blank" rel="noopener noreferrer" className="ps-card-cta">
                Start for free →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
