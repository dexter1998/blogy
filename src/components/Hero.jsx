import { useState, useEffect } from 'react';
import './Hero.css';

const SI = 'https://cdn.simpleicons.org';

const KEYWORDS = [
  { kw: 'ai content marketing',   vol: '12K' },
  { kw: 'seo automation tools',   vol: '8.4K' },
  { kw: 'llm search optimization',vol: '3.1K' },
  { kw: 'programmatic seo guide', vol: '5.7K' },
  { kw: 'ai blog writer india',   vol: '2.8K' },
];

const AI_LOGOS = [
  { src: '/logos/chatgpt.png',    name: 'ChatGPT',    local: true },
  { src: '/logos/claude.png',     name: 'Claude',     local: true },
  { src: '/logos/perplexity.png', name: 'Perplexity', local: true },
  { name: 'Gemini', slug: 'googlegemini', bg: 'linear-gradient(135deg, #4285F4 0%, #EA4335 100%)', local: false },
];

const AVATARS = [
  { label: 'A', bg: '#0d9488' },
  { label: 'S', bg: '#f97316' },
  { label: 'R', bg: '#3b82f6' },
  { label: 'N', bg: '#7c3aed' },
];

const FULL_TEXT =
  'optimizes for both Google SERPs and conversational AI answers from ChatGPT, Claude and Perplexity';

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Hero() {
  const [sel, setSel] = useState(1);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    setTyped('');
    const id = setInterval(() => {
      i++;
      setTyped(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [sel]);

  const title = KEYWORDS[sel].kw.replace(/\b\w/g, c => c.toUpperCase()) + ': The 2026 Playbook';

  return (
    <section id="home" className="hero">
      {/* dot-grid background */}
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="container hero-container">
        {/* Badge */}
        <div className="hero-badge animate-fade-up">
          <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1699 0.58575C14.9429-0.19525 13.7499-0.19525 13.5229 0.58575L13.2029 1.69275C12.5109 4.07875 11.5669 5.94175 8.99994 6.58375L7.80794 6.88175C7.43 6.96 7.18 7.28 7.18 7.64675C7.18 8.01 7.43 8.33 7.80794 8.41175L8.99994 8.70975C11.5669 9.35275 12.5109 11.2157 13.2029 13.6007L13.5229 14.7078C13.7499 15.4897 14.9429 15.4897 15.1699 14.7078L15.4899 13.6007C16.1819 11.2157 17.1269 9.35275 19.6939 8.71075L20.8839 8.41175C21.2619 8.32675 21.5117 8.01 21.5117 7.64675C21.5117 7.28 21.2619 6.96 20.8839 6.88175L19.6939 6.58375C17.1269 5.94175 16.1819 4.07875 15.4899 1.69375L15.1699 0.58575Z" fill="var(--teal-500)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.283 11.8368C5.147 11.3488 4.431 11.3488 4.296 11.8368L4.103 12.5288C3.688 14.0188 3.122 15.1838 1.581 15.5858L0.867 15.7718C0.525 15.855 0.488 16.1 0.488 16.2498C0.488 16.4 0.525 16.645 0.867 16.7278L1.581 16.9148C3.121 17.3158 3.688 18.4808 4.103 19.9708L4.296 20.6628C4.431 21.1518 5.147 21.1518 5.283 20.6628L5.476 19.9708C5.890 18.4808 6.458 17.3158 7.998 16.9148L8.712 16.7278C9.054 16.645 9.091 16.4 9.091 16.2498C9.091 16.1 9.054 15.855 8.712 15.7718L7.998 15.5858C6.458 15.1848 5.890 14.0198 5.476 12.5288L5.283 11.8368Z" fill="var(--teal-400)"/>
          </svg>
          AI-native SEO for founders
        </div>

        {/* Headline */}
        <h1 className="hero-headline animate-fade-up delay-1">
          <span className="text-gradient">Rank&nbsp;#1</span> on<br />
          Google &amp;{' '}
          <span className="logo-spinner" aria-hidden="true">
            <span className="logo-spinner-track">
              {AI_LOGOS.map((logo, i) => (
                <span key={i} className="logo-spinner-slide" style={{ animationDelay: `${i * 3}s` }}>
                  {logo.local
                    ? <img src={logo.src} alt={logo.name} width="56" height="56" decoding="async" style={{ width: '78%', height: '78%', objectFit: 'contain', borderRadius: 14 }} />
                    : <span style={{ width: '72%', height: '72%', background: logo.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '18%' }}>
                        <img src={`${SI}/${logo.slug}/white`} alt={logo.name} width="40" height="40" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </span>
                  }
                </span>
              ))}
            </span>
          </span>
          {' '}AI Search
        </h1>

        {/* Sub */}
        <p className="hero-sub animate-fade-up delay-2">
          Starts at <strong>₹0 / month</strong>. Blogy's AI writes, optimizes and
          publishes SEO blogs to your site — on autopilot.
        </p>

        {/* CTAs */}
        <div className="hero-ctas animate-fade-up delay-2">
          <a
            href="https://dashboard.blogy.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn-google"
            data-analytics-event="cta_click_hero,cta_click_any"
            data-analytics-source="hero_google"
          >
            {GOOGLE_ICON} Join with Google
          </a>
          <a
            href="https://dashboard.blogy.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn-primary"
            data-analytics-event="cta_click_hero,cta_click_any"
            data-analytics-source="hero_primary"
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>

        {/* Social proof */}
        <div className="hero-proof animate-fade-up delay-3">
          <div className="avatars">
            {AVATARS.map((avatar, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`avatar av${i + 1}`}
                style={{ background: avatar.bg, color: '#fff' }}
              >
                {avatar.label}
              </span>
            ))}
          </div>
          <div>
            <div className="stars">★★★★★</div>
            <div className="proof-sub">Trusted by 500+ founders &amp; teams</div>
          </div>
        </div>

        {/* Editor demo */}
        <div className="hero-editor animate-fade-up delay-4">
          {/* Chrome bar */}
          <div className="editor-chrome">
            <div className="editor-dots">
              <span /><span /><span />
            </div>
            <div className="editor-url">app.blogy.in / studio / new-post</div>
            <span className="editor-live">● live</span>
          </div>

          {/* Body: sidebar + content */}
          <div className="editor-body">
            {/* Keyword sidebar */}
            <aside className="editor-sidebar">
              <div className="sidebar-label">Keywords · this topic</div>
              {KEYWORDS.map((k, i) => (
                <button
                  key={i}
                  className={`kw-row ${sel === i ? 'active' : ''}`}
                  onClick={() => setSel(i)}
                >
                  <span className="kw-text">{k.kw}</span>
                  <span className="kw-vol">{k.vol}</span>
                </button>
              ))}
            </aside>

            {/* Content pane */}
            <div className="editor-content">
              <div className="editor-pills">
                <span className="pill pill-accent">SEO score · 94</span>
                <span className="pill">1,480 words</span>
                <span className="pill">Readability · A</span>
                <span className="pill">Internal links · 7</span>
              </div>
              <div className="editor-title">{title}</div>
              <div className="editor-body-text">
                <p>
                  <span className="hl">Blogy</span> is a publishing engine that{' '}
                  {typed}<span className="cursor" />
                </p>
                <p className="editor-ghost">Section 2 · Why search behavior is changing in the era of AI answers…</p>
              </div>
              <div className="editor-status">
                <span className="status-dot" />
                Auto-publishing to Shopify in 00:04:12
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
