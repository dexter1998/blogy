import './Languages.css';

const LANGS = [
  { flag: '🇬🇧', name: 'English' },
  { flag: '🇪🇸', name: 'Spanish' },
  { flag: '🇫🇷', name: 'French' },
  { flag: '🇩🇪', name: 'German' },
  { flag: '🇮🇹', name: 'Italian' },
  { flag: '🇵🇹', name: 'Portuguese' },
  { flag: '🇨🇳', name: 'Chinese' },
  { flag: '🇯🇵', name: 'Japanese' },
  { flag: '🇰🇷', name: 'Korean' },
  { flag: '🇸🇦', name: 'Arabic' },
  { flag: '🇮🇳', name: 'Hindi' },
  { flag: '🇷🇺', name: 'Russian' },
];

const STATS = [
  { value: '50+', label: 'Supported Languages' },
  { value: 'Native', label: 'Quality Output' },
  { value: 'SEO', label: 'Optimized for All' },
];

export default function Languages() {
  return (
    <section className="lang-section">
      <div className="container">
        <div className="lang-header">
          <span className="lang-label">Global Reach</span>
          <h2 className="lang-heading">
            Create Content in <em>50+ Languages</em>
          </h2>
          <p className="lang-sub">
            Reach global audiences with native-quality, SEO-optimized content in any language.
          </p>
        </div>

        <div className="lang-grid">
          {LANGS.map((l, i) => (
            <div key={i} className="lang-item">
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.name}</span>
            </div>
          ))}
        </div>

        <div className="lang-strip">
          <div className="lang-stats">
            {STATS.map((s, i) => (
              <div key={i} className="lang-stat">
                <div className="lang-stat-value">{s.value}</div>
                <div className="lang-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="lang-note">
            Every AI article is optimized for search engines in the target language, with proper cultural context and regional keyword targeting.
          </p>
        </div>
      </div>
    </section>
  );
}
