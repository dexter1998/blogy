import { useState } from 'react';
import { Link } from 'react-router-dom';
import data from '../data/startup-names.json';
import SEOHead from '../components/SEOHead';
import './StartupNamesHub.css';

export default function StartupNamesHub() {
  const { categories } = data;
  const [search, setSearch] = useState('');

  const filtered = categories.filter(c =>
    c.category.toLowerCase().includes(search.toLowerCase())
  );
  const popular = filtered.filter(c => c.featured);
  const more    = filtered.filter(c => !c.featured);

  return (
    <div className="snh-page">
      <SEOHead
        title="Startup Name Ideas — 1000+ Names by Industry | Blogy"
        description={`Browse ${data.total_names}+ curated startup name ideas across ${data.categories.length} industries. Find the perfect name for your business, SaaS, or app.`}
        path="/startup-names"
      />
      <div className="snh-wrap">

        {/* Back link */}
        <Link to="/" className="snh-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          All Resources
        </Link>

        {/* Header */}
        <h1 className="snh-title">Startup Name Ideas</h1>
        <p className="snh-sub">
          Creative startup name suggestions for every industry, organized by style and availability.
        </p>

        {/* Search */}
        <div className="snh-search-wrap">
          <svg className="snh-search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="snh-search"
            placeholder="Filter niches..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="snh-empty">No industries match "{search}"</p>
        ) : (
          <>
            {popular.length > 0 && (
              <NicheSection
                icon="🔥"
                label="POPULAR NICHES"
                count={popular.length}
                items={popular}
              />
            )}
            {more.length > 0 && (
              <NicheSection
                icon="▦"
                label="MORE NICHES"
                count={more.length}
                items={more}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NicheSection({ icon, label, count, items }) {
  return (
    <div className="snh-section">
      <div className="snh-section-head">
        <span className="snh-section-icon">{icon}</span>
        <span className="snh-section-label">{label}</span>
        <span className="snh-section-count">{count} niches</span>
      </div>
      <div className="snh-grid">
        {items.map(cat => (
          <Link key={cat.slug} to={`/startup-names/${cat.slug}`} className="snh-cell">
            {cat.category}
          </Link>
        ))}
      </div>
    </div>
  );
}
