import { useState, useEffect, useCallback, useRef } from 'react';
import './Deck.css';

const SLIDES = [
  { id: 1, type: 'cover' },
  { id: 2, type: 'problem' },
  { id: 3, type: 'insight' },
  { id: 4, type: 'market' },
  { id: 5, type: 'solutions' },
  { id: 6, type: 'solution' },
  { id: 7, type: 'product' },
  { id: 8, type: 'journey' },
  { id: 9, type: 'differentiation' },
  { id: 10, type: 'businessmodel' },
  { id: 11, type: 'gtm' },
  { id: 12, type: 'moat' },
  { id: 13, type: 'traction' },
  { id: 14, type: 'vision' },
  { id: 15, type: 'closing' },
  { id: 16, type: 'team' },
];

function SlideCover() {
  return (
    <div className="slide slide-cover">
      {/* Background elements */}
      <div className="cover-bg-grid" />
      <div className="cover-bg-glow cover-glow-1" />
      <div className="cover-bg-glow cover-glow-2" />

      {/* Top bar */}
      <div className="cover-topbar">
        <div className="cover-topbar-left">
          <img src="/logo.svg" alt="Blogy" className="cover-logo-sm" />
          <span className="cover-topbar-name">Blogy</span>
        </div>
        <span className="cover-tag">INVESTOR DECK · 2026</span>
      </div>

      {/* Hero center */}
      <div className="cover-hero">
        <div className="cover-badge">Autonomous SEO · AI-Powered · Built for Scale</div>
        <div className="cover-logo-lockup">
          <img src="/logo.svg" alt="Blogy" className="cover-logo-big" />
        </div>
        <h1 className="cover-headline">
          Replace Your SEO Team<br />
          <span className="cover-headline-teal">With One Growth Engine</span>
        </h1>
        <p className="cover-subline">
          From idea → keyword → content → rankings → traffic. Fully automated.
        </p>
      </div>

      {/* Infographic: 3 shifts */}
      <div className="cover-infographic">
        <div className="cover-infog-track">
          <div className="cit-node cit-old">
            <div className="cit-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <span>Content Team</span>
            <small>Manual · Fragmented · Expensive</small>
          </div>

          <div className="cit-arrow-group">
            <div className="cit-shift-pill">
              <span className="csp-num">01</span>
              <span>Manual → <strong>Automated</strong></span>
            </div>
            <div className="cit-arrow-line">
              <div className="cal-line" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="cit-shift-pill">
              <span className="csp-num">02</span>
              <span>Fragmented → <strong>Unified</strong></span>
            </div>
            <div className="cit-arrow-line">
              <div className="cal-line" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="cit-shift-pill">
              <span className="csp-num">03</span>
              <span>Unpredictable → <strong>Scalable</strong></span>
            </div>
          </div>

          <div className="cit-node cit-new">
            <div className="cit-icon cit-icon-teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>
            </div>
            <span>Growth Engine</span>
            <small>Automated · Unified · Scalable</small>
          </div>
        </div>
      </div>

      {/* North star footer */}
      <div className="cover-footer">
        <div className="cover-north-star">
          <span className="north-label">NORTH STAR</span>
          <span className="north-sep">·</span>
          <span className="north-text">"Replace the SEO team with a single growth engine."</span>
        </div>
        <div className="cover-stats-row">
          <div className="csr-stat"><span className="csr-num">$70B+</span><span>SEO Market</span></div>
          <div className="csr-div" />
          <div className="csr-stat"><span className="csr-num">90%+</span><span>Pages get zero traffic</span></div>
          <div className="csr-div" />
          <div className="csr-stat"><span className="csr-num">20×</span><span>Cheaper than agencies</span></div>
        </div>
      </div>
    </div>
  );
}

function SlideProblem() {
  return (
    <div className="slide slide-problem">
      <div className="slide-header-row">
        <span className="slide-tag red">CURRENT CHALLENGES</span>
        <span className="slide-num">02</span>
      </div>
      <h2 className="slide-title">Creating Content is Easy.<br /><span className="teal">Getting Traffic is Not.</span></h2>
      <p className="slide-intro">Today, businesses produce more content than ever, yet visibility remains scarce. Despite investing in writers, SEO tools, and agencies, most companies fail to achieve consistent organic growth. The issue lies in the fragmented nature of SEO execution — no single system ensures results. This leads to wasted effort, high costs, and unpredictable outcomes.</p>

      <div className="problem-grid">
        <div className="problem-bottlenecks">
          <h3 className="section-sub">Operational Bottlenecks</h3>
          <div className="bottleneck-list">
            <div className="bottleneck-item">
              <div className="bk-icon red-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div>
                <strong>7M+ Blogs Published Daily</strong>
                <p>AI has made content creation cheap and fast — supply is infinite.</p>
              </div>
            </div>
            <div className="bottleneck-item">
              <div className="bk-icon gray-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
              <div>
                <strong>90%+ Pages Get Zero Traffic</strong>
                <p>Multiple tools required, agencies are expensive, results are inconsistent.</p>
              </div>
            </div>
            <div className="bottleneck-item">
              <div className="bk-icon orange-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div>
                <strong>No Unified Workflow Exists</strong>
                <p>4–5 tools required across AI writers, SEO, CMS, and optimization.</p>
              </div>
            </div>
            <div className="bottleneck-item">
              <div className="bk-icon blue-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
              </div>
              <div>
                <strong>$1K–$10K/month SEO Cost</strong>
                <p>Agencies charge $100–$500 per blog. 4–8 hours per article wasted.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="problem-impact">
          <h3 className="section-sub">Business Impact</h3>
          <div className="impact-card dark-card">
            <div className="impact-row">
              <span className="impact-label">TRAFFIC ROI</span>
              <div className="impact-val red-val">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
              </div>
            </div>
            <p className="impact-metric">Wasted Effort</p>

            <div className="impact-row mt">
              <span className="impact-label">COST STRUCTURE</span>
              <div className="impact-val orange-val">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              </div>
            </div>
            <p className="impact-metric">Rising CAC</p>

            <div className="impact-row mt">
              <span className="impact-label">PREDICTABILITY</span>
              <div className="impact-val red-val">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
              </div>
            </div>
            <p className="impact-metric">Zero Consistency</p>

            <div className="insight-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              Content is abundant. <strong>Traffic is scarce.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideInsight() {
  return (
    <div className="slide slide-insight">
      <div className="slide-header-row">
        <span className="slide-tag purple">STRUCTURAL SHIFT</span>
        <span className="slide-num">03</span>
      </div>
      <h2 className="slide-title">The Bottleneck<br /><span className="teal">Has Shifted</span></h2>
      <p className="slide-intro">The shift in SEO is structural, not incremental. AI removed the barrier to content creation, resulting in an explosion of supply. Search demand has not increased at the same pace, creating intense competition for visibility. Success is no longer determined by writing better content — but by building systems.</p>

      <div className="insight-layout">
        <div className="insight-left">
          <div className="insight-stat-card">
            <div className="isc-header">
              <span className="isc-label">CONTENT vs TRAFFIC</span>
            </div>
            <div className="content-traffic-bars">
              <div className="ct-bar-row">
                <span className="ct-bar-label">Content Supply</span>
                <div className="ct-bar-wrap">
                  <div className="ct-bar ct-bar-content" style={{ width: '92%' }}>
                    <span>10x–50x growth</span>
                  </div>
                </div>
              </div>
              <div className="ct-bar-row">
                <span className="ct-bar-label">Search Traffic</span>
                <div className="ct-bar-wrap">
                  <div className="ct-bar ct-bar-traffic" style={{ width: '28%' }}>
                    <span>~flat</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="isc-note">AI increased content production by <strong>10x–50x</strong>. Traffic stayed flat.</p>
          </div>

          <div className="insight-donut-card">
            <div className="donut-wrap">
              <svg viewBox="0 0 120 120" className="donut-svg">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e4e4e7" strokeWidth="18" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#0d9488" strokeWidth="18"
                  strokeDasharray={`${0.2 * 283} ${283}`} strokeDashoffset="71" strokeLinecap="round" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#f87171" strokeWidth="18"
                  strokeDasharray={`${0.8 * 283} ${283}`} strokeDashoffset={`${71 - 0.2 * 283}`} strokeLinecap="round" />
              </svg>
              <div className="donut-center">
                <span className="donut-pct">80%</span>
                <span className="donut-sub">no traffic</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="dl-row"><span className="dl-dot teal-dot" /> <span>Gets discovered (20%)</span></div>
              <div className="dl-row"><span className="dl-dot red-dot" /> <span>Never found (80%+)</span></div>
            </div>
          </div>
        </div>

        <div className="insight-right">
          <div className="insight-cards">
            <div className="ins-card">
              <span className="ins-num">01</span>
              <div>
                <h4>Creation is commoditised</h4>
                <p>AI writing cost dropped by <strong>90%+</strong>. Anyone can produce content. Nobody can guarantee it ranks.</p>
              </div>
            </div>
            <div className="ins-card">
              <span className="ins-num">02</span>
              <div>
                <h4>Distribution is the moat</h4>
                <p>The winners are platforms that own <strong>distribution systems</strong> — Zapier, Canva, Wise — not better writers.</p>
              </div>
            </div>
            <div className="ins-card highlight-card">
              <span className="ins-num teal">03</span>
              <div>
                <h4>SEO is a systems problem</h4>
                <p>Not a writing problem. The team that builds the <strong>best execution system</strong> wins. That is Blogy.</p>
              </div>
            </div>
          </div>

          <div className="insight-pivot dark-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
            <p><strong>Strategic Pivot:</strong> Creation is no longer the advantage — <span className="teal">distribution is.</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideMarket() {
  return (
    <div className="slide slide-market">
      <div className="slide-header-row">
        <span className="slide-tag green">MARKET OPPORTUNITY</span>
        <span className="slide-num">04</span>
      </div>
      <h2 className="slide-title">A Massive but<br /><span className="teal">Broken Market</span></h2>
      <p className="slide-intro">Search dominates how users discover information, products, and services online. As businesses rely increasingly on organic channels, demand for scalable SEO solutions is growing rapidly. The gap between investment and results represents a massive opportunity for platforms that can automate the full lifecycle of content-driven growth.</p>

      <div className="market-layout">
        <div className="market-stats">
          <div className="mstat-card">
            <span className="mstat-num">$70B<span className="mstat-plus">+</span></span>
            <span className="mstat-label">Global SEO Market</span>
          </div>
          <div className="mstat-card">
            <span className="mstat-num">$600B<span className="mstat-plus">+</span></span>
            <span className="mstat-label">Content Industry</span>
          </div>
          <div className="mstat-card teal-card">
            <span className="mstat-num white">8.5B<span className="mstat-plus">+</span></span>
            <span className="mstat-label white">Daily Google Searches</span>
          </div>
          <div className="mstat-card">
            <span className="mstat-num">90%<span className="mstat-plus">+</span></span>
            <span className="mstat-label">Journeys Start with Search</span>
          </div>
        </div>

        <div className="market-right">
          <div className="market-funnel">
            <h4 className="funnel-title">SEO Success Funnel</h4>
            <div className="funnel-steps">
              <div className="funnel-step" style={{ width: '100%' }}>
                <span>Content Created</span><strong>100%</strong>
              </div>
              <div className="funnel-step" style={{ width: '75%' }}>
                <span>Gets Indexed</span><strong>~60%</strong>
              </div>
              <div className="funnel-step" style={{ width: '50%' }}>
                <span>Ranks Page 1–10</span><strong>~20%</strong>
              </div>
              <div className="funnel-step teal-step" style={{ width: '25%' }}>
                <span>Drives Traffic</span><strong>~10%</strong>
              </div>
            </div>
            <p className="funnel-note">Top 10% capture the majority of all organic traffic</p>
          </div>

          <div className="market-insight dark-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>60%+ of marketers say SEO delivers the <strong>highest ROI</strong> — yet execution remains broken. The opportunity is not more content — it's <span className="teal">better distribution systems.</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideSolutions() {
  return (
    <div className="slide slide-solutions">
      <div className="slide-header-row">
        <span className="slide-tag red">COMPETITIVE LANDSCAPE</span>
        <span className="slide-num">05</span>
      </div>
      <h2 className="slide-title">The Ecosystem is<br /><span className="teal">Fragmented</span></h2>
      <p className="slide-intro">The current SEO ecosystem is built on disconnected tools and workflows. Businesses rely on AI writers for content, SEO tools for insights, and agencies for execution. Even newer platforms fail to address the full growth loop. Teams manage complexity without consistent outcomes.</p>

      <div className="solutions-layout">
        <div className="sol-table">
          <div className="sol-table-head">
            <span>PLATFORM</span>
            <span>MONTHLY TRAFFIC</span>
            <span>CORE CAPABILITY</span>
          </div>
          {[
            { name: 'AI Writers', sub: 'Jasper, Copy.ai', bar: 88, color: '#a1a1aa', label: 'Content only', tag: 'partial' },
            { name: 'SEO Tools', sub: 'Ahrefs, Semrush', bar: 72, color: '#a1a1aa', label: 'Insights only', tag: 'partial' },
            { name: 'Agencies', sub: 'White-label SEO', bar: 55, color: '#a1a1aa', label: 'Expensive execution', tag: 'partial' },
            { name: 'Competitors', sub: 'blogseo.io, outrank.so, arvow.com', bar: 30, color: '#fbbf24', label: 'Partial automation', tag: 'partial' },
            { name: 'Blogy', sub: 'CURRENT', bar: 0, color: '#0d9488', label: 'Full growth loop', tag: 'winner', isBlogy: true },
          ].map((r, i) => (
            <div className={`sol-table-row ${r.isBlogy ? 'blogy-row' : ''}`} key={i}>
              <span className="sol-name">
                <strong>{r.name}</strong>
                <small>{r.sub}</small>
              </span>
              <span className="sol-bar-cell">
                {r.isBlogy ? (
                  <span className="sol-building">Building the full loop →</span>
                ) : (
                  <div className="sol-bar-wrap">
                    <div className="sol-bar" style={{ width: `${r.bar}%`, background: r.color }} />
                  </div>
                )}
              </span>
              <span className={`sol-tag sol-tag-${r.tag}`}>{r.label}</span>
            </div>
          ))}
        </div>

        <div className="sol-right">
          <div className="sol-vuln dark-card">
            <div className="vuln-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h4>Critical Gap</h4>
            <p>Tools win at <strong>individual tasks.</strong> No one owns the <span className="red-text">full growth loop</span> — discovery → creation → publishing → scaling.</p>
          </div>

          <div className="sol-tools">
            <h4 className="section-sub">Stack Required Today</h4>
            <div className="tool-chips">
              {['AI Writer', 'SEO Tool', 'CMS', 'Optimizer', 'Analytics'].map((t, i) => (
                <span className="tool-chip" key={i}>{t}</span>
              ))}
            </div>
            <div className="tool-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span className="teal">Blogy replaces all of this</span>
            </div>
          </div>

          <div className="rev-share dark-card" style={{ marginTop: '10px' }}>
            <span className="rs-label">MARKET SHARE OPPORTUNITY</span>
            <span className="rs-num">~5%<span style={{ fontSize: '0.7em', color: 'var(--gray-400)' }}> pSEO adoption</span></span>
            <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '4px' }}>Used by Zapier, Canva, Wise. High complexity barrier = massive whitespace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideSolution() {
  return (
    <div className="slide slide-solution">
      <div className="slide-header-row">
        <span className="slide-tag green">OUR SOLUTION</span>
        <span className="slide-num">06</span>
      </div>
      <h2 className="slide-title">Blogy: Autonomous<br /><span className="teal">Growth Engine</span></h2>
      <p className="slide-intro">Blogy replaces the fragmented SEO stack with a unified system designed to automate organic growth end-to-end. Instead of focusing on individual tasks, it integrates keyword discovery, content generation, optimization, publishing, and scaling into a single engine.</p>

      <div className="solution-layout">
        <div className="solution-steps">
          {[
            { n: '01', title: 'Keyword Discovery', desc: 'Identifies high-intent, long-tail opportunities competitors miss. 70% of searches are long-tail.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
            { n: '02', title: 'Blog Generation', desc: 'AI-generated, SEO-structured content at scale. Unique page structure per page — no duplication.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
            { n: '03', title: 'SEO Optimization', desc: '70+ automated checks. GSC regex-based content planning. Competitor sitemap extraction.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg> },
            { n: '04', title: 'Auto Publishing', desc: 'Bulk publishing + instant indexing. No manual CMS work. Continuous output.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" /></svg> },
            { n: '05', title: 'Continuous Scaling', desc: 'System improves over time. Data flywheel compounds rankings across all pages.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
          ].map((s, i) => (
            <div className="sol-step" key={i}>
              <div className="sol-step-num">{s.n}</div>
              <div className="sol-step-icon">{s.icon}</div>
              <div className="sol-step-body">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
              {i < 4 && <div className="sol-step-arrow">→</div>}
            </div>
          ))}
        </div>

        <div className="solution-right">
          <div className="solution-built">
            <h4 className="section-sub">Built for AI-era Search</h4>
            <div className="built-chips">
              {['GEO', 'AEO', 'AIO', 'ADO'].map(t => (
                <span className="built-chip" key={t}>{t}</span>
              ))}
            </div>
            <p className="built-note">Optimized for Google SGE, ChatGPT, Perplexity, and future AI discovery platforms.</p>
          </div>

          <div className="solution-outcome dark-card">
            <span className="so-label">STRATEGIC OUTCOME</span>
            <h3 className="so-title">From idea → to traffic → automatically</h3>
            <div className="so-metrics">
              <div><span className="so-up">↑ LTV</span><small>Lifetime Value</small></div>
              <div><span className="so-down">↓ CAC</span><small>Acquisition Cost</small></div>
            </div>
          </div>

          <div className="solution-replace">
            <h4 className="section-sub">Replaces</h4>
            <div className="replace-list">
              {['Content Writers', 'SEO Agencies', 'Keyword Tools', 'CMS Plugins', 'Link Builders'].map((r, i) => (
                <div className="replace-item" key={i}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideProduct() {
  return (
    <div className="slide slide-product">
      <div className="slide-header-row">
        <span className="slide-tag blue">PRODUCT</span>
        <span className="slide-num">07</span>
      </div>
      <h2 className="slide-title">How It Works</h2>
      <p className="slide-intro">The product eliminates operational complexity while maximising output. Users simply connect their website, and Blogy takes over the entire growth process — continuously identifying opportunities, creating optimised content, and publishing at scale. No team required. No manual work.</p>

      <div className="product-layout">
        <div className="product-steps-visual">
          {[
            { step: '1', title: 'Connect Website', desc: 'One-click integration. Blogy reads your domain, niche, and content history.', color: '#e0f2fe' },
            { step: '2', title: 'Finds High-Intent Keywords', desc: 'AI scans search intent, competitor gaps, and long-tail opportunities.', color: '#ccfbf1' },
            { step: '3', title: 'Generates Structured Blogs', desc: 'Each post is uniquely structured for your domain — not templated.', color: '#ccfbf1' },
            { step: '4', title: 'Optimizes for Search + AI', desc: '70+ SEO checks. GEO/AEO/AIO compatible. Zero hallucination content.', color: '#d1fae5' },
            { step: '5', title: 'Publishes Automatically', desc: 'Bulk scheduling. Instant indexing requests. CMS-native delivery.', color: '#d1fae5' },
            { step: '6', title: 'Scales Continuously', desc: 'System learns and compounds. More pages = more data = more rankings.', color: '#ccfbf1' },
          ].map((s, i) => (
            <div className="prod-step-card" key={i}>
              <div className="psc-num">{s.step}</div>
              <div className="psc-body">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
              {i < 5 && <div className="psc-arrow">↓</div>}
            </div>
          ))}
        </div>

        <div className="product-right">
          <div className="prod-mock dark-card">
            <div className="mock-header">
              <div className="mock-dots">
                <span /><span /><span />
              </div>
              <span className="mock-url">dashboard.blogy.in</span>
            </div>
            <div className="mock-body">
              <div className="mock-stat-row">
                <div className="mock-stat">
                  <span className="ms-num teal">600+</span>
                  <span className="ms-label">Pages Live</span>
                </div>
                <div className="mock-stat">
                  <span className="ms-num">↑ 3.2x</span>
                  <span className="ms-label">Traffic Growth</span>
                </div>
              </div>
              <div className="mock-blog-list">
                {['Best SEO tools for startups', 'How to rank without backlinks', 'Programmatic SEO guide 2026'].map((b, i) => (
                  <div className="mock-blog-item" key={i}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>{b}</span>
                    <span className="mbi-pub">Published</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="prod-no-team">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <strong>No team required. No manual work.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideJourney() {
  return (
    <div className="slide slide-journey">
      <div className="slide-header-row">
        <span className="slide-tag purple">USER JOURNEY</span>
        <span className="slide-num">08</span>
      </div>
      <h2 className="slide-title">From Zero →<br /><span className="teal">Compounding Traffic</span></h2>
      <p className="slide-intro">Traditional SEO is slow and uncertain, often taking months to show results. Blogy changes this by leveraging programmatic SEO to rapidly build a large number of targeted pages. By focusing on long-tail keywords, it accelerates indexing and ranking. Over time, this creates a compounding effect where traffic grows consistently.</p>

      <div className="journey-layout">
        <div className="journey-timeline">
          {[
            { day: 'Day 0', title: 'Zero Content', desc: 'Connect your domain. Zero articles live.', icon: '○', active: false },
            { day: 'Day 7', title: '50+ Pages Live', desc: 'Keyword research complete. First batch published and indexed.', icon: '◑', active: false },
            { day: 'Day 30', title: '100s Indexed', desc: 'Long-tail keywords capturing intent. Traffic begins.', icon: '●', active: false },
            { day: 'Day 90', title: 'Traffic Compounding', desc: 'Domain authority growing. Rankings compound. System scales.', icon: '★', active: true },
          ].map((t, i) => (
            <div className={`jt-item ${t.active ? 'jt-active' : ''}`} key={i}>
              <div className="jt-marker">{t.icon}</div>
              <div className="jt-line" />
              <div className="jt-body">
                <span className="jt-day">{t.day}</span>
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="journey-right">
          <div className="journey-graph">
            <h4 className="section-sub">Traffic Growth Curve</h4>
            <svg viewBox="0 0 260 120" className="growth-svg">
              <defs>
                <linearGradient id="grow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M10,110 C50,108 80,100 110,85 C140,70 160,50 200,20 C220,10 240,5 250,3"
                fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10,110 C50,108 80,100 110,85 C140,70 160,50 200,20 C220,10 240,5 250,3 L250,115 L10,115 Z"
                fill="url(#grow-grad)" />
              <text x="10" y="110" fontSize="8" fill="#71717a">D0</text>
              <text x="95" y="80" fontSize="8" fill="#71717a">D30</text>
              <text x="235" y="12" fontSize="8" fill="#0d9488">D90+</text>
            </svg>
          </div>

          <div className="journey-longtail dark-card">
            <div className="lt-stat">
              <span className="lt-num">70%</span>
              <div>
                <strong>Searches are long-tail</strong>
                <p>Hard to scale manually — perfect for programmatic SEO.</p>
              </div>
            </div>
          </div>

          <div className="journey-scale-cards">
            <div className="jsc">
              <span className="jsc-n">pSEO</span>
              <span className="jsc-l">Scale creates growth</span>
            </div>
            <div className="jsc teal-jsc">
              <span className="jsc-n">∞</span>
              <span className="jsc-l">Compounding returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideDifferentiation() {
  return (
    <div className="slide slide-diff">
      <div className="slide-header-row">
        <span className="slide-tag green">WHY BLOGY</span>
        <span className="slide-num">09</span>
      </div>
      <h2 className="slide-title">Not a Tool.<br /><span className="teal">A Full SEO System.</span></h2>
      <p className="slide-intro">Blogy is fundamentally different from existing tools because it treats SEO as a continuous system rather than a one-time activity. It creates, optimises, updates, and scales content over time — integrating data, automation, and execution into a single engine that ensures consistent rankings.</p>

      <div className="diff-layout">
        <div className="diff-features">
          <h3 className="section-sub">Core Differentiation</h3>
          <div className="diff-grid">
            {[
              { title: 'Continuous Optimisation', desc: 'Blogs are updated automatically as rankings change.', icon: '↻' },
              { title: 'Programmatic SEO Engine', desc: 'Scale to thousands of pages without manual effort.', icon: '⚙' },
              { title: 'Built-in Backlink Strategy', desc: 'Internal linking and authority distribution built in.', icon: '🔗' },
              { title: 'GSC Regex Planning', desc: 'Content planned based on real search console data.', icon: '📊' },
              { title: 'Bulk Publishing + Indexing', desc: 'Instant indexing requests after bulk publish.', icon: '⚡' },
              { title: 'Unique Page Structure', desc: 'Every page is structurally unique — no duplicate patterns.', icon: '◈' },
              { title: 'Competitor Sitemap Extraction', desc: 'Find and exploit gaps in competitor strategies.', icon: '🎯' },
              { title: '70+ Automated SEO Checks', desc: 'Quality gate before every publish — zero errors live.', icon: '✓' },
            ].map((f, i) => (
              <div className="diff-card" key={i}>
                <span className="diff-icon">{f.icon}</span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="diff-right">
          <div className="diff-vs">
            <h4 className="section-sub">Blogy vs Others</h4>
            <div className="vs-table">
              <div className="vs-head">
                <span>Feature</span>
                <span>Others</span>
                <span>Blogy</span>
              </div>
              {[
                ['Full growth loop', false, true],
                ['Auto-publish', false, true],
                ['Continuous updates', false, true],
                ['pSEO engine', false, true],
                ['GEO / AEO ready', false, true],
                ['GSC integration', false, true],
              ].map(([feat, other, blogy], i) => (
                <div className="vs-row" key={i}>
                  <span>{feat}</span>
                  <span>{other ? <span className="vs-yes">✓</span> : <span className="vs-no">✗</span>}</span>
                  <span>{blogy ? <span className="vs-yes">✓</span> : <span className="vs-no">✗</span>}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="diff-bottom dark-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <p>Competitors are capturing users at the exact moment of decision-making. <strong>Blogy closes that gap.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideBusinessModel() {
  return (
    <div className="slide slide-biz">
      <div className="slide-header-row">
        <span className="slide-tag green">BUSINESS MODEL</span>
        <span className="slide-num">10</span>
      </div>
      <h2 className="slide-title">SaaS Model Built<br /><span className="teal">for Scale</span></h2>
      <p className="slide-intro">Blogy's business model delivers high ROI to customers while maintaining strong scalability. Unlike traditional SEO services that charge based on effort, Blogy operates as a SaaS platform where pricing is aligned with output. Customers pay for results, not effort — making it accessible to startups and scalable for enterprises.</p>

      <div className="biz-layout">
        <div className="biz-tiers">
          <h3 className="section-sub">Pricing Tiers</h3>
          <div className="tier-cards">
            {[
              { name: 'Starter', tag: '', price: '₹199', period: '/mo', features: ['Up to 10 blogs/month', 'Basic SEO checks', 'Auto publishing', '1 website'], },
              { name: 'Growth', tag: 'POPULAR', price: '₹599', period: '/mo', features: ['Up to 50 blogs/month', '70+ SEO checks', 'GSC integration', '3 websites'], highlight: true },
              { name: 'Scale', tag: '', price: 'Custom', period: '', features: ['Unlimited blogs', 'Full pSEO engine', 'Dedicated support', 'Unlimited sites'], },
            ].map((t, i) => (
              <div className={`tier-card ${t.highlight ? 'tier-highlight' : ''}`} key={i}>
                {t.tag && <span className="tier-tag">{t.tag}</span>}
                <h4>{t.name}</h4>
                <div className="tier-price">
                  <span className="tp-num">{t.price}</span>
                  <span className="tp-per">{t.period}</span>
                </div>
                <ul className="tier-features">
                  {t.features.map((f, j) => (
                    <li key={j}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="biz-right">
          <div className="biz-cost-compare">
            <h4 className="section-sub">Cost Comparison</h4>
            <div className="cost-bars">
              {[
                { label: 'Agency', value: 95, cost: '$1K–$10K/mo', color: '#f87171' },
                { label: 'Freelancer', value: 60, cost: '$500–$2K/mo', color: '#fbbf24' },
                { label: 'Blogy', value: 8, cost: '20x cheaper', color: '#0d9488' },
              ].map((c, i) => (
                <div className="cost-bar-row" key={i}>
                  <span className="cbr-label">{c.label}</span>
                  <div className="cbr-bar-wrap">
                    <div className="cbr-bar" style={{ width: `${c.value}%`, background: c.color }} />
                  </div>
                  <span className="cbr-cost">{c.cost}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="biz-summary dark-card">
            <span className="bs-label">VALUE PROPOSITION</span>
            <p className="bs-text"><strong>20x cheaper</strong> than content teams. Replaces writers, SEO tools, and agencies — with a single engine.</p>
            <div className="bs-pills">
              <span>Recurring Revenue</span>
              <span>High Margin</span>
              <span>Low Churn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideGTM() {
  return (
    <div className="slide slide-gtm">
      <div className="slide-header-row">
        <span className="slide-tag purple">GO-TO-MARKET</span>
        <span className="slide-num">11</span>
      </div>
      <h2 className="slide-title">We Use Blogy<br /><span className="teal">to Grow Blogy</span></h2>
      <p className="slide-intro">Blogy's GTM strategy is built around its core strength — programmatic SEO. Instead of relying on traditional marketing channels, it uses its own product to generate traffic and acquire users. This creates a highly efficient and self-reinforcing acquisition model. Combined with founder-led distribution and partnerships, Blogy achieves strong organic growth without heavy paid spend.</p>

      <div className="gtm-layout">
        <div className="gtm-channels">
          <h3 className="section-sub">Acquisition Channels</h3>
          <div className="gtm-channel-list">
            {[
              { n: '01', title: 'Programmatic SEO (Core)', desc: 'Thousands of landing pages targeting high-intent keywords. Self-funding acquisition.', badge: 'PRIMARY' },
              { n: '02', title: 'Founder-led Growth', desc: 'Direct outreach, thought leadership, and network leverage from Day 1.', badge: 'ACTIVE' },
              { n: '03', title: 'Agency Partnerships', desc: 'White-label and referral model with SEO and content agencies.', badge: 'PIPELINE' },
              { n: '04', title: 'Free Tools', desc: 'Keyword research tools, SEO auditors — driving top-of-funnel traffic.', badge: 'PLANNED' },
            ].map((c, i) => (
              <div className="gtm-channel-card" key={i}>
                <div className="gcc-left">
                  <span className="gcc-num">{c.n}</span>
                </div>
                <div className="gcc-body">
                  <div className="gcc-title-row">
                    <h4>{c.title}</h4>
                    <span className={`gcc-badge badge-${c.badge.toLowerCase()}`}>{c.badge}</span>
                  </div>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gtm-right">
          <div className="gtm-flywheel dark-card">
            <h4 className="section-sub" style={{ color: '#fff' }}>The SEO Flywheel</h4>
            <div className="flywheel-steps">
              {[
                { n: '1', label: 'We rank for SEO keywords' },
                { n: '2', label: 'Users discover Blogy' },
                { n: '3', label: 'They use Blogy to rank' },
                { n: '4', label: 'More data → better results' },
              ].map((f, i) => (
                <div className="fw-step" key={i}>
                  <span className="fw-n">{f.n}</span>
                  <span className="fw-arrow">→</span>
                  <span className="fw-label">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="gtm-why-now">
            <h4 className="section-sub">Why Now</h4>
            <div className="why-now-list">
              <div className="wn-item">
                <span className="wn-dot" />
                <p>Writing cost dropped by <strong>90%+</strong> — content is now a commodity</p>
              </div>
              <div className="wn-item">
                <span className="wn-dot" />
                <p>AI search (SGE, Perplexity) is reshaping discovery — <strong>GEO is urgent</strong></p>
              </div>
              <div className="wn-item">
                <span className="wn-dot" />
                <p>60%+ marketers name SEO as <strong>highest ROI</strong> — demand is exploding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideMoat() {
  return (
    <div className="slide slide-moat">
      <div className="slide-header-row">
        <span className="slide-tag blue">DEFENSIBILITY</span>
        <span className="slide-num">12</span>
      </div>
      <h2 className="slide-title">Compounding Advantage<br /><span className="teal">Over Time</span></h2>
      <p className="slide-intro">Blogy's defensibility comes from its ability to continuously improve and scale. As more content is generated and ranked, the system collects valuable data that enhances future performance. This creates a strong feedback loop that is difficult to replicate. Execution complexity and increasing switching costs make it challenging for competitors to catch up.</p>

      <div className="moat-layout">
        <div className="moat-pillars">
          {[
            { title: 'Data Flywheel', desc: 'Every page published feeds the system with performance data. Rankings improve automatically over time.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" /></svg>, strength: 90 },
            { title: 'Distribution Engine', desc: 'Thousands of pages create a self-reinforcing traffic loop that compounds without additional cost.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>, strength: 82 },
            { title: 'High Switching Cost', desc: 'Content, rankings, and domain authority built on Blogy cannot easily be migrated to another tool.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, strength: 78 },
            { title: 'Execution Complexity', desc: 'pSEO has <5% adoption despite being used by Zapier, Canva, Wise. Replicating the system is non-trivial.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>, strength: 88 },
          ].map((m, i) => (
            <div className="moat-card" key={i}>
              <div className="moat-icon">{m.icon}</div>
              <div className="moat-body">
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <div className="moat-bar-wrap">
                  <div className="moat-bar" style={{ width: `${m.strength}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="moat-right">
          <div className="moat-pseo dark-card">
            <span className="ms-badge">PROGRAMMATIC SEO</span>
            <div className="pseo-stat">
              <span className="pseo-num">&lt;5%</span>
              <span className="pseo-label">Market Adoption</span>
            </div>
            <p>Used by Zapier, Canva, Wise — high complexity barrier = massive whitespace.</p>
            <div className="pseo-companies">
              {['Zapier', 'Canva', 'Wise'].map(c => (
                <span className="pseo-co" key={c}>{c}</span>
              ))}
            </div>
          </div>

          <div className="moat-summary">
            <p className="moat-quote">"The flywheel effect reduces reliance on paid acquisition over time — <span className="teal">compounding advantage is the moat."</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideTraction() {
  return (
    <div className="slide slide-traction">
      <div className="slide-header-row">
        <span className="slide-tag green">TRACTION</span>
        <span className="slide-num">13</span>
      </div>
      <h2 className="slide-title">Execution Proof</h2>
      <p className="slide-intro">Blogy is already being tested in real-world scenarios, with a focus on execution and learning. Early experiments have validated the ability to generate, publish, and manage content at scale. The primary focus has been on understanding indexing behaviour and optimising distribution strategies — proving the system works before scaling.</p>

      <div className="traction-layout">
        <div className="traction-metrics">
          <div className="tm-card teal-tm">
            <span className="tm-num">600<span className="tm-plus">+</span></span>
            <span className="tm-label">Pages Created</span>
            <span className="tm-sub">Across live SEO experiments</span>
          </div>
          <div className="tm-card">
            <span className="tm-num">Live</span>
            <span className="tm-label">SEO Experiments</span>
            <span className="tm-sub">Real-world indexing tests</span>
          </div>
          <div className="tm-card">
            <span className="tm-num">Self</span>
            <span className="tm-label">Powered Growth</span>
            <span className="tm-sub">Blogy running on Blogy</span>
          </div>
        </div>

        <div className="traction-proof">
          <h3 className="section-sub">What We've Validated</h3>
          <div className="proof-list">
            {[
              { title: 'Bulk generation at scale', desc: 'System can produce and structure hundreds of unique pages without manual intervention.' },
              { title: 'Indexing speed', desc: 'Direct GSC integration accelerates page discovery and ranking signal propagation.' },
              { title: 'Content uniqueness', desc: "Every page is structurally unique — passing Google's duplicate content filters." },
              { title: 'Self-referential proof', desc: "Blogy.in's own traffic is driven by its own engine — dogfooding at its best." },
            ].map((p, i) => (
              <div className="proof-item" key={i}>
                <div className="pi-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="traction-right">
          <div className="traction-insight dark-card">
            <span className="ti-label">EXECUTION INSIGHT</span>
            <h3>Traffic driven by our own engine</h3>
            <p>We don't just build the product — we live it. Every ranking Blogy earns is proof of concept for every future customer.</p>
          </div>

          <div className="traction-next">
            <h4 className="section-sub">Next Milestones</h4>
            <div className="tn-list">
              <div className="tn-item"><span className="tn-dot" />First 100 paying customers</div>
              <div className="tn-item"><span className="tn-dot" />10,000+ pages managed</div>
              <div className="tn-item"><span className="tn-dot" />Agency partnership programme launch</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideVision() {
  return (
    <div className="slide slide-vision">
      <div className="slide-header-row">
        <span className="slide-tag purple">FUTURE VISION</span>
        <span className="slide-num">14</span>
      </div>
      <h2 className="slide-title">Blogy = Growth<br /><span className="teal">Infrastructure</span></h2>
      <p className="slide-intro">The future of organic growth lies in automation and scalability. As search evolves to include AI-driven discovery, businesses will need systems that can operate across multiple formats and platforms. Blogy aims to become the infrastructure that powers this shift — expanding beyond text into images and videos.</p>

      <div className="vision-layout">
        <div className="vision-journey">
          <h3 className="section-sub">Student Journey Vision</h3>
          <div className="vj-steps">
            {[
              { label: 'Text', sub: 'Today', active: true, icon: '✏' },
              { label: 'Image', sub: 'Phase 2', active: false, icon: '🖼' },
              { label: 'Video', sub: 'Phase 3', active: false, icon: '▶' },
              { label: 'Full OS', sub: 'Vision', active: false, icon: '∞' },
            ].map((v, i) => (
              <div key={i} className={`vj-step ${v.active ? 'vj-active' : ''}`}>
                <div className="vj-icon">{v.icon}</div>
                <h4>{v.label}</h4>
                <span className="vj-sub">{v.sub}</span>
                {i < 3 && <div className="vj-connector" />}
              </div>
            ))}
          </div>
        </div>

        <div className="vision-layers">
          <h3 className="section-sub">Monetisation Layers</h3>
          <div className="vl-cards">
            {[
              { title: 'SaaS Subscriptions', desc: 'Core recurring revenue from platform access.', tag: 'Recurring' },
              { title: 'Agency White-label', desc: 'B2B licensing for SEO and content agencies.', tag: 'B2B' },
              { title: 'Marketplace', desc: 'Content, templates, and integrations marketplace.', tag: 'Platform' },
              { title: 'Data Intelligence', desc: 'Aggregated SEO insights sold to enterprises.', tag: 'Enterprise' },
            ].map((l, i) => (
              <div className="vl-card" key={i}>
                <span className="vl-tag">{l.tag}</span>
                <h4>{l.title}</h4>
                <p>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="vision-impact dark-card">
          <span className="vi-label">PROJECTED IMPACT</span>
          <div className="vi-num">10<span className="vi-x">×</span></div>
          <span className="vi-metric">LTV Growth</span>
          <p className="vi-note">vs current transactional per-article model — through full lifecycle ownership.</p>
        </div>
      </div>
    </div>
  );
}

function SlideClosing() {
  return (
    <div className="slide slide-closing">
      <div className="closing-bg-grid" />
      <div className="slide-header-row">
        <span className="slide-tag blue">EXECUTIVE SUMMARY</span>
        <span className="slide-num">15</span>
      </div>

      <h2 className="slide-title closing-title">
        From Content Chaos →<br />
        <span className="teal">Predictable Growth</span>
      </h2>

      <p className="slide-intro">The way businesses approach organic growth is undergoing a fundamental transformation. Manual workflows and fragmented tools are no longer sufficient in a world where content is abundant and competition is intense. Blogy represents a shift towards automation, scalability, and predictability.</p>

      <div className="closing-pillars">
        {[
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>, title: 'Category Defining', desc: 'First full-loop autonomous SEO engine.' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, title: 'Defensible Moat', desc: 'Data flywheel + execution complexity.' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>, title: 'Multi-layer Revenue', desc: 'SaaS + agency + marketplace + data.' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>, title: 'India-first, Global-ready', desc: 'Built for Bharat, designed for the world.' },
        ].map((p, i) => (
          <div className="closing-pillar" key={i}>
            <div className="cp-icon">{p.icon}</div>
            <h4>{p.title}</h4>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="closing-transforms">
        {[
          ['From', 'content chaos', 'to', 'predictable growth'],
          ['From', 'teams', 'to', 'systems'],
          ['From', 'effort', 'to', 'automation'],
        ].map(([f, a, t, b], i) => (
          <div className="ct-row" key={i}>
            <span className="ct-from">{f} <em>{a}</em></span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            <span className="ct-to">{t} <strong>{b}</strong></span>
          </div>
        ))}
      </div>

      <div className="closing-north dark-card">
        <span className="cn-label">THE VISION</span>
        <h3>"Building India's default <span className="teal">AI-powered</span> growth engine for businesses."</h3>
        <div className="cn-meta">
          <span>Launch: 2026</span>
          <span className="cn-dot" />
          <img src="/logo.svg" alt="Blogy" style={{ height: '20px', filter: 'brightness(10)' }} />
        </div>
      </div>
    </div>
  );
}

function SlideTeam() {
  return (
    <div className="slide slide-team">
      <div className="slide-header-row">
        <span className="slide-tag blue">THE TEAM</span>
        <span className="slide-num">16</span>
      </div>
      <h2 className="slide-title">The People<br /><span className="teal">Behind the Engine</span></h2>
      <p className="slide-intro">A founder team combining deep product and technical expertise with a shared obsession for building scalable, AI-powered systems that drive real business outcomes.</p>

      <div className="team-layout">
        {[
          {
            name: 'Tarun Kumar',
            role: 'Founder & CEO',
            photo: '/tarun.png',
            initials: 'TK',
            linkedin: 'https://www.linkedin.com/in/tarunmottlia/',
            phone: '7210499455',
            email: 'tarun.kumar@blogy.in',
            points: [
              'Product vision & GTM strategy',
              'Growth, distribution & partnerships',
              'SEO systems & content automation',
            ],
            bio: 'Obsessed with building scalable growth systems. Combines product thinking with deep SEO expertise to drive Blogy\'s go-to-market and category creation.',
          },
          {
            name: 'Yashraj Verma',
            role: 'Founder & CTO',
            photo: '/yashraj.png',
            initials: 'YV',
            linkedin: 'https://www.linkedin.com/in/yashraj-verma-634710154/',
            points: [
              'Full-stack engineering & AI architecture',
              'Programmatic SEO infrastructure',
              'Scalable systems & data pipelines',
            ],
            bio: 'Architect of Blogy\'s core engine. Brings deep technical expertise in AI systems, SEO infrastructure, and large-scale content automation platforms.',
          },
        ].map((m, i) => (
          <div className="team-card" key={i}>
            <div className="tc-photo-wrap">
              <img
                src={m.photo}
                alt={m.name}
                className="tc-photo"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div className="tc-initials" style={{ display: 'none' }}>{m.initials}</div>
            </div>
            <div className="tc-body">
              <div className="tc-header">
                <div>
                  <h3 className="tc-name">{m.name}</h3>
                  <span className="tc-role">{m.role}</span>
                </div>
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="tc-linkedin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg>
                  LinkedIn
                </a>
              </div>
              <p className="tc-bio">{m.bio}</p>
              <ul className="tc-points">
                {m.points.map((p, j) => (
                  <li key={j}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    {p}
                  </li>
                ))}
              </ul>
              {m.email && (
                <div className="tc-contact">
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> {m.email}</span>
                  <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.55 15a19.79 19.79 0 01-3.07-8.67A2 2 0 013.46 4h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 11.09a16 16 0 006 6l.81-.81a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.52z" /></svg> {m.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="team-footer dark-card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
        <p>A lean, execution-focused team that has already proven the system works. Hiring across engineering, growth, and partnerships.</p>
      </div>
    </div>
  );
}

const SLIDE_COMPONENTS = {
  cover: SlideCover,
  problem: SlideProblem,
  insight: SlideInsight,
  market: SlideMarket,
  solutions: SlideSolutions,
  solution: SlideSolution,
  product: SlideProduct,
  journey: SlideJourney,
  differentiation: SlideDifferentiation,
  businessmodel: SlideBusinessModel,
  gtm: SlideGTM,
  moat: SlideMoat,
  traction: SlideTraction,
  vision: SlideVision,
  closing: SlideClosing,
  team: SlideTeam,
};

export default function Deck() {
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const total = SLIDES.length;

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < total) setCurrent(idx);
  }, [total]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  async function handleDownload() {
    setDownloading(true);
    try {
      window.print();
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  }

  const SlideComp = SLIDE_COMPONENTS[SLIDES[current].type];

  return (
    <div className="deck-root">
      {/* Top bar */}
      <div className="deck-topbar">
        <div className="dtb-left">
          <img src="/logo.svg" alt="Blogy" className="dtb-logo" />
          <span className="dtb-title">Investor Deck 2026</span>
        </div>
        <div className="dtb-right">
          <span className="dtb-counter">{current + 1} / {total}</span>
          <button className="dtb-download" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="deck-stage">
        <div className="deck-slide-wrap">
          <div className="deck-aspect">
            <SlideComp />
          </div>
        </div>

        {/* Prev/Next */}
        <button className="deck-nav deck-prev" onClick={() => goTo(current - 1)} disabled={current === 0}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button className="deck-nav deck-next" onClick={() => goTo(current + 1)} disabled={current === total - 1}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Dot nav */}
      <div className="deck-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`deck-dot ${i === current ? 'dot-active' : ''}`}
            onClick={() => goTo(i)}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="deck-strip">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            className={`deck-thumb ${i === current ? 'thumb-active' : ''}`}
            onClick={() => goTo(i)}
          >
            <span className="thumb-num">{i + 1}</span>
            <span className="thumb-label">{s.type.charAt(0).toUpperCase() + s.type.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Print stylesheet hint */}
      <style>{`
        @media print {
          .deck-topbar, .deck-nav, .deck-dots, .deck-strip { display: none !important; }
          .deck-root { background: white; }
          .deck-stage { padding: 0; }
          .deck-slide-wrap { width: 100%; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}
