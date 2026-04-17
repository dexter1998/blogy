import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const PRODUCTS = [
  { label: 'Auto Blogging', href: 'https://dashboard.blogy.in', desc: 'Fully automated blog publishing' },
  { label: 'SEO Growth Engine', href: 'https://dashboard.blogy.in', desc: 'AI-powered keyword ranking' },
  { label: 'Topic Discovery', href: 'https://dashboard.blogy.in', desc: 'Find high-intent topics automatically' },
  { label: 'Programmatic SEO', href: 'https://dashboard.blogy.in', desc: 'Scale to thousands of pages' },
];

const INTEGRATIONS = [
  { label: 'Shopify', href: 'https://dashboard.blogy.in' },
  { label: 'WordPress', href: 'https://dashboard.blogy.in' },
  { label: 'Webflow', href: 'https://dashboard.blogy.in' },
  { label: 'Wix', href: 'https://dashboard.blogy.in' },
  { label: 'Custom Website', href: 'https://dashboard.blogy.in' },
];

const INDUSTRIES = [
  { label: 'E-Commerce', href: 'https://dashboard.blogy.in' },
  { label: 'SaaS & Tech', href: 'https://dashboard.blogy.in' },
  { label: 'Healthcare', href: 'https://dashboard.blogy.in' },
  { label: 'Education', href: 'https://dashboard.blogy.in' },
  { label: 'Finance', href: 'https://dashboard.blogy.in' },
  { label: 'Real Estate', href: 'https://dashboard.blogy.in' },
  { label: 'Travel & Hospitality', href: 'https://dashboard.blogy.in' },
  { label: 'Legal & Professional', href: 'https://dashboard.blogy.in' },
];

const RESOURCES = [
  { label: 'Blog & News', href: './pages/blogs.html' },
  { label: 'Help Center', href: '#' },
  { label: 'Roadmap', href: '#' },
  { label: 'Changelog', href: '#' },
  { label: 'API Docs', href: '#' },
];

function Dropdown({ label, items, wide }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="nav-dropdown" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="nav-link nav-dropdown-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {label}
        <svg className={`nav-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className={`dropdown-panel ${wide ? 'wide' : ''}`}>
          {items}
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
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <img src="./favicon.svg" alt="Blogy" width="30" height="30" />
          <span>Blogy</span>
        </a>

        {/* Desktop Nav */}
        <nav className="navbar-nav">
          <Dropdown label="Products" items={
            <div className="dropdown-grid">
              {PRODUCTS.map(p => (
                <a key={p.label} href={p.href} className="dropdown-item rich">
                  <span className="dropdown-item-label">{p.label}</span>
                  <span className="dropdown-item-desc">{p.desc}</span>
                </a>
              ))}
            </div>
          } />
          <Dropdown label="Integrations" items={
            <div className="dropdown-list">
              {INTEGRATIONS.map(i => (
                <a key={i.label} href={i.href} className="dropdown-item">{i.label}</a>
              ))}
            </div>
          } />
          <Dropdown label="Industries" items={
            <div className="dropdown-list two-col">
              {INDUSTRIES.map(i => (
                <a key={i.label} href={i.href} className="dropdown-item">{i.label}</a>
              ))}
            </div>
          } wide />
          <a href="/#pricing" className="nav-link">Pricing</a>
          <Dropdown label="Resources" items={
            <div className="dropdown-list">
              {RESOURCES.map(r => (
                <a key={r.label} href={r.href} className="dropdown-item">{r.label}</a>
              ))}
            </div>
          } />
        </nav>

        {/* CTA */}
        <div className="navbar-actions">
          <a href="https://dashboard.blogy.in/login" className="btn-ghost">Sign In</a>
          <a href="https://dashboard.blogy.in/signup" className="btn-primary">Get Started</a>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-section">
            <div className="mobile-heading">Products</div>
            {PRODUCTS.map(p => <a key={p.label} href={p.href} className="mobile-link">{p.label}</a>)}
          </div>
          <div className="mobile-section">
            <div className="mobile-heading">Integrations</div>
            {INTEGRATIONS.map(i => <a key={i.label} href={i.href} className="mobile-link">{i.label}</a>)}
          </div>
          <div className="mobile-section">
            <div className="mobile-heading">Industries</div>
            {INDUSTRIES.map(i => <a key={i.label} href={i.href} className="mobile-link">{i.label}</a>)}
          </div>
          <div className="mobile-section">
            <div className="mobile-heading">Resources</div>
            {RESOURCES.map(r => <a key={r.label} href={r.href} className="mobile-link">{r.label}</a>)}
          </div>
          <a href="/#pricing" className="mobile-link">Pricing</a>
          <div className="mobile-ctas">
            <a href="https://dashboard.blogy.in/login" className="btn-ghost w-full">Sign In</a>
            <a href="https://dashboard.blogy.in/signup" className="btn-primary w-full">Get Started Free</a>
          </div>
        </div>
      )}
    </header>
  );
}
