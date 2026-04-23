import './ProblemSolution.css';

const SI = 'https://cdn.simpleicons.org';

const PROBLEMS = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: (
      <>
        Monthly subscriptions for{' '}
        <img src={`${SI}/ahrefs`} alt="Ahrefs" className="ps-brand-icon" />
        {' '}<strong>Ahrefs</strong>,{' '}
        <img src={`${SI}/semrush`} alt="SEMrush" className="ps-brand-icon" />
        {' '}<strong>SEMrush</strong>,{' '}
        <img src={`${SI}/canva`} alt="Canva" className="ps-brand-icon" />
        {' '}<strong>Canva</strong> &amp;{' '}
        <img src={`${SI}/adobephotoshop`} alt="Photoshop" className="ps-brand-icon" />
        {' '}<strong>Photoshop</strong> eat up{' '}
        <span className="ps-red">₹30,000+ of marketing budget</span> with nothing to show.
      </>
    ),
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: (
      <>
        Switching between{' '}
        <img src={`${SI}/openai`} alt="ChatGPT" className="ps-brand-icon" />
        {' '}<strong>ChatGPT</strong>,{' '}
        <img src={`${SI}/ahrefs`} alt="Ahrefs" className="ps-brand-icon" />
        {' '}<strong>keyword tools</strong>, and your CMS —{' '}
        <span className="ps-red">losing hours every week to tool overload.</span>
      </>
    ),
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: (
      <>
        <span className="ps-red">Hours spent learning</span>{' '}
        <img src={`${SI}/semrush`} alt="SEMrush" className="ps-brand-icon" />
        {' '}<strong>SEMrush</strong> &amp;{' '}
        <img src={`${SI}/ahrefs`} alt="Ahrefs" className="ps-brand-icon" />
        {' '}<strong>Ahrefs</strong> that still don't publish content automatically to your site.
      </>
    ),
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    text: (
      <>
        Content gets created in{' '}
        <img src={`${SI}/openai`} alt="ChatGPT" className="ps-brand-icon" />
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
                  <img src={p.avatar} alt="" className="ps-chat-avatar" />
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
