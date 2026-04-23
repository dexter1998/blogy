import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Pricing', href: '/#pricing' },
];

const PRODUCTS = [
  {
    label: 'Auto Blogging', href: 'https://dashboard.blogy.in', desc: 'Fully automated blog publishing', internal: false,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  },
  {
    label: 'SEO Growth Engine', href: 'https://dashboard.blogy.in', desc: 'AI-powered keyword ranking', internal: false,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
  {
    label: 'Topic Discovery', href: 'https://dashboard.blogy.in', desc: 'Find high-intent topics automatically', internal: false,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    label: 'Programmatic SEO', href: 'https://dashboard.blogy.in', desc: 'Scale to thousands of pages', internal: false,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  },
  {
    label: 'Name Generator', href: '/startup-name-generator', desc: 'Brand names for any niche, instantly', internal: true,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
];

const RESOURCES_LEARN = [
  {
    label: 'Documentation', desc: 'Platform guides & tutorials',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    href: '#',
  },
  {
    label: 'API Reference', desc: 'Build custom integrations',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    href: '#',
  },
];

const RESOURCES_EXPLORE = [
  {
    label: 'Resource Hub', desc: 'Prompts, ideas, and SEO resources',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
    href: '#',
  },
  {
    label: 'Templates', desc: 'Browse niche and CMS-ready templates',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    href: '#',
  },
  {
    label: 'Integrations', desc: 'Connect Blogy to publishing tools',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    href: '#',
  },
  {
    label: 'Samples', desc: 'See example articles and formats',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    href: '#',
  },
  {
    label: 'Startup Names', desc: 'Find brand names for your niche',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    href: '/startup-names',
    internal: true,
  },
];

const RESOURCES_COMPANY = [
  {
    label: 'Changelog',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    href: '#',
  },
  {
    label: 'Blog',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    href: '#',
  },
  {
    label: 'Compare Tools',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    href: '#',
  },
];

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const show = () => { clearTimeout(timerRef.current); setOpen(true); };
  const hide = () => { timerRef.current = setTimeout(() => setOpen(false), 80); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="nav-dropdown" onMouseEnter={show} onMouseLeave={hide}>
      <button className={`nav-link nav-dropdown-toggle ${open ? 'active' : ''}`} aria-expanded={open}>
        Products
        <svg className={`nav-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="dropdown-panel dp-products" onMouseEnter={show} onMouseLeave={hide}>
          {PRODUCTS.map(p => p.internal
            ? <Link key={p.label} to={p.href} className="dropdown-item dp-item-icon">
                <span className="dp-icon">{p.icon}</span>
                <span className="dp-item-text">
                  <span className="dropdown-item-label">{p.label}</span>
                  <span className="dropdown-item-desc">{p.desc}</span>
                </span>
              </Link>
            : <a key={p.label} href={p.href} className="dropdown-item dp-item-icon">
                <span className="dp-icon">{p.icon}</span>
                <span className="dp-item-text">
                  <span className="dropdown-item-label">{p.label}</span>
                  <span className="dropdown-item-desc">{p.desc}</span>
                </span>
              </a>
          )}
        </div>
      )}
    </div>
  );
}

function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const show = () => { clearTimeout(timerRef.current); setOpen(true); };
  const hide = () => { timerRef.current = setTimeout(() => setOpen(false), 80); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="nav-dropdown" onMouseEnter={show} onMouseLeave={hide}>
      <button className={`nav-link nav-dropdown-toggle ${open ? 'active' : ''}`} aria-expanded={open}>
        Resources
        <svg className={`nav-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="dropdown-panel dp-resources" onMouseEnter={show} onMouseLeave={hide}>
          <div className="dp-resources-grid">
            <div className="dp-resources-left">
              <div className="dp-section-label">Learn</div>
              {RESOURCES_LEARN.map(r => (
                <a key={r.label} href={r.href} className="dropdown-item dp-item-icon dp-rich">
                  <span className="dp-icon">{r.icon}</span>
                  <span className="dp-item-text">
                    <span className="dropdown-item-label">{r.label}</span>
                    <span className="dropdown-item-desc">{r.desc}</span>
                  </span>
                </a>
              ))}
              <div className="dp-section-label" style={{ marginTop: 14 }}>Explore</div>
              {RESOURCES_EXPLORE.map(r => r.internal
                ? <Link key={r.label} to={r.href} className="dropdown-item dp-item-icon dp-rich">
                    <span className="dp-icon">{r.icon}</span>
                    <span className="dp-item-text">
                      <span className="dropdown-item-label">{r.label}</span>
                      {r.desc && <span className="dropdown-item-desc">{r.desc}</span>}
                    </span>
                  </Link>
                : <a key={r.label} href={r.href} className="dropdown-item dp-item-icon dp-rich">
                    <span className="dp-icon">{r.icon}</span>
                    <span className="dp-item-text">
                      <span className="dropdown-item-label">{r.label}</span>
                      {r.desc && <span className="dropdown-item-desc">{r.desc}</span>}
                    </span>
                  </a>
              )}
            </div>
            <div className="dp-divider" />
            <div className="dp-resources-right">
              <div className="dp-section-label">Company</div>
              {RESOURCES_COMPANY.map(r => (
                <a key={r.label} href={r.href} className="dropdown-item dp-item-icon dp-compact">
                  <span className="dp-icon dp-icon-sm">{r.icon}</span>
                  <span className="dropdown-item-label">{r.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="navbar-wrap">
      <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <a href="/" className="navbar-logo">
            <img src="./favicon.svg" alt="Blogy" width="28" height="28" />
            <span>Blogy</span>
          </a>

          {/* Desktop Nav — centred */}
          <nav className="navbar-nav">
            <ProductsDropdown />
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="nav-link">{link.label}</a>
            ))}
            <ResourcesDropdown />
          </nav>

          {/* CTAs */}
          <div className="navbar-actions">
            <button
              className="dark-toggle"
              onClick={() => setDark && setDark(!dark)}
              aria-label="Toggle dark mode"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <a href="https://dashboard.blogy.in/login" className="btn-ghost-nav">Sign In</a>
            <a href="https://dashboard.blogy.in/signup" className="btn-primary-nav">Get Started</a>
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {mobileOpen
                ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <div className="mobile-section">
              <div className="mobile-heading">Products</div>
              {PRODUCTS.map(p => p.internal
                ? <Link key={p.label} to={p.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{p.label}</Link>
                : <a key={p.label} href={p.href} className="mobile-link">{p.label}</a>
              )}
            </div>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{link.label}</a>
            ))}
            <div className="mobile-section">
              <div className="mobile-heading">Resources</div>
              {[...RESOURCES_LEARN, ...RESOURCES_EXPLORE, ...RESOURCES_COMPANY].map(r =>
                r.internal
                  ? <Link key={r.label} to={r.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{r.label}</Link>
                  : <a key={r.label} href={r.href} className="mobile-link">{r.label}</a>
              )}
            </div>
            <div className="mobile-ctas">
              <button className="dark-toggle dark-toggle--mobile" onClick={() => setDark && setDark(!dark)}>
                {dark ? <SunIcon /> : <MoonIcon />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
              <a href="https://dashboard.blogy.in/login" className="btn-ghost-nav w-full">Sign In</a>
              <a href="https://dashboard.blogy.in/signup" className="btn-primary-nav w-full">Get Started Free</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
