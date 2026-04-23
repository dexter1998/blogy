import { useState } from 'react';
import './SampleBlogs.css';

const TYPES = [
  { id: 'longform', label: 'Long-form Guide' },
  { id: 'listicle', label: 'Listicle' },
  { id: 'product', label: 'Product Category' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'howto', label: 'How-To Guide' },
  { id: 'news', label: 'News & Update' },
];

const PREVIEWS = {
  longform: {
    tag: 'Long-form Guide · 3,200 words',
    title: 'The Complete Guide to B2B Content Marketing in 2025',
    meta: 'By Blogy AI · 6 min read · Updated Apr 2025',
    intro: 'B2B content marketing is no longer just about blog posts. In 2025, winning brands are building content ecosystems — SEO-optimized articles, AI-cited resources, and programmatic landing pages that compound over time.',
    sections: [
      { heading: '1. Why Most B2B Content Fails', body: 'Most B2B blogs are written for the writer, not the reader. They use jargon, bury the insight, and never answer the question the visitor actually typed into Google...' },
      { heading: '2. The Topical Authority Framework', body: 'Instead of writing one great article, build a cluster of 15–20 interlinked pieces around a core topic. Google rewards depth and consistency over isolated viral posts...' },
      { heading: '3. Optimizing for AI Overviews', body: 'AI Overviews pull structured, confident answers. Use H2s as direct questions, lead each section with a definitive answer, and cite data within the first two sentences...' },
    ],
  },
  listicle: {
    tag: 'Listicle · 1,800 words',
    title: '12 Best AI Writing Tools for SaaS Startups (Ranked for 2025)',
    meta: 'By Blogy AI · 4 min read · Updated Apr 2025',
    intro: 'Picking the wrong AI writing tool wastes months and thousands of dollars. We tested 12 platforms across 6 categories — SEO quality, publishing speed, integration depth, and AI citation readiness.',
    sections: [
      { heading: '#1 Blogy — Best for SEO + GEO combined', body: 'Blogy stands alone in writing content that ranks on Google AND gets cited in ChatGPT, Perplexity, and AI Overviews. Built-in keyword research, autopublishing to any CMS...' },
      { heading: '#2 Surfer SEO — Best for on-page optimization', body: 'Surfer scores content in real time against top-ranking competitors. Excellent for optimizing existing articles but requires a separate writing workflow...' },
      { heading: '#3 Jasper — Best for brand voice control', body: 'Jasper\'s "brand voice" training lets enterprise teams maintain consistent tone across hundreds of writers. Expensive but powerful for large content ops...' },
    ],
  },
  product: {
    tag: 'Product Category · 2,400 words',
    title: 'Best Project Management Software for Remote Teams',
    meta: 'By Blogy AI · 5 min read · Updated Apr 2025',
    intro: 'Remote teams lose an average of 11 hours per week to miscommunication. The right project management tool fixes this — but the wrong one adds more chaos. Here are the top options, tested by distributed teams.',
    sections: [
      { heading: 'What to Look for in PM Software', body: 'Prioritize: async-first design, timezone visibility, integration with your existing stack (Slack, GitHub, Figma), and granular permissions for contractors...' },
      { heading: 'Notion — Best all-in-one workspace', body: 'Notion doubles as a wiki, project tracker, and doc editor. Its flexibility is its superpower and its weakness — setup takes time, but the payoff is a single source of truth...' },
      { heading: 'Linear — Best for engineering teams', body: 'Linear\'s speed and keyboard-driven UX make it the darling of product and engineering orgs. Cycles, roadmaps, and GitHub sync are best-in-class...' },
    ],
  },
  comparison: {
    tag: 'Comparison · 2,100 words',
    title: 'Blogy vs Jasper vs Surfer SEO: Which AI Content Tool Wins?',
    meta: 'By Blogy AI · 5 min read · Updated Apr 2025',
    intro: 'Three tools dominate the AI content space in 2025. We ran them through a real-world test: write, optimize, and publish a 2,000-word SEO article — and tracked rankings 30 days later.',
    sections: [
      { heading: 'Feature Comparison at a Glance', body: 'Blogy: end-to-end (research → write → publish → track). Jasper: writing + brand voice. Surfer: on-page SEO scoring. None of Jasper or Surfer auto-publishes to your CMS...' },
      { heading: 'SEO Quality Test Results', body: 'After 30 days, articles written with Blogy averaged position 14.2 vs Jasper at 28.7 and Surfer-optimized posts at 19.4. Blogy content also appeared in 3× more AI Overviews...' },
      { heading: 'Pricing Breakdown', body: 'Blogy starts at ₹1,999/mo for 15 AI blogs. Jasper starts at $49/mo for writing only. Surfer at $59/mo for SEO scoring only. You\'d spend $100+/mo using both vs Blogy\'s all-in-one...' },
    ],
  },
  howto: {
    tag: 'How-To Guide · 1,600 words',
    title: 'How to Set Up Programmatic SEO for Your SaaS in 7 Steps',
    meta: 'By Blogy AI · 4 min read · Updated Apr 2025',
    intro: 'Programmatic SEO lets you generate hundreds of targeted landing pages from a spreadsheet. Done right, it\'s one of the highest-ROI content strategies for SaaS. Here\'s the exact playbook.',
    sections: [
      { heading: 'Step 1: Identify Your Template Types', body: 'Start with use-case pages ("CRM for [industry]"), integration pages ("Connect [Tool] to [Tool]"), and location pages. Each template type needs a distinct URL structure and content schema...' },
      { heading: 'Step 2: Build Your Data Source', body: 'Use Airtable or Google Sheets to store your variables: industries, locations, integrations, competitors. Blogy connects directly to your spreadsheet to generate pages in bulk...' },
      { heading: 'Step 3: Generate and Publish at Scale', body: 'With your template and data source ready, Blogy generates unique, SEO-optimized content for each row and publishes directly to your CMS — all within minutes...' },
    ],
  },
  news: {
    tag: 'News & Update · 900 words',
    title: 'Google AI Overviews Now Appear in 60% of Searches — What It Means for SEO',
    meta: 'By Blogy AI · 2 min read · Updated Apr 2025',
    intro: 'Google\'s AI Overviews crossed a new milestone this month: they now appear in over 60% of all search queries in the US. For content marketers, this changes everything about what "ranking" means.',
    sections: [
      { heading: 'Which Content Gets Cited in AI Overviews?', body: 'Structured content with clear H2/H3 hierarchies, factual precision, and recent publication dates is getting picked up most. Long opinion pieces and thin listicles are being filtered out...' },
      { heading: 'What Traffic Looks Like Now', body: 'Sites with AI Overview citations are seeing a new pattern: fewer clicks from position 1–3, but dramatically higher brand recall and direct traffic spikes. Zero-click doesn\'t mean zero-value...' },
      { heading: 'How Blogy Adapts Your Content', body: 'Blogy\'s AI-ready formatting mode automatically structures every article for citation — direct answers in the first paragraph, FAQ schema, and entity-rich language throughout...' },
    ],
  },
};

export default function SampleBlogs() {
  const [active, setActive] = useState('longform');
  const preview = PREVIEWS[active];

  return (
    <section className="sb-section">
      <div className="container">
        <div className="sb-header">
          <span className="sb-label">Sample Output</span>
          <h2 className="sb-heading">
            See what Blogy <em>actually writes</em>
          </h2>
          <p className="sb-sub">Real content, ready to rank — across every format your strategy needs.</p>
        </div>

        <div className="sb-layout">
          {/* Left — filters */}
          <div className="sb-filters">
            {TYPES.map(t => (
              <button
                key={t.id}
                className={`sb-filter-btn ${active === t.id ? 'active' : ''}`}
                onClick={() => setActive(t.id)}
              >
                {t.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </div>

          {/* Right — preview */}
          <div className="sb-preview">
            <div className="sb-preview-chrome">
              <div className="sb-chrome-dots">
                <span/><span/><span/>
              </div>
              <div className="sb-chrome-url">blogy.in/blog/sample-post</div>
              <div className="sb-chrome-badge">Live Preview</div>
            </div>
            <div className="sb-preview-body" key={active}>
              <div className="sb-post-tag">{preview.tag}</div>
              <h3 className="sb-post-title">{preview.title}</h3>
              <div className="sb-post-meta">{preview.meta}</div>
              <p className="sb-post-intro">{preview.intro}</p>
              <div className="sb-post-sections">
                {preview.sections.map((s, i) => (
                  <div key={i} className="sb-post-section">
                    <h4 className="sb-section-heading">{s.heading}</h4>
                    <p className="sb-section-body">{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="sb-post-footer">
                <span className="sb-status-dot"/>
                <span>Generated by Blogy · SEO score 94/100 · AI-ready formatting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
