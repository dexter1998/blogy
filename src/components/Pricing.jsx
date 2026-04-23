import { useState } from 'react';
import './Pricing.css';

const PAID_TIERS = [
  {
    name: 'Starter',
    monthly: 1999,
    annual: 1499,
    desc: 'Scale organic content with programmatic SEO from day one.',
    features: [
      '15 AI blogs / month',
      '200 programmatic SEO pages',
      'Basic backlink discovery',
      'Keyword clustering',
      'Multi-language support',
      'Publish to any CMS',
    ],
  },
  {
    name: 'Growth',
    monthly: 3999,
    annual: 2999,
    desc: 'Teams serious about owning topical authority start here.',
    features: [
      '30 AI blogs / month',
      '1,000 programmatic SEO pages',
      'Advanced backlink engine',
      'Competitor analysis',
      'Internal-link automation',
      'Priority publish queue',
      'No Blogy branding',
    ],
  },
  {
    name: 'Scale',
    monthly: 9999,
    annual: 7499,
    desc: 'Agency-grade throughput — without the agency.',
    features: [
      'Unlimited AI blogs',
      '10,000 programmatic pages',
      'Custom LLM fine-tuning',
      'API + webhooks',
      'White-glove onboarding',
      'Dedicated success manager',
      'SLA uptime guarantee',
    ],
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [tierIdx, setTierIdx] = useState(1);

  const tier = PAID_TIERS[tierIdx];
  const price = annual ? tier.annual : tier.monthly;
  const saving = (tier.monthly - tier.annual) * 12;

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Pricing</span>
          <h2 className="section-title">
            Slide to the plan that <em>fits you.</em>
          </h2>
          <p className="section-sub">
            Start free. Upgrade as traffic compounds. One slider, three serious tiers.
          </p>
          {/* Toggle */}
          <div className="pricing-toggle">
            <span className={!annual ? 'active' : ''}>Monthly</span>
            <button
              className={`toggle-btn ${annual ? 'on' : ''}`}
              onClick={() => setAnnual(!annual)}
              aria-label="Toggle annual billing"
            >
              <span className="toggle-knob" />
            </button>
            <span className={annual ? 'active' : ''}>
              Annual
              <span className="save-badge">Save 25%</span>
            </span>
          </div>
        </div>

        {/* Two-col grid */}
        <div className="pricing-two-col">

          {/* Left — Free card */}
          <div className="pc-free">
            <div className="pc-sub-label">For trying it out</div>
            <div className="pc-plan-name">Free</div>
            <p className="pc-desc">Kick the tires on your site. No credit card, no time limit.</p>
            <div className="pc-price-row">
              <span className="pc-currency">₹</span>
              <span className="pc-amount">0</span>
              <span className="pc-period">/ forever</span>
            </div>
            <a href="https://dashboard.blogy.in/signin" target="_blank" rel="noopener noreferrer" className="pc-cta pc-cta-ghost">
              Start free
            </a>
            <ul className="pc-features">
              {['8 AI blogs / month', 'Basic SEO optimization', 'Standard templates', 'Google + LLM indexing'].map(f => (
                <li key={f} className="pc-feat-ok"><CheckIcon /><span>{f}</span></li>
              ))}
              {['No programmatic SEO', 'Blogy branding on posts'].map(f => (
                <li key={f} className="pc-feat-no"><XIcon /><span>{f}</span></li>
              ))}
            </ul>
          </div>

          {/* Right — Paid slider card */}
          <div className="pc-paid">
            <div className="pc-popular-badge">Most popular</div>
            <div className="pc-sub-label">For growing teams</div>
            <div className="pc-plan-name pc-plan-name--accent" key={tier.name}>{tier.name}</div>
            <p className="pc-desc" key={tier.desc}>{tier.desc}</p>

            <div className="pc-price-row">
              <span className="pc-currency">₹</span>
              <span className="pc-amount pc-amount--accent" key={price}>{price.toLocaleString('en-IN')}</span>
              <span className="pc-period">/ month</span>
            </div>
            <div className="pc-saving">
              {annual
                ? `Billed yearly · save ₹${saving.toLocaleString('en-IN')}`
                : 'Switch to annual & save 25%'}
            </div>

            {/* Slider */}
            <div className="pc-slider-wrap">
              <div className="pc-tier-tabs">
                {PAID_TIERS.map((t, i) => (
                  <button
                    key={t.name}
                    className={`pc-tier-tab ${tierIdx === i ? 'active' : ''}`}
                    onClick={() => setTierIdx(i)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0" max="2" step="1"
                value={tierIdx}
                onChange={e => setTierIdx(Number(e.target.value))}
                className="pc-range"
                style={{ '--pct': `${(tierIdx / 2) * 100}%` }}
              />
            </div>

            <a href="https://dashboard.blogy.in/signin" target="_blank" rel="noopener noreferrer" className="pc-cta pc-cta-primary">
              Get {tier.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>

            <ul className="pc-features" key={tier.name + '-feats'}>
              {tier.features.map((f, i) => (
                <li key={i} className="pc-feat-ok" style={{ animationDelay: `${i * 35}ms` }}>
                  <CheckIcon /><span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enterprise banner */}
        <div className="pc-enterprise">
          <div className="pc-ent-left">
            <div className="pc-ent-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/>
              </svg>
            </div>
            <div>
              <div className="pc-ent-label">Enterprise</div>
              <div className="pc-ent-title">Running multiple brands or sites?</div>
              <p className="pc-ent-desc">Everything you need to scale content across your entire portfolio — with a dedicated expert by your side.</p>
            </div>
          </div>
          <div className="pc-ent-right">
            <ul className="pc-ent-features">
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, text: 'Multiple websites support' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h10"/></svg>, text: 'Unlimited pSEO pages' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>, text: 'Unlimited backlinks' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, text: 'Dedicated SEO expert (RM)' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, text: 'Customizations on demand' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.89 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012.81 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, text: '24/7 priority technical support' },
              ].map((item, i) => (
                <li key={i} className="pc-ent-feat">
                  <span className="pc-ent-feat-icon">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <a href="mailto:hello@blogy.in" className="pc-cta pc-cta-primary">
              Let's talk
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        <p className="pricing-note">7-day money-back guarantee · GST invoices · Cancel anytime</p>
      </div>
    </section>
  );
}
