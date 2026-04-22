import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Features',     href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing',      href: '/#pricing' },
  { label: 'FAQ',          href: '/#faq' },
];

const PRODUCTS = [
  { label: 'Auto Blogging',     href: 'https://dashboard.blogy.in', desc: 'Fully automated blog publishing' },
  { label: 'SEO Growth Engine', href: 'https://dashboard.blogy.in', desc: 'AI-powered keyword ranking' },
  { label: 'Topic Discovery',   href: 'https://dashboard.blogy.in', desc: 'Find high-intent topics automatically' },
  { label: 'Programmatic SEO',  href: 'https://dashboard.blogy.in', desc: 'Scale to thousands of pages' },
];

const RESOURCES = [
  { label: 'Blog & News', href: '#' },
  { label: 'Help Center', href: '#' },
  { label: 'Roadmap',     href: '#' },
  { label: 'Changelog',   href: '#' },
  { label: 'API Docs',    href: '#' },
];

function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const show = () => { clearTimeout(timerRef.current); setOpen(true); };
  const hide = () => { timerRef.current = setTimeout(() => setOpen(false), 80); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="nav-dropdown" onMouseEnter={show} onMouseLeave={hide}>
      <button className={`nav-link nav-dropdown-toggle ${open ? 'active' : ''}`} aria-expanded={open}>
        {label}
        <svg className={`nav-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="dropdown-panel" onMouseEnter={show} onMouseLeave={hide}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
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
            <img src="./favicon.svg" alt="Blogy" width="26" height="26" />
            <span>Blogy</span>
          </a>

          {/* Desktop Nav */}
          <nav className="navbar-nav">
            <Dropdown label="Products">
              <div className="dropdown-grid">
                {PRODUCTS.map(p => (
                  <a key={p.label} href={p.href} className="dropdown-item rich">
                    <span className="dropdown-item-label">{p.label}</span>
                    <span className="dropdown-item-desc">{p.desc}</span>
                  </a>
                ))}
              </div>
            </Dropdown>

            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="nav-link">{link.label}</a>
            ))}

            <Link to="/startup-names" className="nav-link nav-link-highlight">Startup Names</Link>

            <Dropdown label="Resources">
              <div className="dropdown-list">
                {RESOURCES.map(r => (
                  <a key={r.label} href={r.href} className="dropdown-item">{r.label}</a>
                ))}
              </div>
            </Dropdown>
          </nav>

          {/* CTAs */}
          <div className="navbar-actions">
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
              {PRODUCTS.map(p => <a key={p.label} href={p.href} className="mobile-link">{p.label}</a>)}
            </div>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{link.label}</a>
            ))}
            <Link to="/startup-names" className="mobile-link" onClick={() => setMobileOpen(false)}>Startup Names</Link>
            <div className="mobile-section">
              <div className="mobile-heading">Resources</div>
              {RESOURCES.map(r => <a key={r.label} href={r.href} className="mobile-link">{r.label}</a>)}
            </div>
            <div className="mobile-ctas">
              <a href="https://dashboard.blogy.in/login" className="btn-ghost-nav w-full">Sign In</a>
              <a href="https://dashboard.blogy.in/signup" className="btn-primary-nav w-full">Get Started Free</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
