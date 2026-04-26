import './InvestorLanding.css';

function HeroSection() {
  return (
    <section className="il-hero">
      <div className="il-hero-grid" aria-hidden="true" />
      <div className="il-hero-glow" aria-hidden="true" />
      <div className="container il-hero-container">
        <div className="il-hero-badge">
          <svg width="12" height="12" viewBox="0 0 22 22" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1699 0.58575C14.9429-0.19525 13.7499-0.19525 13.5229 0.58575L13.2029 1.69275C12.5109 4.07875 11.5669 5.94175 8.99994 6.58375L7.80794 6.88175C7.43 6.96 7.18 7.28 7.18 7.64675C7.18 8.01 7.43 8.33 7.80794 8.41175L8.99994 8.70975C11.5669 9.35275 12.5109 11.2157 13.2029 13.6007L13.5229 14.7078C13.7499 15.4897 14.9429 15.4897 15.1699 14.7078L15.4899 13.6007C16.1819 11.2157 17.1269 9.35275 19.6939 8.71075L20.8839 8.41175C21.2619 8.32675 21.5117 8.01 21.5117 7.64675C21.5117 7.28 21.2619 6.96 20.8839 6.88175L19.6939 6.58375C17.1269 5.94175 16.1819 4.07875 15.4899 1.69375L15.1699 0.58575Z" fill="var(--teal-500)"/>
          </svg>
          Investor Deck · 2026
        </div>
        <h1 className="il-hero-headline">
          AI That Replaces Your<br />
          <span className="il-text-gradient">Entire SEO Team</span>
        </h1>
        <p className="il-hero-sub">
          GPT-4o, Claude &amp; Gemini execute every step — SERP analysis, keyword research, content generation, SEO optimization, and publishing. From idea → traffic, fully automated.
        </p>

        {/* AI Layer strip */}
        <div className="il-hero-ai-layer">
          <span className="il-hero-ai-label">AI Engine</span>
          {[
            { step: 'SERP Analysis', model: 'GPT-4o' },
            { step: 'Keyword Research', model: 'Claude 3.5' },
            { step: 'Blog Generation', model: 'GPT-4o' },
            { step: 'SEO Optimization', model: 'Gemini 1.5' },
            { step: 'Image Generation', model: 'DALL-E 3' },
            { step: 'Auto Publish', model: 'Blogy Engine' },
          ].map((item, i) => (
            <div className="il-hero-ai-step" key={i}>
              <span className="il-hero-ai-step-label">{item.step}</span>
              <span className="il-hero-ai-model">{item.model}</span>
              {i < 5 && <svg className="il-hero-ai-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>}
            </div>
          ))}
        </div>

        <div className="il-hero-stats">
          <div className="il-hstat"><span className="il-hstat-n">$70B+</span><span>SEO Market</span></div>
          <div className="il-hstat-div" />
          <div className="il-hstat"><span className="il-hstat-n">9+ AI</span><span>Tasks per blog</span></div>
          <div className="il-hstat-div" />
          <div className="il-hstat"><span className="il-hstat-n">20×</span><span>Cheaper than agencies</span></div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-red">Current Challenges</span>
          <h2 className="section-title">Creating Content is Easy.<br /><em>Getting Traffic is Not.</em></h2>
          <p className="section-sub">Despite investing in writers, SEO tools, and agencies, most companies fail to achieve consistent organic growth. The issue lies in the fragmented nature of SEO execution — no single system ensures results.</p>
        </div>

        <div className="il-problem-grid">
          <div className="il-bottlenecks">
            <h3 className="il-sub-heading">Operational Bottlenecks</h3>
            <div className="il-bottleneck-list">
              {[
                { color: 'red', title: '7M+ Blogs Published Daily', desc: 'AI has made content creation cheap and fast — supply is infinite.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
                { color: 'gray', title: '90%+ Pages Get Zero Traffic', desc: 'Multiple tools required, agencies are expensive, results are inconsistent.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg> },
                { color: 'orange', title: 'No Unified Workflow Exists', desc: '4–5 tools required across AI writers, SEO, CMS, and optimization.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { color: 'blue', title: '$1K–$10K/month SEO Cost', desc: 'Agencies charge $100–$500 per blog. 4–8 hours per article wasted.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
              ].map((b, i) => (
                <div className="il-bottleneck-item" key={i}>
                  <div className={`il-bk-icon il-bk-${b.color}`}>{b.icon}</div>
                  <div>
                    <strong>{b.title}</strong>
                    <p>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="il-impact-col">
            <h3 className="il-sub-heading">Business Impact</h3>
            <div className="il-impact-card">
              {[
                { label: 'TRAFFIC ROI', metric: 'Wasted Effort', type: 'down' },
                { label: 'COST STRUCTURE', metric: 'Rising CAC', type: 'up' },
                { label: 'PREDICTABILITY', metric: 'Zero Consistency', type: 'flat' },
              ].map((row, i) => (
                <div className="il-impact-row" key={i}>
                  <span className="il-impact-label">{row.label}</span>
                  <span className="il-impact-metric">{row.metric}</span>
                  <span className={`il-impact-badge il-badge-${row.type}`}>
                    {row.type === 'down' ? '↓' : row.type === 'up' ? '↑' : '—'}
                  </span>
                </div>
              ))}
              <div className="il-insight-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                Content is abundant. <strong>Traffic is scarce.</strong>
              </div>
              <div className="il-impact-cost-block">
                <span className="il-impact-cost-title">What this costs a typical startup</span>
                <div className="il-impact-cost-rows">
                  {[
                    { item: 'Content writers (2×)', cost: '$2,400/mo' },
                    { item: 'SEO agency retainer', cost: '$3,000/mo' },
                    { item: 'Tools (Ahrefs, Jasper…)', cost: '$600/mo' },
                    { item: 'Avg. articles published', cost: '8–12/mo' },
                  ].map((r, i) => (
                    <div className="il-impact-cost-row" key={i}>
                      <span>{r.item}</span>
                      <span className="il-impact-cost-val">{r.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="il-impact-cost-total">
                  <span>Total monthly burn</span>
                  <span className="il-impact-cost-total-val">~$6,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketShiftSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-purple">Structural Shift</span>
          <h2 className="section-title">The Bottleneck <em>Has Shifted</em></h2>
          <p className="section-sub">AI removed the barrier to content creation, resulting in an explosion of supply. Success is no longer determined by writing better content — but by building systems.</p>
        </div>

        <div className="il-shift-layout">
          <div className="il-shift-left">
            <div className="il-stat-card">
              <div className="il-sc-header">Content vs Traffic</div>
              <div className="il-bar-rows">
                <div className="il-bar-row">
                  <span>Content Supply</span>
                  <div className="il-bar-wrap"><div className="il-bar il-bar-content" style={{ width: '92%' }}><span>10x–50x growth</span></div></div>
                </div>
                <div className="il-bar-row">
                  <span>Search Traffic</span>
                  <div className="il-bar-wrap"><div className="il-bar il-bar-traffic" style={{ width: '28%' }}><span>~flat</span></div></div>
                </div>
              </div>
              <p className="il-sc-note">AI increased content production by <strong>10x–50x</strong>. Traffic stayed flat.</p>
            </div>

            <div className="il-donut-card">
              <div className="il-donut-wrap">
                <svg viewBox="0 0 120 120" className="il-donut-svg">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#e4e4e7" strokeWidth="18"/>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#0d9488" strokeWidth="18" strokeDasharray={`${0.2 * 283} ${283}`} strokeDashoffset="71" strokeLinecap="round"/>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#f87171" strokeWidth="18" strokeDasharray={`${0.8 * 283} ${283}`} strokeDashoffset={`${71 - 0.2 * 283}`} strokeLinecap="round"/>
                </svg>
                <div className="il-donut-center">
                  <span className="il-donut-pct">80%</span>
                  <span>no traffic</span>
                </div>
              </div>
              <div className="il-donut-legend">
                <div><span className="il-dl-dot il-dot-teal"/> Gets discovered (20%)</div>
                <div><span className="il-dl-dot il-dot-red"/> Never found (80%+)</div>
              </div>
            </div>
          </div>

          <div className="il-shift-cards">
            {[
              { n: '01', title: 'Creation is commoditised', desc: 'AI writing cost dropped by 90%+. Anyone can produce content. Nobody can guarantee it ranks.' },
              { n: '02', title: 'Distribution is the moat', desc: 'The winners are platforms that own distribution systems — Zapier, Canva, Wise — not better writers.' },
              { n: '03', title: 'SEO is a systems problem', desc: 'Not a writing problem. The team that builds the best execution system wins. That is Blogy.', highlight: true },
            ].map((c, i) => (
              <div className={`il-ins-card ${c.highlight ? 'il-ins-highlight' : ''}`} key={i}>
                <span className="il-ins-n">{c.n}</span>
                <div>
                  <h4>{c.title}</h4>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
            <div className="il-pivot-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <p><strong>Strategic Pivot:</strong> Creation is no longer the advantage — <span className="il-teal">distribution is.</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketOpportunitySection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Market Opportunity</span>
          <h2 className="section-title">A Massive but <em>Broken Market</em></h2>
          <p className="section-sub">Search dominates how users discover information online. The gap between investment and results represents a massive opportunity for platforms that can automate the full lifecycle of content-driven growth.</p>
        </div>

        <div className="il-market-stats">
          {[
            { num: '$70B+', label: 'Global SEO Market' },
            { num: '$600B+', label: 'Content Industry' },
            { num: '8.5B+', label: 'Daily Google Searches', accent: true },
            { num: '90%+', label: 'Journeys Start with Search' },
          ].map((s, i) => (
            <div className={`il-mstat ${s.accent ? 'il-mstat-accent' : ''}`} key={i}>
              <span className="il-mstat-n">{s.num}</span>
              <span className="il-mstat-l">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="il-market-bottom">
          <div className="il-funnel-card">
            <h4 className="il-sub-heading">SEO Success Funnel</h4>
            {[
              { label: 'Content Created', pct: '100%', width: '100%' },
              { label: 'Gets Indexed', pct: '~60%', width: '75%' },
              { label: 'Ranks Page 1–10', pct: '~20%', width: '50%' },
              { label: 'Drives Traffic', pct: '~10%', width: '25%', accent: true },
            ].map((f, i) => (
              <div className={`il-funnel-step ${f.accent ? 'il-funnel-accent' : ''}`} key={i} style={{ width: f.width }}>
                <span>{f.label}</span><strong>{f.pct}</strong>
              </div>
            ))}
            <p className="il-funnel-note">Top 10% capture the majority of all organic traffic</p>
          </div>

          <div className="il-market-right-col">
            <div className="il-market-insight">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>60%+ of marketers say SEO delivers the <strong>highest ROI</strong> — yet execution remains broken. The opportunity is not more content — it's <span className="il-teal">better distribution systems.</span></p>
            </div>
            <div className="il-market-signals">
              <h4 className="il-sub-heading">Why the gap persists</h4>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, text: 'Content creation is now a commodity — AI writes at zero marginal cost' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>, text: 'No single tool covers the full keyword → publish → rank workflow' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text: 'Manual SEO execution takes 4–8 hours per article, unscalable for SMBs' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>, text: 'AI search (SGE, Perplexity) creates new discovery channels with zero adoption tools' },
              ].map((s, i) => (
                <div className="il-market-signal-item" key={i}>
                  <span className="il-msi-icon">{s.icon}</span>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompetitiveSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-red">Competitive Landscape</span>
          <h2 className="section-title">The Ecosystem is <em>Fragmented</em></h2>
          <p className="section-sub">Businesses rely on AI writers for content, SEO tools for insights, and agencies for execution. Even newer platforms fail to address the full growth loop. Teams manage complexity without consistent outcomes.</p>
        </div>

        <div className="il-comp-layout">
          <div className="il-comp-table-wrap">
            <div className="il-comp-head">
              <span>Platform</span>
              <span>Core Capability</span>
              <span>Status</span>
            </div>
            {[
              { name: 'AI Writers', sub: 'Jasper, Copy.ai', label: 'Content only', tag: 'partial' },
              { name: 'SEO Tools', sub: 'Ahrefs, Semrush', label: 'Insights only', tag: 'partial' },
              { name: 'Agencies', sub: 'White-label SEO', label: 'Expensive execution', tag: 'partial' },
              { name: 'Competitors', sub: 'blogseo.io, outrank.so, arvow.com', label: 'Partial automation', tag: 'partial' },
              { name: 'Blogy', sub: '', label: 'Full growth loop', tag: 'winner', isBlogy: true },
            ].map((r, i) => (
              <div className={`il-comp-row ${r.isBlogy ? 'il-comp-blogy' : ''}`} key={i}>
                <span className="il-comp-name"><strong>{r.name}</strong>{r.sub && <small>{r.sub}</small>}</span>
                <span className="il-comp-label">{r.isBlogy ? 'Building the full loop →' : r.label}</span>
                <span className={`il-comp-tag il-comp-tag-${r.tag}`}>{r.tag === 'winner' ? '★ Winner' : 'Partial'}</span>
              </div>
            ))}
          </div>

          <div className="il-comp-right">
            <div className="il-gap-card">
              <div className="il-gap-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h4>Critical Gap</h4>
              <p>Tools win at <strong>individual tasks.</strong> No one owns the full growth loop — discovery → creation → publishing → scaling.</p>
            </div>

            <div className="il-stack-card">
              <h4 className="il-sub-heading">Stack Required Today</h4>
              <div className="il-tool-chips">
                {['AI Writer', 'SEO Tool', 'CMS', 'Optimizer', 'Analytics'].map(t => (
                  <span className="il-tool-chip" key={t}>{t}</span>
                ))}
              </div>
              <div className="il-tool-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <span className="il-teal">Blogy replaces all of this</span>
              </div>
            </div>

            <div className="il-dark-card">
              <span className="il-dark-label">Market Share Opportunity</span>
              <span className="il-dark-num">~5%</span>
              <p>pSEO adoption — used by Zapier, Canva, Wise. High complexity barrier = massive whitespace.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Solution</span>
          <h2 className="section-title">Blogy: Autonomous <em>Growth Engine</em></h2>
          <p className="section-sub">Blogy replaces the fragmented SEO stack with a unified system designed to automate organic growth end-to-end. Keyword discovery, content generation, optimization, publishing, and scaling — in a single engine.</p>
        </div>

        <div className="il-solution-steps">
          {[
            { n: '01', title: 'Keyword Discovery', desc: 'Identifies high-intent, long-tail opportunities competitors miss. 70% of searches are long-tail.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
            { n: '02', title: 'Blog Generation', desc: 'AI-generated, SEO-structured content at scale. Unique page structure per page — no duplication.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
            { n: '03', title: 'SEO Optimization', desc: '70+ automated checks. GSC regex-based content planning. Competitor sitemap extraction.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
            { n: '04', title: 'Auto Publishing', desc: 'Bulk publishing + instant indexing. No manual CMS work. Continuous output.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg> },
            { n: '05', title: 'Continuous Scaling', desc: 'System improves over time. Data flywheel compounds rankings across all pages.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
          ].map((s, i) => (
            <div className="il-sol-step" key={i}>
              <div className="il-sol-num">{s.n}</div>
              <div className="il-sol-icon">{s.icon}</div>
              <div className="il-sol-body">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
              {i < 4 && <div className="il-sol-arrow">→</div>}
            </div>
          ))}
        </div>

        <div className="il-solution-bottom">
          <div className="il-built-card">
            <h4 className="il-sub-heading">Built for AI-era Search</h4>
            <div className="il-built-chips">
              {['GEO', 'AEO', 'AIO', 'ADO'].map(t => <span className="il-built-chip" key={t}>{t}</span>)}
            </div>
            <p>Optimized for Google SGE, ChatGPT, Perplexity, and future AI discovery platforms.</p>
          </div>
          <div className="il-outcome-card">
            <span className="il-dark-label">Strategic Outcome</span>
            <h3>From idea → to traffic → automatically</h3>
            <div className="il-so-metrics">
              <div><span className="il-so-up">↑ LTV</span><small>Lifetime Value</small></div>
              <div><span className="il-so-down">↓ CAC</span><small>Acquisition Cost</small></div>
            </div>
          </div>
          <div className="il-replaces-card">
            <h4 className="il-sub-heading">Replaces</h4>
            <div className="il-replace-list">
              {['Content Writers', 'SEO Agencies', 'Keyword Tools', 'CMS Plugins', 'Link Builders'].map(r => (
                <div className="il-replace-item" key={r}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIEngineSection() {
  const tasks = [
    {
      model: 'GPT-4o / Claude 3.5',
      label: 'Research & Analysis',
      color: 'blue',
      items: [
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, task: 'SERP gap analysis', desc: 'Scans top 20 results, extracts ranking patterns and missing angles' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, task: 'Competitor content analysis', desc: 'Extracts competitor sitemaps, clusters topics, identifies coverage gaps' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>, task: 'GSC & GA4 analysis', desc: 'Reads Search Console data, identifies click-through opportunities and decay signals' },
      ],
    },
    {
      model: 'Claude 3.5 / Gemini 1.5',
      label: 'Content Strategy',
      color: 'purple',
      items: [
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, task: 'Trending keyword generation', desc: 'Cross-references search volume, competition, and intent to surface high-ROI keywords' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, task: 'Content title & structure', desc: 'Generates SERP-optimized titles, H-tag hierarchy, and section outlines per keyword' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>, task: 'GEO / AEO optimization', desc: 'Structures content for AI answers, featured snippets, and conversational queries' },
      ],
    },
    {
      model: 'GPT-4o + Custom LLM',
      label: 'Generation & Publishing',
      color: 'teal',
      items: [
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, task: 'Full blog generation', desc: '1,500–3,000 word SEO blogs with citations, schema, and semantic structure' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, task: 'Content → HTML design conversion', desc: 'AI converts markdown output to CMS-ready HTML with custom layouts and components' },
        { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, task: 'In-blog image generation', desc: 'DALL-E / Stable Diffusion generates contextual images, diagrams, and OG images per post' },
      ],
    },
  ];

  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-purple">AI Under the Hood</span>
          <h2 className="section-title">Every Step Powered <em>by AI Models</em></h2>
          <p className="section-sub">Blogy isn't a wrapper around a single LLM. It orchestrates multiple specialized AI models across every stage of the growth pipeline — each chosen for the specific task it performs best.</p>
        </div>

        <div className="il-ai-grid">
          {tasks.map((group, gi) => (
            <div className={`il-ai-group il-ai-${group.color}`} key={gi}>
              <div className="il-ai-group-header">
                <span className="il-ai-model-tag">{group.model}</span>
                <h4 className="il-ai-group-label">{group.label}</h4>
              </div>
              <div className="il-ai-tasks">
                {group.items.map((item, ii) => (
                  <div className="il-ai-task" key={ii}>
                    <div className="il-ai-task-icon">{item.icon}</div>
                    <div className="il-ai-task-body">
                      <strong>{item.task}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="il-ai-footer">
          <div className="il-ai-stat">
            <span className="il-ai-stat-n">9+</span>
            <span>AI tasks per blog post</span>
          </div>
          <div className="il-ai-stat-div" />
          <div className="il-ai-stat">
            <span className="il-ai-stat-n">3</span>
            <span>Specialized model families</span>
          </div>
          <div className="il-ai-stat-div" />
          <div className="il-ai-stat">
            <span className="il-ai-stat-n">&lt;4 min</span>
            <span>Full pipeline execution</span>
          </div>
          <div className="il-ai-stat-div" />
          <div className="il-ai-stat">
            <span className="il-ai-stat-n">Zero</span>
            <span>Human intervention needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-blue">Product</span>
          <h2 className="section-title"><em>How It Works</em></h2>
          <p className="section-sub">Users simply connect their website, and Blogy takes over the entire growth process — continuously identifying opportunities, creating optimised content, and publishing at scale. No team required. No manual work.</p>
        </div>

        <div className="il-how-layout">
          <div className="il-how-steps">
            {[
              { step: '1', title: 'Connect Website', desc: 'One-click integration. Blogy reads your domain, niche, and content history.' },
              { step: '2', title: 'Finds High-Intent Keywords', desc: 'AI scans search intent, competitor gaps, and long-tail opportunities.' },
              { step: '3', title: 'Generates Structured Blogs', desc: 'Each post is uniquely structured for your domain — not templated.' },
              { step: '4', title: 'Optimizes for Search + AI', desc: '70+ SEO checks. GEO/AEO/AIO compatible. Zero hallucination content.' },
              { step: '5', title: 'Publishes Automatically', desc: 'Bulk scheduling. Instant indexing requests. CMS-native delivery.' },
              { step: '6', title: 'Scales Continuously', desc: 'System learns and compounds. More pages = more data = more rankings.' },
            ].map((s, i) => (
              <div className="il-how-step" key={i}>
                <div className="il-how-num">{s.step}</div>
                <div className="il-how-body">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="il-how-right">
            <div className="il-dashboard-mock">
              <div className="il-mock-header">
                <div className="il-mock-dots"><span/><span/><span/></div>
                <span className="il-mock-url">dashboard.blogy.in</span>
              </div>
              <div className="il-mock-body">
                <div className="il-mock-stats">
                  <div className="il-mock-stat"><span className="il-ms-n il-ms-teal">600+</span><span>Pages Live</span></div>
                  <div className="il-mock-stat"><span className="il-ms-n">↑ 3.2x</span><span>Traffic Growth</span></div>
                  <div className="il-mock-stat"><span className="il-ms-n">94</span><span>SEO Score</span></div>
                </div>
                <div className="il-mock-divider" />
                <div className="il-mock-section-label">Recent publishes</div>
                <div className="il-mock-list">
                  {[
                    'Best SEO tools for startups 2026',
                    'How to rank without backlinks',
                    'Programmatic SEO guide 2026',
                    'AI content marketing strategy',
                    'Long-tail keyword research tips',
                  ].map(b => (
                    <div className="il-mock-item" key={b}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{b}</span>
                      <span className="il-pub">Published</span>
                    </div>
                  ))}
                </div>
                <div className="il-mock-status">
                  <span className="il-mock-status-dot" />
                  Auto-publishing next batch in 00:03:47
                </div>
              </div>
            </div>
            <div className="il-no-team">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <strong>No team required. No manual work.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UserJourneySection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-purple">User Journey</span>
          <h2 className="section-title">From Zero → <em>Compounding Traffic</em></h2>
          <p className="section-sub">Blogy changes the slow, uncertain SEO process by leveraging programmatic SEO to rapidly build a large number of targeted pages. Over time, this creates a compounding effect where traffic grows consistently.</p>
        </div>

        <div className="il-journey-layout">
          <div className="il-timeline">
            {[
              { day: 'Day 0', title: 'Zero Content', desc: 'Connect your domain. Zero articles live.' },
              { day: 'Day 7', title: '50+ Pages Live', desc: 'Keyword research complete. First batch published and indexed.' },
              { day: 'Day 30', title: '100s Indexed', desc: 'Long-tail keywords capturing intent. Traffic begins.' },
              { day: 'Day 90', title: 'Traffic Compounding', desc: 'Domain authority growing. Rankings compound. System scales.', active: true },
            ].map((t, i) => (
              <div className={`il-tl-item ${t.active ? 'il-tl-active' : ''}`} key={i}>
                <div className="il-tl-marker" />
                {i < 3 && <div className="il-tl-line" />}
                <div className="il-tl-body">
                  <span className="il-tl-day">{t.day}</span>
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="il-journey-right">
            <div className="il-growth-chart">
              <h4 className="il-sub-heading">Traffic Growth Curve</h4>
              {/* Bar chart: Y-axis 0–100, X-axis D0/D7/D30/D60/D90 */}
              <svg viewBox="0 0 260 160" className="il-growth-svg">
                {/* Y-axis gridlines + labels */}
                {[0, 25, 50, 75, 100].map((v, i) => {
                  const y = 130 - (v / 100) * 110;
                  return (
                    <g key={i}>
                      <line x1="36" y1={y} x2="252" y2={y} stroke="#e4e7eb" strokeWidth="1" strokeDasharray={v === 0 ? '0' : '3,3'}/>
                      <text x="30" y={y + 3.5} fontSize="8" fill="#9ca3af" textAnchor="end">{v}</text>
                    </g>
                  );
                })}
                {/* Y-axis line */}
                <line x1="36" y1="20" x2="36" y2="130" stroke="#d1d5db" strokeWidth="1.5"/>
                {/* X-axis line */}
                <line x1="36" y1="130" x2="252" y2="130" stroke="#d1d5db" strokeWidth="1.5"/>

                {/* Bars: D0=2%, D7=12%, D30=32%, D60=62%, D90=92% */}
                {[
                  { label: 'D0',  pct: 2,  x: 52  },
                  { label: 'D7',  pct: 12, x: 88  },
                  { label: 'D30', pct: 32, x: 124 },
                  { label: 'D60', pct: 62, x: 160 },
                  { label: 'D90', pct: 92, x: 196 },
                ].map((b, i) => {
                  const barH = (b.pct / 100) * 110;
                  const barY = 130 - barH;
                  const isLast = i === 4;
                  return (
                    <g key={i}>
                      <rect
                        x={b.x - 14} y={barY}
                        width="28" height={barH}
                        rx="4"
                        fill={isLast ? '#0d9488' : '#ccfbf1'}
                        stroke={isLast ? '#0d9488' : '#99f6e4'}
                        strokeWidth="1"
                      />
                      {isLast && (
                        <text x={b.x} y={barY - 5} fontSize="8" fill="#0d9488" textAnchor="middle" fontWeight="700">{b.pct}%</text>
                      )}
                      <text x={b.x} y="144" fontSize="8" fill={isLast ? '#0d9488' : '#9ca3af'} textAnchor="middle" fontWeight={isLast ? '700' : '400'}>{b.label}</text>
                    </g>
                  );
                })}
                {/* Y-axis title */}
                <text x="8" y="80" fontSize="7.5" fill="#9ca3af" textAnchor="middle" transform="rotate(-90,8,80)">Traffic</text>
              </svg>
            </div>

            <div className="il-dark-card">
              <div className="il-longtail-stat">
                <span className="il-lt-num">70%</span>
                <div>
                  <strong>Searches are long-tail</strong>
                  <p>Hard to scale manually — perfect for programmatic SEO.</p>
                </div>
              </div>
            </div>

            <div className="il-scale-cards">
              <div className="il-sc-card"><span className="il-sc-n">pSEO</span><span>Scale creates growth</span></div>
              <div className="il-sc-card il-sc-teal"><span className="il-sc-n">∞</span><span>Compounding returns</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DifferentiationSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Why Blogy</span>
          <h2 className="section-title">Not a Tool. <em>A Full SEO System.</em></h2>
          <p className="section-sub">Blogy treats SEO as a continuous system rather than a one-time activity. It creates, optimises, updates, and scales content over time — ensuring consistent rankings.</p>
        </div>

        <div className="il-diff-layout">
          <div className="il-diff-grid">
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
              <div className="il-diff-card" key={i}>
                <span className="il-diff-icon">{f.icon}</span>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="il-diff-right">
            <div className="il-vs-table">
              <h4 className="il-sub-heading">Blogy vs Others</h4>
              <div className="il-vs-head">
                <span>Feature</span>
                <span>Others</span>
                <span>Blogy</span>
              </div>
              {[
                'Full growth loop', 'Auto-publish', 'Continuous updates', 'pSEO engine', 'GEO / AEO ready', 'GSC integration',
              ].map((feat, i) => (
                <div className="il-vs-row" key={i}>
                  <span>{feat}</span>
                  <span className="il-vs-no">✗</span>
                  <span className="il-vs-yes">✓</span>
                </div>
              ))}
            </div>
            <div className="il-diff-note il-dark-card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p>Competitors are capturing users at the exact moment of decision-making. <strong>Blogy closes that gap.</strong></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessModelSection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Business Model</span>
          <h2 className="section-title">SaaS Model Built <em>for Scale</em></h2>
          <p className="section-sub">Customers pay for results, not effort — making it accessible to startups and scalable for enterprises. Unlike traditional SEO services that charge based on effort, Blogy operates as a SaaS platform aligned with output.</p>
        </div>

        <div className="il-biz-layout">
          <div className="il-tier-cards">
            {[
              { name: 'Starter', price: '$24', period: '/mo', features: ['15 AI blogs / month', '200 pSEO pages', 'Basic backlink discovery', 'Publish to any CMS'] },
              { name: 'Growth', price: '$49', period: '/mo', features: ['30 AI blogs / month', '1,000 pSEO pages', 'Competitor analysis', 'Priority publish queue'], highlight: true },
              { name: 'Scale', price: '$119', period: '/mo', features: ['Unlimited AI blogs', '10,000 pSEO pages', 'Custom LLM fine-tuning', 'API + webhooks'] },
            ].map((t, i) => (
              <div className={`il-tier-card ${t.highlight ? 'il-tier-highlight' : ''}`} key={i}>
                {t.highlight && <span className="il-tier-badge">Most Popular</span>}
                <h4>{t.name}</h4>
                <div className="il-tier-price"><span className="il-tp-n">{t.price}</span><span>{t.period}</span></div>
                <ul className="il-tier-feats">
                  {t.features.map((f, j) => (
                    <li key={j}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="il-biz-right">
            <div className="il-cost-compare">
              <h4 className="il-sub-heading">Cost Comparison</h4>
              {[
                { label: 'Agency', value: 95, cost: '$1K–$10K/mo', color: '#f87171' },
                { label: 'Freelancer', value: 60, cost: '$500–$2K/mo', color: '#fbbf24' },
                { label: 'Blogy', value: 8, cost: 'From $24/mo', color: '#0d9488' },
              ].map((c, i) => (
                <div className="il-cost-row" key={i}>
                  <span className="il-cost-label">{c.label}</span>
                  <div className="il-cost-bar-wrap"><div className="il-cost-bar" style={{ width: `${c.value}%`, background: c.color }}/></div>
                  <span className="il-cost-val">{c.cost}</span>
                </div>
              ))}
            </div>

            <div className="il-dark-card">
              <span className="il-dark-label">Value Proposition</span>
              <p><strong>20x cheaper</strong> than content teams. Replaces writers, SEO tools, and agencies — with a single engine.</p>
              <div className="il-biz-pills">
                <span>Recurring Revenue</span><span>High Margin</span><span>Low Churn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GTMSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-purple">Go-to-Market</span>
          <h2 className="section-title">We Use Blogy <em>to Grow Blogy</em></h2>
          <p className="section-sub">Instead of relying on traditional marketing channels, Blogy uses its own product to generate traffic and acquire users. This creates a highly efficient and self-reinforcing acquisition model.</p>
        </div>

        <div className="il-gtm-layout">
          <div className="il-gtm-channels">
            {[
              { n: '01', title: 'Programmatic SEO (Core)', desc: 'Thousands of landing pages targeting high-intent keywords. Self-funding acquisition.', badge: 'PRIMARY' },
              { n: '02', title: 'Founder-led Growth', desc: 'Direct outreach, thought leadership, and network leverage from Day 1.', badge: 'ACTIVE' },
              { n: '03', title: 'Agency Partnerships', desc: 'White-label and referral model with SEO and content agencies.', badge: 'PIPELINE' },
              { n: '04', title: 'Free Tools', desc: 'Keyword research tools, SEO auditors — driving top-of-funnel traffic.', badge: 'PLANNED' },
            ].map((c, i) => (
              <div className="il-gtm-card" key={i}>
                <span className="il-gtm-num">{c.n}</span>
                <div className="il-gtm-body">
                  <div className="il-gtm-title-row">
                    <h4>{c.title}</h4>
                    <span className={`il-gtm-badge il-gtm-${c.badge.toLowerCase()}`}>{c.badge}</span>
                  </div>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="il-gtm-right">
            <div className="il-dark-card il-flywheel">
              <h4 className="il-sub-heading il-sub-white">The SEO Flywheel</h4>
              <div className="il-fw-steps">
                {[
                  '1 · We rank for SEO keywords',
                  '2 · Users discover Blogy',
                  '3 · They use Blogy to rank',
                  '4 · More data → better results',
                ].map((f, i) => (
                  <div className="il-fw-step" key={i}>
                    <span className="il-fw-dot"/>
                    <span>{f}</span>
                    {i < 3 && <div className="il-fw-line"/>}
                  </div>
                ))}
              </div>
            </div>

            <div className="il-why-now">
              <h4 className="il-sub-heading">Why Now</h4>
              {[
                'Writing cost dropped by 90%+ — content is now a commodity',
                'AI search (SGE, Perplexity) is reshaping discovery — GEO is urgent',
                '60%+ marketers name SEO as highest ROI — demand is exploding',
              ].map((w, i) => (
                <div className="il-wn-item" key={i}>
                  <span className="il-wn-dot"/>
                  <p>{w}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoatSection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-blue">Defensibility</span>
          <h2 className="section-title">Compounding Advantage <em>Over Time</em></h2>
          <p className="section-sub">As more content is generated and ranked, the system collects valuable data that enhances future performance. This creates a strong feedback loop that is difficult to replicate.</p>
        </div>

        <div className="il-moat-pillars">
          {[
            { title: 'Data Flywheel', desc: 'Every page published feeds the system with performance data. Rankings improve automatically over time.', strength: 90, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg> },
            { title: 'Distribution Engine', desc: 'Thousands of pages create a self-reinforcing traffic loop that compounds without additional cost.', strength: 82, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
            { title: 'High Switching Cost', desc: 'Content, rankings, and domain authority built on Blogy cannot easily be migrated to another tool.', strength: 78, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
            { title: 'Execution Complexity', desc: 'pSEO has <5% adoption despite being used by Zapier, Canva, Wise. Replicating the system is non-trivial.', strength: 88, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
          ].map((m, i) => (
            <div className="il-moat-card" key={i}>
              <div className="il-moat-icon">{m.icon}</div>
              <div className="il-moat-body">
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <div className="il-moat-bar-wrap">
                  <div className="il-moat-bar" style={{ width: `${m.strength}%` }}/>
                </div>
                <span className="il-moat-pct">{m.strength}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="il-moat-bottom">
          <div className="il-dark-card il-pseo-card">
            <span className="il-dark-label">Programmatic SEO</span>
            <div className="il-pseo-stat">
              <span className="il-pseo-n">&lt;5%</span>
              <span>Market Adoption</span>
            </div>
            <p>Used by Zapier, Canva, Wise — high complexity barrier = massive whitespace.</p>
            <div className="il-pseo-cos">{['Zapier', 'Canva', 'Wise'].map(c => <span key={c}>{c}</span>)}</div>
          </div>
          <div className="il-moat-quote">
            <p>"The flywheel effect reduces reliance on paid acquisition over time — <span className="il-teal">compounding advantage is the moat."</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TractionSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Traction</span>
          <h2 className="section-title"><em>Execution Proof</em></h2>
          <p className="section-sub">Early experiments have validated the ability to generate, publish, and manage content at scale. We've proven the system works before scaling — optimising distribution strategies in real-world conditions.</p>
        </div>

        <div className="il-traction-metrics">
          {[
            { num: '600+', label: 'Pages Created', sub: 'Across live SEO experiments', accent: true },
            { num: 'Live', label: 'SEO Experiments', sub: 'Real-world indexing tests' },
            { num: 'Self', label: 'Powered Growth', sub: 'Blogy running on Blogy' },
          ].map((m, i) => (
            <div className={`il-tm-card ${m.accent ? 'il-tm-accent' : ''}`} key={i}>
              <span className="il-tm-n">{m.num}</span>
              <span className="il-tm-l">{m.label}</span>
              <span className="il-tm-s">{m.sub}</span>
            </div>
          ))}
        </div>

        <div className="il-traction-bottom">
          <div className="il-proof-list">
            <h4 className="il-sub-heading">What We've Validated</h4>
            {[
              { title: 'Bulk generation at scale', desc: 'System can produce and structure hundreds of unique pages without manual intervention.' },
              { title: 'Indexing speed', desc: 'Direct GSC integration accelerates page discovery and ranking signal propagation.' },
              { title: 'Content uniqueness', desc: "Every page is structurally unique — passing Google's duplicate content filters." },
              { title: 'Self-referential proof', desc: "Blogy.in's own traffic is driven by its own engine — dogfooding at its best." },
            ].map((p, i) => (
              <div className="il-proof-item" key={i}>
                <div className="il-pi-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="il-traction-right">
            <div className="il-dark-card">
              <span className="il-dark-label">Execution Insight</span>
              <h3>Traffic driven by our own engine</h3>
              <p>We don't just build the product — we live it. Every ranking Blogy earns is proof of concept for every future customer.</p>
            </div>
            <div className="il-next-milestones">
              <h4 className="il-sub-heading">Next Milestones</h4>
              {['First 100 paying customers', '10,000+ pages managed', 'Agency partnership programme launch'].map(m => (
                <div className="il-wn-item" key={m}>
                  <span className="il-wn-dot"/>
                  <p>{m}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionSection() {
  return (
    <section className="il-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-purple">Future Vision</span>
          <h2 className="section-title">Blogy = Growth <em>Infrastructure</em></h2>
          <p className="section-sub">As search evolves to include AI-driven discovery, businesses will need systems that can operate across multiple formats. Blogy aims to become the infrastructure that powers this shift — expanding beyond text into images and videos.</p>
        </div>

        <div className="il-vision-phases">
          {[
            {
              label: 'Text',
              sub: 'Today · Live',
              active: true,
              phase: '01',
              desc: 'AI-generated, SEO-optimized blog content published at scale across any CMS.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              ),
            },
            {
              label: 'Image',
              sub: 'Phase 2',
              phase: '02',
              desc: 'AI-generated visual content — infographics, OG images, and product visuals.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              ),
            },
            {
              label: 'Video',
              sub: 'Phase 3',
              phase: '03',
              desc: 'Short-form and long-form video content generated from text — for YouTube, Reels, Shorts.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
              ),
            },
            {
              label: 'Full OS',
              sub: 'Vision',
              phase: '04',
              desc: 'The complete growth operating system — owning every channel, format, and discovery surface.',
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                </svg>
              ),
            },
          ].map((v, i) => (
            <div className="il-vphase-wrap" key={i}>
              <div className={`il-vphase ${v.active ? 'il-vphase-active' : ''}`}>
                <div className="il-vphase-top">
                  <span className="il-vphase-phase">{v.phase}</span>
                  <span className="il-vphase-sub">{v.sub}</span>
                </div>
                <div className="il-vphase-icon">{v.icon}</div>
                <h4>{v.label}</h4>
                <p className="il-vphase-desc">{v.desc}</p>
              </div>
              {i < 3 && (
                <div className="il-vphase-connector">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="il-vision-bottom">
          <div className="il-mono-layers">
            <h4 className="il-sub-heading">Monetisation Layers</h4>
            <div className="il-mono-grid">
              {[
                { title: 'SaaS Subscriptions', desc: 'Core recurring revenue from platform access.', tag: 'Recurring' },
                { title: 'Agency White-label', desc: 'B2B licensing for SEO and content agencies.', tag: 'B2B' },
                { title: 'Marketplace', desc: 'Content, templates, and integrations marketplace.', tag: 'Platform' },
                { title: 'Data Intelligence', desc: 'Aggregated SEO insights sold to enterprises.', tag: 'Enterprise' },
              ].map((l, i) => (
                <div className="il-mono-card" key={i}>
                  <span className="il-mono-tag">{l.tag}</span>
                  <h4>{l.title}</h4>
                  <p>{l.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="il-dark-card il-impact-card">
            <span className="il-dark-label">Projected Impact</span>
            <div className="il-impact-num">10<span className="il-ix">×</span></div>
            <span className="il-impact-metric-label">LTV Growth</span>
            <p>vs current transactional per-article model — through full lifecycle ownership.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="il-closing">
      <div className="il-closing-grid" aria-hidden="true"/>
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-blue">Executive Summary</span>
          <h2 className="section-title">From Content Chaos → <em>Predictable Growth</em></h2>
          <p className="section-sub">Manual workflows and fragmented tools are no longer sufficient. Blogy represents a shift towards automation, scalability, and predictability in organic growth.</p>
        </div>

        <div className="il-closing-pillars">
          {[
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, title: 'Category Defining', desc: 'First full-loop autonomous SEO engine.' },
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Defensible Moat', desc: 'Data flywheel + execution complexity.' },
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, title: 'Multi-layer Revenue', desc: 'SaaS + agency + marketplace + data.' },
            { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, title: 'India-first, Global-ready', desc: 'Built for Bharat, designed for the world.' },
          ].map((p, i) => (
            <div className="il-cp" key={i}>
              <div className="il-cp-icon">{p.icon}</div>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="il-transforms">
          {[
            ['content chaos', 'predictable growth'],
            ['teams', 'systems'],
            ['effort', 'automation'],
          ].map(([a, b], i) => (
            <div className="il-transform-row" key={i}>
              <span className="il-tr-from">From <em>{a}</em></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <span className="il-tr-to">to <strong>{b}</strong></span>
            </div>
          ))}
        </div>

        <div className="il-vision-card">
          <span className="il-dark-label">The Vision</span>
          <h3>"Building India's default <span className="il-teal">AI-powered</span> growth engine for businesses."</h3>
          <div className="il-vision-meta">
            <span>Launch: 2026</span>
            <span className="il-vision-dot"/>
            <span>blogy.in</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="il-section il-section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-label il-label-blue">The Team</span>
          <h2 className="section-title">The People <em>Behind the Engine</em></h2>
          <p className="section-sub">A founder team combining deep product and technical expertise with a shared obsession for building scalable, AI-powered systems that drive real business outcomes.</p>
        </div>

        <div className="il-team-grid">
          {[
            {
              name: 'Tarun Kumar', role: 'Founder & CEO', initials: 'TK', photo: '/tarun.png',
              linkedin: 'https://www.linkedin.com/in/tarunmottlia/', phone: '7210499455', email: 'tarun.kumar@blogy.in',
              bio: "Obsessed with building scalable growth systems. Combines product thinking with deep SEO expertise to drive Blogy's go-to-market and category creation.",
              points: ['Product vision & GTM strategy', 'Growth, distribution & partnerships', 'SEO systems & content automation'],
            },
            {
              name: 'Yashraj Verma', role: 'Founder & CTO', initials: 'YV', photo: '/yashraj.png',
              linkedin: 'https://www.linkedin.com/in/yashraj-verma-634710154/',
              bio: "Architect of Blogy's core engine. Brings deep technical expertise in AI systems, SEO infrastructure, and large-scale content automation platforms.",
              points: ['Full-stack engineering & AI architecture', 'Programmatic SEO infrastructure', 'Scalable systems & data pipelines'],
            },
          ].map((m, i) => (
            <div className="il-team-card" key={i}>
              <div className="il-tc-photo-wrap">
                <img src={m.photo} alt={m.name} className="il-tc-photo" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}/>
                <div className="il-tc-initials" style={{ display: 'none' }}>{m.initials}</div>
              </div>
              <div className="il-tc-body">
                <div className="il-tc-header">
                  <div>
                    <h3 className="il-tc-name">{m.name}</h3>
                    <span className="il-tc-role">{m.role}</span>
                  </div>
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="il-tc-linkedin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                </div>
                <p className="il-tc-bio">{m.bio}</p>
                <ul className="il-tc-points">
                  {m.points.map((p, j) => (
                    <li key={j}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {p}
                    </li>
                  ))}
                </ul>
                {m.email && (
                  <div className="il-tc-contact">
                    <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {m.email}</span>
                    <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.55 15a19.79 19.79 0 01-3.07-8.67A2 2 0 013.46 4h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 11.09a16 16 0 006 6l.81-.81a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.52z"/></svg> {m.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="il-team-footer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <p>A lean, execution-focused team that has already proven the system works. Hiring across engineering, growth, and partnerships.</p>
        </div>
      </div>
    </section>
  );
}

function TopNav() {
  return (
    <nav className="il-topnav">
      <div className="container il-topnav-inner">
        <div className="il-topnav-brand">
          <img src="/logo.svg" alt="Blogy" className="il-topnav-logo" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='inline'; }} />
          <span className="il-topnav-logo-fallback" style={{ display: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--teal-400)"/></svg>
          </span>
          <span className="il-topnav-name">Blogy</span>
        </div>
        <span className="il-topnav-tag">Investor Deck · 2026</span>
      </div>
    </nav>
  );
}

export default function InvestorLanding() {
  return (
    <div className="il-root">
      <TopNav />
      <HeroSection />
      <ProblemSection />
      <MarketShiftSection />
      <MarketOpportunitySection />
      <CompetitiveSection />
      <SolutionSection />
      <AIEngineSection />
      <HowItWorksSection />
      <UserJourneySection />
      <DifferentiationSection />
      <BusinessModelSection />
      <GTMSection />
      <MoatSection />
      <TractionSection />
      <VisionSection />
      <ClosingSection />
      <TeamSection />
    </div>
  );
}
