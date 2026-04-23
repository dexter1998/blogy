import './Blogs.css';

const POSTS = [
  {
    cat: 'Growth',
    title: 'Why AI Overviews killed your long-tail rankings (and what to do next)',
    read: '8 min', date: 'Apr 18', tint: 'var(--teal-500)', featured: true,
  },
  {
    cat: 'Playbook',
    title: 'Programmatic SEO for SaaS: 1,284 pages from one template',
    read: '12 min', date: 'Apr 12', tint: '#f97316', featured: false,
  },
  {
    cat: 'Teardown',
    title: 'How Zerodha compounds organic traffic without a content team',
    read: '6 min', date: 'Apr 05', tint: '#059669', featured: false,
  },
  {
    cat: 'LLM SEO',
    title: 'The GEO checklist: getting cited by ChatGPT, Claude & Perplexity',
    read: '10 min', date: 'Mar 28', tint: '#3b82f6', featured: false,
  },
];

export default function Blogs() {
  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="blog-header">
          <div>
            <span className="section-label">Field notes</span>
            <h2 className="section-title" style={{ textAlign: 'left', margin: '10px 0 6px' }}>
              From the <em>Blogy journal.</em>
            </h2>
            <p className="blog-sub">
              Playbooks, teardowns, and SEO field research from the team shipping Blogy.
            </p>
          </div>
          <button type="button" className="btn-ghost">
            All posts
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div className="blog-grid">
          {POSTS.map((p, i) => (
            <article key={i} className={`blog-card ${p.featured ? 'blog-card--featured' : ''}`}>
              <div className="blog-thumb" style={{ '--tint': p.tint }} />
              <div className="blog-body">
                <div className="blog-cat">{p.cat}</div>
                <h3 className="blog-title">{p.title}</h3>
                <div className="blog-meta">
                  <span>{p.date}</span>
                  <span>· {p.read} read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
