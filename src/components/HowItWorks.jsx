import './HowItWorks.css';

const STEPS = [
  {
    num: '01',
    title: 'Connect Your Website',
    desc: 'Link your Shopify, WordPress, Webflow, or any CMS in minutes. No coding required.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
  },
  {
    num: '02',
    title: 'Blogy Crawls & Analyzes',
    desc: 'Our AI scans your site, discovers competitor gaps, and builds a keyword-rich content map.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  },
  {
    num: '03',
    title: 'AI Writes & Schedules',
    desc: 'SEO-optimized, long-form articles are generated, internally linked, and scheduled automatically.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  },
  {
    num: '04',
    title: 'Publish & Rank',
    desc: 'Posts go live on your site automatically. Watch your organic traffic compound over time.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Up and Running in <span className="text-teal">4 Steps</span></h2>
          <p className="section-sub">From setup to ranking in under 10 minutes. No technical skills needed.</p>
        </div>
        <div className="hiw-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="hiw-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hiw-num">{s.num}</div>
              <div className="hiw-icon">{s.icon}</div>
              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="hiw-arrow" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
