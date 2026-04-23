import './GetDiscovered.css';

const SI = 'https://cdn.simpleicons.org';

const SEARCH_ENGINES = [
  { name: 'Google Search',  desc: "World's #1 search engine",    src: '/logos/google.svg', bg: '#fff'    },
  { name: 'Bing',           desc: "Microsoft's search engine",   slug: 'bing',             bg: '#f0f8ff' },
  { name: 'DuckDuckGo',     desc: 'Privacy-first search engine', slug: 'duckduckgo',       bg: '#fff4f0' },
  { name: 'Yahoo Search',   desc: 'One of the oldest engines',   slug: 'yahoo',            bg: '#f9f0ff' },
];

const AI_PLATFORMS = [
  { name: 'ChatGPT',    desc: 'Leading AI assistant',       src: '/logos/chatgpt.png',    bg: '#f0fdf9' },
  { name: 'Perplexity', desc: 'AI-powered answer engine',   src: '/logos/perplexity.png', bg: '#f5f5ff' },
  { name: 'Claude',     desc: "Anthropic's AI assistant",   src: '/logos/claude.png',     bg: '#fff7f0' },
  { name: 'Gemini',     desc: "Google's AI model",          slug: 'googlegemini',         bg: '#f0f4ff' },
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

        <div className="gd-cols">
          <div className="gd-col">
            <div className="gd-col-label">
              <span className="gd-col-dot" style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-400))' }} />
              Rank on Search Engines
            </div>
            {SEARCH_ENGINES.map((e, i) => (
              <div key={i} className="gd-item">
                <div className="gd-item-icon" style={{ background: e.bg }}>
                  <img src={e.src || `${SI}/${e.slug}`} alt={e.name} width="22" height="22" style={{ objectFit: 'contain' }} />
                </div>
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
                <div className="gd-item-icon" style={{ background: p.bg }}>
                  <img src={p.src || `${SI}/${p.slug}`} alt={p.name} width="22" height="22" style={{ objectFit: 'contain' }} />
                </div>
                <div>
                  <div className="gd-item-name">{p.name}</div>
                  <div className="gd-item-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
