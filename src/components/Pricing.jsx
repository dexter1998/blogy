import { useState } from 'react';
import './Pricing.css';

const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: '₹',
    desc: 'Acquisition and first value—see Blogy work on your site.',
    cta: 'Start Free',
    ctaHref: 'https://dashboard.blogy.in/signin',
    popular: false,
    features: [
      '8 blogs / month (2 per week)',
      'Basic SEO optimization',
      'Limited keyword suggestions',
      'Standard templates',
      'Blogy branding',
    ],
    missing: [
      'No programmatic SEO',
      'No backlinks or competitor insights',
    ],
  },
  {
    name: 'Starter',
    monthlyPrice: 1999,
    annualPrice: 1499,
    currency: '₹',
    desc: 'Scale organic content with programmatic SEO from day one.',
    cta: 'Get Started',
    ctaHref: 'https://dashboard.blogy.in/signin',
    popular: false,
    features: [
      '15 AI blogs / month (~₹133 per blog)',
      '200 programmatic SEO pages',
      'Basic backlinks',
      'Limited competitor insights',
      'Keyword clustering & internal linking',
      'CMS publish & multi-language',
    ],
  },
  {
    name: 'Growth',
    monthlyPrice: 3999,
    annualPrice: 2999,
    currency: '₹',
    desc: 'Most teams serious about topical authority start here.',
    cta: 'Get Growth',
    ctaHref: 'https://dashboard.blogy.in/signin',
    popular: true,
    features: [
      '30 AI blogs / month (~₹133 per blog)',
      '1,000 programmatic SEO pages',
      'Advanced backlinks & competitor analysis',
      'Full keyword clustering & topic maps',
      'Internal linking automation',
      'Priority CMS publish (all platforms)',
      'Multi-language support',
      'No Blogy branding',
    ],
  },
];

function CheckIcon({ color = '#0d9488' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={color} style={{ flexShrink: 0, marginTop: 1 }}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="#9ca3af" style={{ flexShrink: 0, marginTop: 1 }}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
    </svg>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Rank on Google <span className="text-teal">Automatically</span></h2>
          <p className="section-sub">Start free, upgrade as traffic compounds without hiring or agency retainers.</p>
          
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

        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="plan-currency">{plan.currency}</span>
                <span className="plan-amount">
                  {annual ? plan.annualPrice.toLocaleString('en-IN') : plan.monthlyPrice.toLocaleString('en-IN')}
                </span>
                <span className="plan-period">/ month</span>
              </div>
              {annual && plan.monthlyPrice > 0 && (
                <div className="plan-saving">Billed annually — save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString('en-IN')}/yr</div>
              )}
              <p className="plan-desc">{plan.desc}</p>
              
              <ul className="plan-features">
                {plan.features.map((f, j) => (
                  <li key={j}>
                    <CheckIcon color={plan.popular ? '#0d9488' : '#0d9488'} />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.missing?.map((f, j) => (
                  <li key={`x-${j}`} className="missing">
                    <XIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className={`plan-cta ${plan.popular ? 'plan-cta-primary' : 'plan-cta-secondary'}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="pricing-note">All plans include a 7-day money-back guarantee. No hidden fees. Cancel anytime.</p>
      </div>
    </section>
  );
}
