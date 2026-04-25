import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ALL_CATEGORIES } from '../data/nameGeneratorData';
import { generate5Names } from '../utils/nameGeneratorEngine';
import namesData from '../data/startup-names.json';
import { trackEvent } from '../lib/analytics';
import './StartupNameGenerator.css';

// ─── NAMECHEAP REFERRAL ───────────────────────────────────────────────────────
const NAMECHEAP_REF_ID = '';
function getDomainURL(name) {
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const ref = NAMECHEAP_REF_ID ? `&clickID=${NAMECHEAP_REF_ID}` : '';
  return `https://www.namecheap.com/domains/registration/results/?domain=${domain}.com${ref}`;
}
// ─────────────────────────────────────────────────────────────────────────────

// Build slug map from JSON — each category has a unique slug field
const SLUG_MAP = Object.fromEntries(
  namesData.categories.map(c => [c.category, c.slug])
);

function getCategorySlug(cat) {
  return SLUG_MAP[cat] || cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-startup-name-ideas';
}

const STYLES = [
  { num: 1, icon: '⚡', name: 'Coined', desc: 'Invented brand words, VC-backable' },
  { num: 2, icon: '🎯', name: 'Playful', desc: 'Fun, punchy consumer vibes' },
  { num: 3, icon: '🔮', name: 'Abstract', desc: 'Pure fusion coinages' },
  { num: 4, icon: '🔍', name: 'SEO India', desc: 'Keyword-rich, local discoverability' },
  { num: 5, icon: '👤', name: 'Founder', desc: 'Personal brand + domain suffix' },
];

const POPULAR_CATS = [
  'AI Startups', 'FinTech', 'EdTech', 'Food Delivery',
  'Fashion', 'Health & Wellness', 'SaaS Startups', 'E-commerce',
  'Yoga', 'Digital Marketing',
];

const FAQS = [
  { q: 'What makes a great startup name?', a: 'A great startup name is short (under 10 characters), easy to spell, pronounce, and remember. It should feel distinct from competitors, work globally without bad meanings in other languages, and — most importantly — have a matching .com domain available. The best startup names are invented words or abstract terms: Stripe, Notion, Figma, Zomato, Zepto.' },
  { q: 'How do I check if a startup name is already taken?', a: 'Check three things: (1) Domain availability on Namecheap, (2) Trademark search on IP India portal (ipindia.gov.in) or USPTO for global markets, (3) Google search + social media handles. Our generator adds a direct domain check link next to each generated startup name so you can instantly verify availability.' },
  { q: 'Should I use .com or .in for my Indian startup?', a: '.in works for India-first businesses, but .com builds global credibility with investors and users. Most top Indian startups — Razorpay, Meesho, Zepto, CRED — use .com. Budget for both .com and .in when possible; they\'re affordable on Namecheap and the redirect setup takes 5 minutes.' },
  { q: 'How many startup name ideas should I shortlist?', a: 'Generate 20–30 startup business name ideas, shortlist 5–7 that pass domain and trademark checks, then test those with 10 real potential customers. Ask: "What type of business do you think this is?" Their answers reveal how clearly the name communicates your brand positioning.' },
  { q: 'Can I use my own name (founder name) for my startup?', a: 'Yes — founder-branded companies (Tesla, Dell, Ambani Group, Haldiram\'s) carry personal authority and trust. But founder names can limit sellability and investor perception of the company as an institution. Use our Founder naming style to explore personal brand startup names.' },
  { q: 'What is the ideal length for a startup name?', a: 'The most memorable startup names are 5–8 characters: Uber (4), Slack (5), Stripe (6), Notion (6), Figma (5), Google (6). Avoid names longer than 12 characters — they\'re hard to type on mobile, harder to remember, and difficult to fit into a logo or app icon.' },
  { q: 'Do I need to trademark my startup name in India?', a: 'Highly recommended once you have traction. Filing for trademark in India costs ₹4,500–₹9,000 per class. It protects you legally and signals seriousness to investors. File on ipindia.gov.in or use a service like LegalDhundo, Legalwiz.in, or Vakil Search.' },
  { q: 'What are the most common startup naming mistakes?', a: 'Top mistakes: (1) Choosing a name too hard to spell, (2) Ignoring .com domain availability, (3) Picking a name that limits future pivots (e.g. "Mumbai Cabs" if you expand nationally), (4) Not checking trademarks before announcing publicly, (5) Not testing with real users before committing.' },
];

const KEY_TAKEAWAYS = [
  'Your startup name is your first pitch to investors, customers, and the world',
  'Aim for under 10 characters — shorter names are remembered 2× more often',
  'Always check .com domain availability before falling in love with a name',
  'Invented (coined) names like Stripe and Razorpay age the best over time',
  'Abstract names work best for startups that plan to pivot or expand categories',
  'SEO-friendly names work best for local Indian service businesses',
  'Run at least 3 naming styles — you\'ll be surprised which one fits best',
  'Trademark your shortlisted name before announcing your startup publicly',
];

/* ── Custom Category Dropdown ── */
function CategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_CATEGORIES;
    return ALL_CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function select(cat) {
    onChange(cat);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="sng2-dd" ref={ref}>
      <button
        className={`sng2-dd-trigger ${open ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="sng2-dd-value">{value || 'Select a category (664+ niches)…'}</span>
        <svg className="sng2-dd-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {open && (
        <div className="sng2-dd-panel">
          <div className="sng2-dd-search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              ref={inputRef}
              className="sng2-dd-search"
              type="text"
              placeholder="Search 664 categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="sng2-dd-list">
            {filtered.length === 0
              ? <div className="sng2-dd-empty">No categories found</div>
              : filtered.map(cat => (
                <button
                  key={cat}
                  className={`sng2-dd-item ${value === cat ? 'active' : ''}`}
                  onClick={() => select(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Name Card ── */
function NameCard2({ result, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result.name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="sng2-name-card" style={{ animationDelay: `${index * 65}ms` }}>
      <div className="sng2-name-top">
        <span className="sng2-num">#{index + 1}</span>
        <span className="sng2-name-text">{result.name}</span>
      </div>
      <p className="sng2-tagline">{result.tagline}</p>
      <div className="sng2-name-actions">
        <button className="sng2-copy-btn" onClick={copy}>
          {copied
            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          }
          {copied ? 'Copied!' : 'Copy Name'}
        </button>
        <a
          className="sng2-domain-btn"
          href={getDomainURL(result.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          Domain Availability ↗
        </a>
        <button className={`sng2-why-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          Why this name?
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
      {open && <p className="sng2-why-text">{result.why}</p>}
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sng2-faq-item ${open ? 'open' : ''}`}>
      <button className="sng2-faq-q" onClick={() => setOpen(!open)}>
        <span>{item.q}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && <div className="sng2-faq-a">{item.a}</div>}
    </div>
  );
}

/* ── Main Page ── */
export default function StartupNameGenerator() {
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(1);
  const [seed, setSeed] = useState(0);

  const catIdx = useMemo(() => ALL_CATEGORIES.indexOf(selectedCat), [selectedCat]);

  const results = useMemo(() => {
    if (!selectedCat) return null;
    return generate5Names(selectedCat, catIdx < 0 ? 0 : catIdx, selectedStyle, seed);
  }, [selectedCat, catIdx, selectedStyle, seed]);

  function selectCat(cat) {
    trackEvent(
      'form_start',
      { source: 'generator_category_select' },
      { onceKey: `form_start:${window.location.pathname}` }
    );
    setSelectedCat(cat);
    setSeed(0);
  }

  const catSlug = selectedCat ? getCategorySlug(selectedCat) : null;
  const viewAllLink = catSlug ? `/startup-names/${catSlug}` : '/startup-names';

  return (
    <div className="sng2-page">
      <Helmet>
        <title>Free Business Name Generator (2026) | Blogy</title>
        <meta name="description" content="Startup name generator to create business name ideas, company names, brand names, and catchy startup names. Generate unique names instantly with AI and explore category-wise name ideas." />
        <meta name="keywords" content="startup name generator, business name generator, company name ideas, brand name generator, startup name ideas, catchy startup names, unique business names, free startup name generator India" />
      </Helmet>

      {/* ── Dark Zone: hero + generator wrapped together ── */}
      <div className="sng2-dark-zone">
        <div className="sng2-grid-overlay" />

        <div className="sng2-hero-header">
          <div className="container">
            <div className="sng2-hero-title-wrap">
              <span className="sng2-hero-label">Free Tool · 664+ Niches</span>
              <h1>Free <em>Business Name Generator</em></h1>
              <p>Generate catchy startup names, company names & brand names instantly. 664+ industry niches — tech, food, health, finance & more.</p>
              <div className="sng2-hero-tags">
                <span>⚡ Instant generation</span>
                <span>🌐 Domain check</span>
                <span>🇮🇳 India-ready</span>
                <span>✅ 100% Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Generator Card ── */}
        <div className="sng2-generator-wrap">
        <div className="container">
          <div className="sng2-hero-card">

            {/* Left: Controls */}
            <div className="sng2-controls">

              <div className="sng2-ctrl-group">
                <div className="sng2-ctrl-label">
                  <span className="sng2-ctrl-num">1</span>
                  Select your industry
                </div>
                <CategoryDropdown value={selectedCat} onChange={selectCat} />

                <div className="sng2-popular-label">Popular categories</div>
                <div className="sng2-popular-chips">
                  {POPULAR_CATS.map(cat => (
                    <button
                      key={cat}
                      className={`sng2-chip ${selectedCat === cat ? 'active' : ''}`}
                      onClick={() => selectCat(cat)}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sng2-ctrl-group">
                <div className="sng2-ctrl-label">
                  <span className="sng2-ctrl-num">2</span>
                  Naming style
                </div>
                <div className="sng2-style-pills">
                  {STYLES.map(s => (
                    <button
                      key={s.num}
                      className={`sng2-style-pill ${selectedStyle === s.num ? 'active' : ''}`}
                      onClick={() => { setSelectedStyle(s.num); setSeed(0); }}
                      title={s.desc}
                      type="button"
                    >
                      <span className="sng2-style-emoji">{s.icon}</span>
                      <span className="sng2-style-name">{s.name}</span>
                      <span className="sng2-style-desc">{s.desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  className="sng2-regen-btn sng2-regen-btn--full"
                  onClick={() => setSeed((currentSeed) => currentSeed + 1)}
                  type="button"
                  disabled={!selectedCat}
                  data-analytics-event="form_submit"
                  data-analytics-source="startup_name_generator"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                  {selectedCat ? 'Regenerate Names' : 'Generate Names'}
                </button>
              </div>

            </div>

            {/* Right: Results */}
            <div className="sng2-results-panel">
              {results ? (
                <>
                  <div className="sng2-results-header">
                    <div className="sng2-results-meta">
                      <span className="sng2-sel-chip">{selectedCat}</span>
                      <span className="sng2-sel-dot">·</span>
                      <span className="sng2-sel-style">{STYLES.find(s => s.num === selectedStyle)?.icon} {STYLES.find(s => s.num === selectedStyle)?.name}</span>
                    </div>
                    <Link to={viewAllLink} className="sng2-view-all-btn">
                      View All Names →
                    </Link>
                  </div>

                  <div className="sng2-name-list">
                    {results.map((r, i) => (
                      <NameCard2 key={`${seed}-${i}`} result={r} index={i} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="sng2-empty-state">
                  <div className="sng2-empty-mockup">
                    {['Novivex', 'Stackron', 'Fluxora', 'Veltron', 'Prismiq'].map((n, i) => (
                      <div key={n} className="sng2-mock-row" style={{ animationDelay: `${i * 0.15}s` }}>
                        <span className="sng2-mock-num">#{i + 1}</span>
                        <span className="sng2-mock-name">{n}</span>
                        <span className="sng2-mock-pill"></span>
                      </div>
                    ))}
                  </div>
                  <h3>Select a niche to generate names</h3>
                  <p>Pick an industry from the dropdown or popular categories on the left, choose your naming style, and get 5 brand-ready startup names instantly.</p>
                  <Link to="/startup-names" className="sng2-browse-link">
                    Or browse 1000+ curated startup names →
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
        </div>{/* end sng2-generator-wrap */}
      </div>{/* end sng2-dark-zone */}

      {/* ── Visual Band ── */}
      <div className="sng2-visual-band">
        <div className="container">
          <div className="sng2-visual-card">
            <div className="sng2-visual-col">
              <div className="sng2-visual-col-label">Abstract Ideas</div>
              <div className="sng2-visual-chips">
                {['SaaS Startups', 'AI Startups', 'Generative AI', 'FinTech', 'No-Code Startups', 'Deeptech', 'Web3 Tech', 'Blockchain Tech'].map(c => (
                  <span key={c} className="sng2-visual-chip">{c}</span>
                ))}
              </div>
            </div>
            <div className="sng2-visual-separator">
              <div className="sng2-vs-line"></div>
              <div className="sng2-vs-badge">OR</div>
              <div className="sng2-vs-line"></div>
            </div>
            <div className="sng2-visual-col">
              <div className="sng2-visual-col-label">Industry / Niche</div>
              <div className="sng2-visual-chips">
                {['Food Delivery', 'Fashion', 'Yoga', 'Photography', 'Sustainability', 'Investing', 'Online Courses', 'Coffee'].map(c => (
                  <span key={c} className="sng2-visual-chip sng2-visual-chip--alt">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Article + Sidebar ── */}
      <div className="sng2-content-section">
        <div className="container">
          <div className="sng2-content-layout">

            {/* Article */}
            <article className="sng2-article">

              <div className="sng2-article-lead">
                <span className="section-label">Complete Guide · Updated 2026</span>
                <h2 id="guide">How to Choose the Perfect <em>Startup Name</em></h2>
                <p className="sng2-lead-text">
                  Your <strong>startup name</strong> is the most important brand decision you'll make before launch. It appears on your website, app store listing, investor decks, and every piece of marketing. Getting it right the first time saves lakhs in rebranding costs — and months of lost momentum. This guide covers everything: naming frameworks used by billion-dollar companies to a step-by-step process for <strong>Indian startup founders</strong>.
                </p>
              </div>

              <div className="sng2-toc">
                <div className="sng2-toc-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                  Table of Contents
                </div>
                <ol className="sng2-toc-list">
                  <li><a href="#why-matters">Why Your Startup Name Matters More Than You Think</a></li>
                  <li><a href="#5-types">5 Types of Winning Startup Names</a></li>
                  <li><a href="#checklist">The Perfect Startup Name Checklist (6 Steps)</a></li>
                  <li><a href="#domain">Domain Name Strategy for Indian Startups</a></li>
                  <li><a href="#mistakes">5 Naming Mistakes That Kill Startups</a></li>
                  <li><a href="#case-studies">Real Startup Name Case Studies</a></li>
                  <li><a href="#faq">Frequently Asked Questions</a></li>
                  <li><a href="#takeaways">Key Takeaways</a></li>
                </ol>
              </div>

              <section id="why-matters" className="sng2-section">
                <h2>Why Your Startup Name Matters More Than You Think</h2>
                <p>A <strong>startup name</strong> is far more than a label. It's the first thing investors Google, the first thing customers type into a search bar, and the last thing they remember when recommending you to a friend. Companies with short, memorable names grow <strong>2.4× faster</strong> than those with complex, forgettable brand names.</p>
                <div className="sng2-stat-grid">
                  <div className="sng2-stat-card"><div className="sng2-stat-num">77%</div><div className="sng2-stat-label">of consumers make purchase decisions based on brand name alone</div></div>
                  <div className="sng2-stat-card"><div className="sng2-stat-num">2.4×</div><div className="sng2-stat-label">faster growth for startups with short, memorable brand names</div></div>
                  <div className="sng2-stat-card"><div className="sng2-stat-num">₹2L+</div><div className="sng2-stat-label">average cost of rebranding when a startup name fails in India</div></div>
                  <div className="sng2-stat-card"><div className="sng2-stat-num">6 chars</div><div className="sng2-stat-label">average length of the world's most successful startup names</div></div>
                </div>
                <div className="sng2-insight-box">
                  <div className="sng2-box-icon">💡</div>
                  <div className="sng2-box-body"><strong>The Naming Paradox:</strong> The best startup names feel obvious in hindsight — but are nearly impossible to invent under pressure. "Uber", "Stripe", "Slack" all sound inevitable today. That's the goal: a name that feels like it was always meant to be. Use our <strong>free startup name generator</strong> to explore hundreds of possibilities without the blank-page anxiety.</div>
                </div>
                <p>In India, <strong>startup name ideas</strong> need to work in Hindi, English, and regional language contexts without unintended meanings. Many global brands have faced embarrassment in India because their names had unflattering local meanings. Our <strong>company name generator</strong> is built with Indian founders in mind.</p>
              </section>

              <div className="sng2-divider sng2-divider--gradient"></div>

              <section id="5-types" className="sng2-section">
                <h2>5 Types of Winning Startup Names</h2>
                <p>Every successful <strong>business name</strong> falls into one of five categories. Understanding these helps you use our <strong>brand name generator</strong> more strategically:</p>
                <div className="sng2-type-cards">
                  {[
                    { icon: '⚡', name: 'Coined / Invented Names', desc: 'Pure brand inventions with no prior meaning. Gold standard for VC-backed startups. High memorability, full trademark protection, global scalability.', eg: 'Xerox, Kodak, Razorpay, Zomato, Novivex' },
                    { icon: '🎯', name: 'Descriptive Names', desc: 'Tell customers exactly what you do. Lower marketing cost because the name educates. Risk: limits future pivots and expansion.', eg: 'Snapchat, YouTube, Salesforce, BookMyShow' },
                    { icon: '🔮', name: 'Abstract / Evocative Names', desc: 'Evoke feelings without literal meaning. Flexible for pivots, internationally safe, works across product lines.', eg: 'Uber, Slack, Stripe, Notion, Figma, CRED' },
                    { icon: '🔍', name: 'SEO-Friendly Names', desc: 'Optimized for search visibility. Ranks faster but feels less premium. Best for local service startups in India.', eg: 'Cars24, Just Dial, 99acres, Naukri' },
                    { icon: '👤', name: 'Founder / Personal Brand', desc: 'Build trust through personal authority. Ideal for consulting, coaching, boutique agencies. Risk: harder to scale.', eg: 'Tesla, Dell, Haldiram\'s, Tata Group' },
                  ].map(t => (
                    <div key={t.name} className="sng2-type-card">
                      <div className="sng2-type-icon">{t.icon}</div>
                      <div className="sng2-type-content">
                        <div className="sng2-type-name">{t.name}</div>
                        <div className="sng2-type-desc">{t.desc}</div>
                        <div className="sng2-type-eg"><em>E.g.: {t.eg}</em></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sng2-table-wrap">
                  <table className="sng2-table">
                    <thead>
                      <tr><th>Style</th><th>Memorability</th><th>Trademark</th><th>SEO Value</th><th>Best For</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ['Coined','High','green','Easy','green','Low','yellow','VC-backed, global'],
                        ['Descriptive','Medium','yellow','Hard','red','High','green','Single-category'],
                        ['Abstract','High','green','Easy','green','Low','yellow','Platforms, pivots'],
                        ['SEO India','Low','yellow','Hard','red','Very High','green','Local services'],
                        ['Founder','Medium','yellow','Easy','green','Medium','yellow','Personal brand'],
                      ].map(([style,mem,mc,tm,tc,seo,sc,best]) => (
                        <tr key={style}>
                          <td><strong>{style}</strong></td>
                          <td><span className={`sng2-badge sng2-badge--${mc}`}>{mem}</span></td>
                          <td><span className={`sng2-badge sng2-badge--${tc}`}>{tm}</span></td>
                          <td><span className={`sng2-badge sng2-badge--${sc}`}>{seo}</span></td>
                          <td>{best}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="sng2-divider"></div>

              <section id="checklist" className="sng2-section">
                <h2>The Perfect Startup Name Checklist (6-Step Process)</h2>
                <p>Follow this process used by top brand naming agencies. Works whether you're using our <strong>free startup name generator</strong> or brainstorming solo.</p>
                <div className="sng2-process">
                  {[
                    { n:'01', title:'Define Your Brand Identity', desc:'Write 3 adjectives for how your startup should feel. "Fast, reliable, local" leads to different names than "premium, elegant, innovative." Your naming style should match your brand personality before you generate anything.' },
                    { n:'02', title:'Generate 20–30 Business Name Ideas', desc:'Use our free startup name generator across all 5 naming styles. Explore 3–4 different niches. Don\'t filter yet — quantity drives quality in ideation. Aim for at least 30 company name ideas before shortlisting.' },
                    { n:'03', title:'Check Domain Availability', desc:'Every name card in our generator has a "Domain Availability" link to Namecheap. Check .com first, then .in. Eliminate any name where .com is taken by a competitor or active squatter.' },
                    { n:'04', title:'Run Trademark Searches', desc:'Search ipindia.gov.in for India trademarks. For global plans, check the USPTO database. Avoid names in your exact industry class.' },
                    { n:'05', title:'Test With Real Users', desc:'Share your shortlist with 10 potential customers. Ask: "What type of business do you think this is?" Their answers reveal misalignment between your startup name and brand positioning.' },
                    { n:'06', title:'Validate Across Languages', desc:'Run your top 3 names through Google Translate in Hindi, Tamil, Telugu, and Bengali. Ensure no unintended meanings. Check Urban Dictionary if targeting urban youth demographics.' },
                  ].map(s => (
                    <div key={s.n} className="sng2-process-step">
                      <div className="sng2-process-num">{s.n}</div>
                      <div className="sng2-process-body">
                        <div className="sng2-process-title">{s.title}</div>
                        <div className="sng2-process-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sng2-pro-tip">
                  <div className="sng2-box-icon">🔥</div>
                  <div className="sng2-box-body"><strong>Pro Tip:</strong> The best <strong>startup name ideas</strong> come from constraint. Try: pick your niche, use the "Coined" style, and limit yourself to names ending in a vowel. Coined + vowel-ending = highly memorable brand names (Google, Paytm, Canva, Figma, Zomato).</div>
                </div>
              </section>

              <div className="sng2-divider sng2-divider--section"></div>

              <section id="domain" className="sng2-section">
                <h2>Domain Name Strategy for Indian Startups</h2>
                <p>Your domain name is your digital real estate. For Indian startups, domain strategy deserves as much attention as the name itself.</p>
                <div className="sng2-def-box">
                  <div className="sng2-box-icon">📖</div>
                  <div className="sng2-box-body"><strong>Domain Extension Strategy:</strong> For a startup named "Novivex" — register novivex.com (primary), novivex.in (India redirect), and novivex.io (tech credibility, optional). Budget ₹1,500–₹3,000/year for all three combined on Namecheap.</div>
                </div>
                <div className="sng2-domain-cards">
                  {[
                    { ext:'.com', icon:'🌐', desc:'Global standard. Best for investor credibility, international expansion, and brand trust. Use as primary domain.', tag:'Recommended', color:'green' },
                    { ext:'.in', icon:'🇮🇳', desc:'India-specific. Better for local SEO. If .com isn\'t available, .in works well for D2C and service businesses targeting India.', tag:'Good for India-first', color:'yellow' },
                    { ext:'.io', icon:'⚙️', desc:'Tech startup credibility signal. Popular with SaaS and dev tools. Usually the .com equivalent is also available for the same coined name.', tag:'For Tech / SaaS', color:'yellow' },
                    { ext:'.co', icon:'📦', desc:'Good fallback when .com is taken. Professional and short. Used by several Indian unicorns in early stages before acquiring .com.', tag:'Acceptable fallback', color:'yellow' },
                  ].map(d => (
                    <div key={d.ext} className="sng2-domain-card">
                      <div className="sng2-domain-icon">{d.icon}</div>
                      <div className="sng2-domain-ext">{d.ext}</div>
                      <div className="sng2-domain-desc">{d.desc}</div>
                      <span className={`sng2-badge sng2-badge--${d.color}`}>{d.tag}</span>
                    </div>
                  ))}
                </div>
                <div className="sng2-warning-box">
                  <div className="sng2-box-icon">⚠️</div>
                  <div className="sng2-box-body"><strong>Warning:</strong> Avoid launching with "getnovivex.com" or "trynovivex.com" — these prefix hacks confuse customers, hurt SEO, and signal to investors that you couldn't secure your own brand name. Budget ₹5,000–₹50,000 to buy the clean .com domain upfront.</div>
                </div>
              </section>

              <div className="sng2-divider"></div>

              <section id="mistakes" className="sng2-section">
                <h2>5 Startup Naming Mistakes That Kill Businesses</h2>
                <p>Real patterns seen across hundreds of <strong>startup name ideas</strong> that failed to gain traction in the Indian market:</p>
                <div className="sng2-mistake-list">
                  {[
                    { n:'01', title:'Hard-to-spell names', desc:'If a customer hears your startup name and can\'t find it by typing, you\'re paying to acquire customers you immediately lose. Test: say your name to 5 people and ask them to type it. Any struggle = rethink.' },
                    { n:'02', title:'Ignoring domain availability', desc:'The #1 startup naming mistake in India. Founders build a brand around a name, then discover the .com is parked for $15,000. Check domain first, fall in love second. Every name card links directly to Namecheap.' },
                    { n:'03', title:'Names that limit future growth', desc:'"Mumbai Cabs" works until you expand to Delhi. "AI Resume Builder" works until you add interview prep. Pick a name with room to grow — or expect an expensive rebrand at Series A.' },
                    { n:'04', title:'Skipping trademark checks', desc:'Thousands of Indian startups receive cease-and-desist letters yearly. A ₹4,500 trademark filing can save ₹40 lakh in legal fees. Always check IP India before announcing publicly.' },
                    { n:'05', title:'Not testing with real users', desc:'You love your name because you invented it. Customers come to it cold. A name that tests poorly with 10 strangers will test poorly with 10,000 customers. Validate before committing.' },
                  ].map(m => (
                    <div key={m.n} className="sng2-mistake">
                      <div className="sng2-mistake-num">{m.n}</div>
                      <div className="sng2-mistake-body"><strong>{m.title}</strong><p>{m.desc}</p></div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="sng2-divider sng2-divider--gradient"></div>

              <section id="case-studies" className="sng2-section">
                <h2>Real Startup Name Case Studies: What Made Them Work</h2>
                <p>Study the best <strong>catchy startup names</strong> of the past decade and patterns emerge:</p>
                <div className="sng2-timeline">
                  {[
                    { company:'Zomato', insight:'Originally "Foodiebay" — limiting identity to a marketplace. Rebranded to "Zomato" (coined, no meaning) before Series A. The invented name unlocked global expansion and IPO potential.', lesson:'Coined names scale; descriptive names don\'t.' },
                    { company:'Razorpay', insight:'A blend of "Razor" (sharp, precise) + "Pay" (payments). Portmanteau at its best — premium, implies speed and precision, instantly communicates the payments space. Globally trademark-able.', lesson:'Portmanteau = best of descriptive and invented worlds.' },
                    { company:'CRED', insight:'A real word ("credibility/credit") that\'s short, premium, and ownable. One of the shortest Indian startup names ever. Works perfectly as app name, social handle, and domain.', lesson:'Existing words under 5 characters are brand gold.' },
                    { company:'Meesho', insight:'An invented name with no meaning, easy to pronounce in Hindi, Bengali, Tamil, and English. Two syllables, ends in a vowel, memorable. Got .com domain, cleared all language tests.', lesson:'Invented names work in India if pronounceable pan-India.' },
                    { company:'Zepto', insight:'Named after the SI prefix for 10⁻²¹ — implying extreme speed. Technical, coined, globally unique. Most customers don\'t know the origin, but the name feels fast and modern.', lesson:'Obscure technical terms make excellent startup names.' },
                  ].map(t => (
                    <div key={t.company} className="sng2-tl-item">
                      <div className="sng2-tl-dot"></div>
                      <div className="sng2-tl-body">
                        <div className="sng2-tl-company">{t.company}</div>
                        <p className="sng2-tl-insight">{t.insight}</p>
                        <div className="sng2-tl-lesson">💡 <em>{t.lesson}</em></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="sng2-divider"></div>

              <section id="faq" className="sng2-section">
                <h2>Frequently Asked Questions</h2>
                <p>Common questions from Indian founders using our <strong>free startup name generator</strong>:</p>
                <div className="sng2-faq">
                  {FAQS.map((item, i) => <FaqItem key={i} item={item} />)}
                </div>
              </section>

              <section id="takeaways" className="sng2-section">
                <div className="sng2-takeaways">
                  <div className="sng2-takeaways-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    Key Takeaways
                  </div>
                  <ul className="sng2-takeaways-list">
                    {KEY_TAKEAWAYS.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </section>

              <div className="sng2-int-links">
                <div className="sng2-int-title">Related Resources</div>
                <div className="sng2-int-grid">
                  <Link to="/startup-names" className="sng2-int-card">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    <div><div className="sng2-int-card-title">Browse All Startup Names</div><div className="sng2-int-card-desc">1000+ curated names across all industries</div></div>
                  </Link>
                  <Link to="/" className="sng2-int-card">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                    <div><div className="sng2-int-card-title">Blogy — Drive Startup Traffic</div><div className="sng2-int-card-desc">SEO, AI tools, and keyword research — free</div></div>
                  </Link>
                </div>
              </div>

            </article>

            {/* Sidebar */}
            <aside className="sng2-sidebar">
              <div className="sng2-sticky">

                <div className="sng2-promo">
                  <div className="sng2-promo-emoji">🎉</div>
                  <div className="sng2-promo-headline">Naming ho gyi?</div>
                  <div className="sng2-promo-sub">Ab traffic lana start karein!!</div>
                  <p className="sng2-promo-body">Apke naye startup ke liye ek powerful content strategy banao. Blogy se SEO articles, keyword research, aur AI writing tools — sab free mein milenge.</p>
                  <div className="sng2-promo-stats">
                    <div className="sng2-promo-stat"><div className="sng2-promo-stat-num">10×</div><div className="sng2-promo-stat-label">organic traffic</div></div>
                    <div className="sng2-promo-stat"><div className="sng2-promo-stat-num">Free</div><div className="sng2-promo-stat-label">to get started</div></div>
                    <div className="sng2-promo-stat"><div className="sng2-promo-stat-num">AI</div><div className="sng2-promo-stat-label">powered tools</div></div>
                  </div>
                  <Link to="/" className="sng2-promo-cta">
                    Start Growing Traffic
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                  <div className="sng2-promo-tags">
                    <span>SEO</span><span>Content</span><span>AI Tools</span><span>Keywords</span>
                  </div>
                </div>

                <div className="sng2-sidebar-quick">
                  <div className="sng2-sidebar-quick-title">Generate Another Name</div>
                  <button className="sng2-sidebar-scroll-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑ Back to Generator
                  </button>
                </div>

                <div className="sng2-sidebar-browse">
                  <div className="sng2-sidebar-browse-title">Popular Niches</div>
                  <div className="sng2-sidebar-cats">
                    {['AI Startups', 'FinTech', 'EdTech', 'Food Delivery', 'Fashion', 'Health & Wellness', 'SaaS Startups', 'Sustainability'].map(cat => (
                      <Link key={cat} to="/startup-names" className="sng2-sidebar-cat">{cat}</Link>
                    ))}
                  </div>
                  <Link to="/startup-names" className="sng2-sidebar-all">View all 664+ niches →</Link>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
