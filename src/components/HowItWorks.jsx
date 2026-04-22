import './HowItWorks.css';

const STEPS = [
  {
    num: '01',
    title: 'Deep analysis of your business',
    desc: 'We explore your niche, competitors, and target audience. Discover hidden keywords with high traffic potential and low competition.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get a powerful 30-day plan',
    desc: 'Create a strategic content plan where each day focuses on a key phrase with the highest potential for your business.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Generate articles on autopilot',
    desc: 'We create and publish SEO-optimized articles based on selected keywords daily. Your blog grows automatically while you focus on your business.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Track what compounds',
    desc: 'Rankings, impressions, AI citations & revenue — per post, so you double down on what works and cut what doesn\'t.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="container">
        <div className="hiw-layout">
          {/* Left — label, heading, description, CTA */}
          <div className="hiw-left">
            <span className="hiw-label">How it works</span>
            <h2 className="hiw-heading">
              How we <em>make magic</em> happen
            </h2>
            <p className="hiw-desc">
              We handle the SEO heavy lifting. Relax while we create daily ranking content to keep you ahead of the competition.
            </p>
            <a href="https://dashboard.blogy.in/signup" target="_blank" rel="noopener noreferrer" className="hiw-cta">
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Right — 2×2 cards */}
          <div className="hiw-cards">
            {STEPS.map((s, i) => (
              <div key={i} className="hiw-card">
                <div className="hiw-card-top">
                  <span className="hiw-num">{s.num}</span>
                  <div className="hiw-icon">{s.icon}</div>
                </div>
                <h3 className="hiw-title">{s.title}</h3>
                <p className="hiw-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
