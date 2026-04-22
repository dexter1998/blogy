import './GetDiscovered.css';

const SEARCH_ENGINES = [
  {
    name: 'Google Search',
    desc: 'Top search engine globally',
    icon: (
      <svg viewBox="0 0 48 48" width="26" height="26">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
  },
  {
    name: 'Bing Search',
    desc: 'Microsoft search platform',
    icon: (
      <span className="gd-icon-letter" style={{ background: '#0078d4' }}>B</span>
    ),
  },
  {
    name: 'Yahoo Search',
    desc: 'Alternative search engine',
    icon: (
      <span className="gd-icon-letter" style={{ background: '#7b0099' }}>Y</span>
    ),
  },
];

const AI_PLATFORMS = [
  {
    name: 'ChatGPT',
    desc: 'Leading AI assistant',
    icon: (
      <svg width="24" height="24" viewBox="0 0 41 41" fill="none">
        <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.247-3.592 10.079 10.079 0 0 0-11.847 4.964 9.964 9.964 0 0 0-6.685 3.377 10.079 10.079 0 0 0-1.339 11.725 9.964 9.964 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.247 3.592 10.078 10.078 0 0 0 11.847-4.965 9.965 9.965 0 0 0 6.685-3.376 10.079 10.079 0 0 0 1.339-11.726zm-25.134 8.6a3.733 3.733 0 0 1-2.405-.872l.084-.048 3.992-2.304a.658.658 0 0 0 .33-.576v-5.631l1.688.974v4.621a3.741 3.741 0 0 1-3.689 3.836z" fill="#10a37f"/>
      </svg>
    ),
  },
  {
    name: 'Perplexity',
    desc: 'AI-powered answer engine',
    icon: (
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="20" fill="#1c1c2e"/>
        <path d="M50 10 L25 30 L50 30 L50 50 L25 50 L25 90 L37 90 L37 62 L63 62 L63 90 L75 90 L75 50 L50 50 L50 30 L75 30 Z" fill="#20c5b5"/>
        <path d="M18 30 L50 12 L82 30" stroke="#20c5b5" strokeWidth="4" fill="none"/>
      </svg>
    ),
  },
  {
    name: 'Claude',
    desc: "Anthropic's AI assistant",
    icon: (
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="22" fill="#D97757"/>
        <path d="M30 62 L42 28 L50 28 L62 62 L55 62 L52 54 L40 54 L37 62 Z M42 47 L50 47 L46 35 Z M66 62 L66 28 L72 28 L72 62 Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Gemini',
    desc: "Google's AI model",
    icon: (
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="50%" stopColor="#9168C0"/>
            <stop offset="100%" stopColor="#E94335"/>
          </linearGradient>
        </defs>
        <path d="M50 8 C52 32 68 48 92 50 C68 52 52 68 50 92 C48 68 32 52 8 50 C32 48 48 32 50 8 Z" fill="url(#gg)"/>
      </svg>
    ),
  },
];

const STATS = [
  { value: '10+', label: 'Search engines & AI platforms' },
  { value: '99%', label: 'Human-quality content' },
  { value: '24/7', label: 'Content discovery' },
];

export default function GetDiscovered() {
  return (
    <section className="gd-section">
      <div className="container">
        {/* Section header */}
        <div className="gd-header">
          <span className="gd-label">Visibility</span>
          <h2 className="gd-heading">
            Get Discovered Everywhere<br />
            People Search
          </h2>
          <p className="gd-sub">
            Create content that ranks on traditional search engines and gets cited by the latest AI chatbots.
          </p>
        </div>

        {/* Two columns */}
        <div className="gd-cols">
          <div className="gd-col">
            <div className="gd-col-label">
              <span className="gd-col-dot" style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-400))' }} />
              Rank on Search Engines
            </div>
            {SEARCH_ENGINES.map((e, i) => (
              <div key={i} className="gd-item">
                <div className="gd-item-icon">{e.icon}</div>
                <div>
                  <div className="gd-item-name">{e.name}</div>
                  <div className="gd-item-desc">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="gd-col">
            <div className="gd-col-label">
              <span className="gd-col-dot" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }} />
              Cited by AI Assistants
            </div>
            {AI_PLATFORMS.map((p, i) => (
              <div key={i} className="gd-item">
                <div className="gd-item-icon">{p.icon}</div>
                <div>
                  <div className="gd-item-name">{p.name}</div>
                  <div className="gd-item-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="gd-stats">
          {STATS.map((s, i) => (
            <div key={i} className="gd-stat">
              <div className="gd-stat-value">{s.value}</div>
              <div className="gd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
