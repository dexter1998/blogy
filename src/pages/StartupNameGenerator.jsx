import { useState, useMemo } from 'react';
import { ALL_CATEGORIES } from '../data/nameGeneratorData';
import { generate5Names } from '../utils/nameGeneratorEngine';
import './StartupNameGenerator.css';

const STYLES = [
  { num: 1, icon: '⚡', name: 'Coined', desc: 'Invented brand words, VC-backable' },
  { num: 2, icon: '🎯', name: 'Playful', desc: 'Fun, punchy consumer vibes' },
  { num: 3, icon: '🔮', name: 'Abstract', desc: 'Pure fusion coinages' },
  { num: 4, icon: '🔍', name: 'SEO India', desc: 'Keyword-rich, local discoverability' },
  { num: 5, icon: '👤', name: 'Founder', desc: 'Personal brand + domain suffix' },
];

function NameCard({ result, index }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result.name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="sng-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="sng-card-header">
        <span className="sng-card-num">#{index + 1}</span>
        <span className="sng-card-name">{result.name}</span>
        <button className="sng-card-copy" onClick={copy} title="Copy name">
          {copied
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          }
        </button>
      </div>
      <div className="sng-card-tagline">{result.tagline}</div>
      <button className={`sng-why-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        Why this name?
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && <div className="sng-why-text">{result.why}</div>}
    </div>
  );
}

export default function StartupNameGenerator() {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(1);
  const [seed, setSeed] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_CATEGORIES;
    return ALL_CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }, [query]);

  const catIdx = useMemo(
    () => ALL_CATEGORIES.indexOf(selectedCat),
    [selectedCat]
  );

  const results = useMemo(() => {
    if (!selectedCat) return null;
    return generate5Names(selectedCat, catIdx < 0 ? 0 : catIdx, selectedStyle, seed);
  }, [selectedCat, catIdx, selectedStyle, seed]);

  function regenerate() {
    setSeed(s => s + 1);
  }

  return (
    <div className="sng-page">
      <div className="container">
        <div className="sng-header">
          <span className="section-label">Free Tool</span>
          <h1>Startup <em>Name Generator</em></h1>
          <p>Pick your niche and naming style. Get 5 brand-ready names with taglines and positioning rationale — instantly.</p>
        </div>

        <div className="sng-body">
          {/* Left Panel */}
          <aside className="sng-panel">
            <div className="sng-panel-title">1 · Select your niche</div>
            <div className="sng-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                className="sng-search"
                type="text"
                placeholder="Search 664 categories…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="sng-cat-list">
              {filtered.length === 0
                ? <div className="sng-no-results">No categories found</div>
                : filtered.map(cat => (
                  <button
                    key={cat}
                    className={`sng-cat-item ${selectedCat === cat ? 'active' : ''}`}
                    onClick={() => { setSelectedCat(cat); setSeed(0); }}
                  >
                    {cat}
                  </button>
                ))
              }
            </div>

            <div className="sng-panel-title">2 · Choose naming style</div>
            <div className="sng-styles">
              {STYLES.map(s => (
                <button
                  key={s.num}
                  className={`sng-style-btn ${selectedStyle === s.num ? 'active' : ''}`}
                  onClick={() => { setSelectedStyle(s.num); setSeed(0); }}
                >
                  <span className="sng-style-icon">{s.icon}</span>
                  <span className="sng-style-meta">
                    <span className="sng-style-name">{s.name}</span>
                    <span className="sng-style-desc">{s.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            <button className="sng-regen-btn" onClick={regenerate} disabled={!selectedCat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Regenerate Names
            </button>
          </aside>

          {/* Right Panel */}
          <div>
            {results ? (
              <>
                <div className="sng-cards-header">
                  <span className="sng-selection-chip">
                    {selectedCat} · {STYLES.find(s => s.num === selectedStyle)?.name}
                  </span>
                  <span className="sng-seed-label">batch #{seed + 1}</span>
                </div>
                <div className="sng-cards">
                  {results.map((r, i) => (
                    <NameCard key={`${seed}-${i}`} result={r} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="sng-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-5 0V4.5A2.5 2.5 0 019.5 2z"/><path d="M14.5 8A2.5 2.5 0 0117 10.5v9a2.5 2.5 0 01-5 0v-9A2.5 2.5 0 0114.5 8z"/></svg>
                <h3>Select a niche to start</h3>
                <p>Choose from 664 categories on the left, then pick a naming style to generate brand names.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
