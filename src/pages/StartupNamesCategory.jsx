import { useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import data from '../data/startup-names.json';
import SEOHead from '../components/SEOHead';
import './StartupNamesCategory.css';

const WORKS_FOR_ICONS = {
  Businesses: '🏢', Apps: '📱', 'SaaS Tools': '☁️', Products: '📦',
  Finance: '💳', Services: '🔧', Healthcare: '🏥', Education: '📚',
  Platforms: '🖥️', Software: '💻', Tools: '🛠️', Retail: '🛍️',
  Marketplaces: '🏪', Energy: '⚡', Travel: '✈️',
};

const getTips = (cat) => [
  `Use industry-specific terminology from ${cat} only if your target audience is already familiar with it — otherwise stick to universally understood words.`,
  `Avoid overused prefixes like "i" or "e" and focus instead on action-oriented words that describe what your ${cat} startup actually does.`,
  `Check for domain availability and social media handles simultaneously — you want @YourStartupName to be available everywhere before you commit.`,
  `Decide whether your name focuses on what your ${cat} startup does versus what it helps achieve — your name should clearly reflect that choice.`,
  `Verify your chosen name does not sound too similar to an existing ${cat} competitor to avoid trademark conflicts and audience confusion.`,
];

const getFaqs = (cat, topNames) => [
  { q: `What are good ${cat} startup names?`, a: `Here are some of the best ${cat} startup names: ${topNames.slice(0,5).map(n => n.name).join(', ')}. These names balance memorability with industry credibility.` },
  { q: `What are catchy ${cat} startup names?`, a: `Catchy ${cat} startup names are short, memorable, and evocative. Names in the Playful and Clever categories above tend to be the most memorable and shareable.` },
  { q: `What makes a great ${cat} startup name?`, a: `A great ${cat} startup name is easy to pronounce, spell, and remember. It should hint at your value proposition while being distinctive enough to own in a crowded market.` },
  { q: `How do I choose a ${cat} startup name?`, a: `Start by deciding the feeling you want your name to evoke — authority, friendliness, or wit. Then check domain and social handle availability before committing to your final choice.` },
  { q: `Should my ${cat} startup name include keywords?`, a: `Including ${cat}-related keywords can improve SEO and make your niche instantly clear. However, purely descriptive names can feel generic — balance clarity with personality for best results.` },
  { q: `How do I check if a ${cat} startup name is available?`, a: `Check domain availability on Namecheap or GoDaddy. Then verify social handles on Instagram, X, and LinkedIn. Finally search the trademark database to confirm no conflicts.` },
  { q: `What are creative ${cat} startup names?`, a: `For creative ${cat} startup names, look at the Clever and Playful sections above. These use wordplay, portmanteaus, and unexpected combinations to stand out from the crowd.` },
  { q: `How long should a ${cat} startup name be?`, a: `The sweet spot is 1–2 words and under 12 characters. Shorter names are easier to remember, type, and brand across all platforms. Avoid names that are hard to spell phonetically.` },
];

/* ─── Sub-components ─── */

function InlineCTA({ large }) {
  return (
    <div className={`snc-inline-cta ${large ? 'snc-inline-cta-large' : ''}`}>
      <div className="snc-cta-logo">B</div>
      <div className="snc-cta-body">
        <p className="snc-cta-title">Found your name?</p>
        <p className="snc-cta-sub">Blogy can write your first 10 SEO blog posts in minutes.</p>
      </div>
      <a href="https://dashboard.blogy.in" target="_blank" rel="noopener noreferrer" className="snc-cta-link">
        Try Blogy Free →
      </a>
    </div>
  );
}

function TopPicks({ names, catName }) {
  return (
    <div className="snc-box snc-top-picks">
      <div className="snc-box-head">
        <span>⭐</span> Top {catName} Startup Name Picks
      </div>
      {names.map((n, i) => (
        <div key={i} className="snc-pick-row">
          <span className="snc-pick-num">{i + 1}</span>
          <span className="snc-pick-name">{n.name}</span>
          <span className="snc-pick-tag">— {n.tagline}</span>
        </div>
      ))}
    </div>
  );
}

function TableOfContents({ nameGroups, catName, total, onJump }) {
  const extras = [
    { label: 'Free Name Generator', id: 'generator' },
    { label: `Best ${catName} Names for Social Media`, id: 'best-social' },
    { label: `Best ${catName} Business Name Ideas`, id: 'best-business' },
    { label: `How to Choose Your ${catName} Name`, id: 'how-to' },
    { label: 'Frequently Asked Questions', id: 'faq' },
  ];
  return (
    <div className="snc-box snc-toc">
      <div className="snc-box-head">
        <span>≡</span> {catName} Startup Name Categories
      </div>
      {nameGroups.map((g, i) => (
        <button key={g.style} className="snc-toc-row" onClick={() => onJump(`style-${g.style}`)}>
          <span className="snc-toc-num">{i + 1}</span>
          <span className="snc-toc-label">{g.label}</span>
          <span className="snc-toc-count">({g.names.length} names)</span>
        </button>
      ))}
      {extras.map(e => (
        <button key={e.id} className="snc-toc-row snc-toc-extra" onClick={() => onJump(e.id)}>
          <span className="snc-toc-arr">›</span>
          <span className="snc-toc-label">{e.label}</span>
        </button>
      ))}
    </div>
  );
}

function NameItem({ name, tagline, why, style }) {
  const styleClass = style.toLowerCase();
  return (
    <div className="snc-name-item">
      <div className="snc-name-row">
        <span className="snc-name-text">{name}</span>
        <span className="snc-domain-badge">Domain likely</span>
        <span className={`snc-style-badge snc-style-${styleClass}`}>{style}</span>
      </div>
      {tagline && <p className="snc-name-tagline">"{tagline}"</p>}
      {why    && <p className="snc-name-why">{why}</p>}
    </div>
  );
}

function NameSection({ group, catName }) {
  return (
    <section id={`style-${group.style}`} className="snc-group">
      <h2 className="snc-group-title">
        {group.names.length} {group.label} {catName} Startup Names
      </h2>
      <p className="snc-group-desc">{group.desc}</p>
      <div className="snc-name-list">
        {group.names.map((n, i) => (
          <NameItem key={i} {...n} style={group.style} />
        ))}
      </div>
    </section>
  );
}

function BestForSection({ id, title, icon, names }) {
  if (!names || names.length === 0) return null;
  return (
    <section id={id} className="snc-bestfor">
      <h3 className="snc-bestfor-title">
        <span>{icon}</span> {title}
      </h3>
      <p className="snc-bestfor-desc">
        These names are memorable, easy to say aloud, and work across all platforms.
      </p>
      <div className="snc-bestfor-list">
        {names.map((n, i) => (
          <div key={i} className="snc-bestfor-item">
            <span className="snc-bestfor-name">{n.name}</span>
            {n.tagline && <span className="snc-bestfor-tag">"{n.tagline}"</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function NameGenerator({ names }) {
  const [picks, setPicks] = useState([]);
  const shuffle = () => {
    const shuffled = [...names].sort(() => 0.5 - Math.random()).slice(0, 6);
    setPicks(shuffled);
  };
  return (
    <section id="generator" className="snc-generator">
      <h3 className="snc-generator-title">Free Startup Name Generator</h3>
      <p className="snc-generator-sub">Hit generate to get a random selection of startup name ideas from our curated list.</p>
      {picks.length > 0 && (
        <div className="snc-generator-results">
          {picks.map((n, i) => (
            <span key={i} className="snc-gen-name">{n.name}</span>
          ))}
        </div>
      )}
      <button className="snc-shuffle-btn" onClick={shuffle}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
          <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
        </svg>
        Generate
      </button>
    </section>
  );
}

function HowToChoose({ catName }) {
  const tips = getTips(catName);
  return (
    <section id="how-to" className="snc-howto">
      <h3 className="snc-howto-title">How to Choose Your {catName} Startup Name</h3>
      <div className="snc-tips-list">
        {tips.map((tip, i) => (
          <div key={i} className="snc-tip">
            <span className="snc-tip-num">{i + 1}</span>
            <p className="snc-tip-text">{tip}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQAccordion({ catName, topNames }) {
  const [open, setOpen] = useState(0);
  const faqs = getFaqs(catName, topNames);
  return (
    <section id="faq" className="snc-faq">
      <h3 className="snc-faq-title">{catName} Startup Name Ideas: FAQs</h3>
      {faqs.map((f, i) => (
        <div key={i} className="snc-faq-item">
          <button className="snc-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
            {f.q}
            <svg className={`snc-faq-chevron ${open === i ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {open === i && <p className="snc-faq-a">{f.a}</p>}
        </div>
      ))}
    </section>
  );
}

function MoreNiches({ categories }) {
  return (
    <section className="snc-more">
      <p className="snc-more-label">More Name Ideas by Niche</p>
      <div className="snc-more-grid">
        {categories.map(c => (
          <Link key={c.slug} to={`/startup-names/${c.slug}`} className="snc-more-link">
            {c.category} name ideas
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Main page ─── */
export default function StartupNamesCategory() {
  const { slug } = useParams();
  const cat = data.categories.find(c => c.slug === slug);

  if (!cat) return <Navigate to="/startup-names" replace />;

  const others      = data.categories.filter(c => c.slug !== slug);
  const total       = cat.name_groups.reduce((s, g) => s + g.names.length, 0);
  const topNames    = cat.name_groups[0]?.names.slice(0, 5) || [];
  const year        = new Date().getFullYear();
  const playful     = cat.name_groups.find(g => g.style === 'Playful')?.names.slice(0, 5)     || [];
  const professional= cat.name_groups.find(g => g.style === 'Professional')?.names.slice(0, 5)|| [];

  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="snc-page">
      <SEOHead
        title={cat.page_title}
        description={cat.category_description || cat.long_description.slice(0, 155)}
        path={`/startup-names/${cat.slug}`}
      />

      {/* Breadcrumb */}
      <div className="snc-breadcrumb-bar">
        <div className="snc-wrap">
          <nav className="snc-breadcrumb">
            <Link to="/startup-names">Startup Names</Link>
            <span>›</span>
            <span>{cat.category}</span>
          </nav>
        </div>
      </div>

      <div className="snc-wrap">

        {/* Heading */}
        <h1 className="snc-title">{cat.page_title}</h1>
        <div className="snc-meta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{total} {cat.category.toLowerCase()} startup name ideas</span>
          <span className="snc-meta-dot">·</span>
          <span>Updated {year}</span>
        </div>

        {/* Description */}
        <p className="snc-desc">{cat.long_description}</p>

        {/* Works For */}
        {cat.works_for.length > 0 && (
          <div className="snc-works-for">
            <span className="snc-works-label">WORKS FOR</span>
            {cat.works_for.map(w => (
              <span key={w} className="snc-works-badge">
                {WORKS_FOR_ICONS[w] || '📌'} {w}
              </span>
            ))}
          </div>
        )}

        {/* Inline CTA */}
        <InlineCTA />

        {/* Top picks */}
        <TopPicks names={topNames} catName={cat.category} />

        {/* Table of contents */}
        <TableOfContents
          nameGroups={cat.name_groups}
          catName={cat.category}
          total={total}
          onJump={scrollTo}
        />

        {/* Filter tabs */}
        <div className="snc-filter-tabs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span className="snc-filter-label">Filter by style:</span>
          {cat.name_groups.map(g => (
            <button key={g.style} className="snc-filter-tab" onClick={() => scrollTo(`style-${g.style}`)}>
              {g.style}
            </button>
          ))}
        </div>

        {/* Name sections */}
        {cat.name_groups.map(g => (
          <NameSection key={g.style} group={g} catName={cat.category} />
        ))}

        {/* Name generator */}
        <NameGenerator names={cat.name_groups.flatMap(g => g.names)} />

        {/* Best-for sub-sections */}
        <BestForSection
          id="best-social"
          title={`Best ${cat.category} Startup Names for Social Media`}
          icon="📱"
          names={playful}
        />
        <BestForSection
          id="best-business"
          title={`Best ${cat.category} Business Name Ideas`}
          icon="💼"
          names={professional}
        />

        {/* How to choose */}
        <HowToChoose catName={cat.category} />

        {/* FAQ */}
        <FAQAccordion catName={cat.category} topNames={topNames} />

        {/* Final CTA */}
        <InlineCTA large />

        {/* More niches */}
        <MoreNiches categories={others} />
      </div>
    </div>
  );
}
