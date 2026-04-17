import './Features.css';

const FEATURES = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
    title: 'Automate Topic Discovery',
    desc: 'Never guess what to write—Blogy finds high-intent topics that actually rank.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>,
    title: 'Publish Consistently',
    desc: 'Manual workflows cause irregular posting; Blogy keeps your blog always active.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
    title: 'SEO Built In',
    desc: 'Great writing fails without SEO—Blogy structures every blog to rank on page 1.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    title: 'Eliminate Agency Dependence',
    desc: 'Agencies are slow and expensive; Blogy delivers faster results at a fraction of the cost.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>,
    title: 'Programmatic SEO',
    desc: 'Scale to thousands of targeted pages without writing a single word manually.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>,
    title: 'Multi-Platform Publishing',
    desc: 'Publish directly to Shopify, WordPress, Webflow, Wix and custom websites.',
  },
];

export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Content That <span className="text-teal">Finally Works</span></h2>
          <p className="section-sub">Turn scattered content efforts into consistent, compounding organic growth.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
