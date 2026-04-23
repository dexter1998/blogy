import './BlogyEffect.css';

function MiniChart({ data, color = 'var(--teal-500)' }) {
  const max = Math.max(...data);
  return (
    <div className="be-chart">
      {data.map((h, i) => (
        <div
          key={i}
          className="be-bar"
          style={{
            height: `${(h / max) * 100}%`,
            background: i === data.length - 1 ? color : `${color}44`,
          }}
        />
      ))}
    </div>
  );
}

const CARDS = [
  {
    stats: [
      { value: '15.7K', label: 'Impressions', highlight: true },
      { value: '6.42M', label: 'Total Views', highlight: true },
      { value: '0.2%', label: 'Avg CTR', highlight: false },
    ],
    chartData: [8, 12, 10, 14, 18, 16, 24, 32, 28, 38, 45, 52, 60, 70, 66, 80],
    name: 'Riya Shah',
    role: 'Head of Growth, Paperform',
    initial: 'R',
    color: '#7c3aed',
    featured: false,
  },
  {
    quote: 'The biggest visible shift: our brand started getting picked up in AI answers',
    aiCitations: { overview: 423, chatgpt: 60 },
    dr: 54,
    name: 'Aidan Cramer',
    role: 'Co Founder, aiapply.co',
    initial: 'A',
    color: '#0d9488',
    featured: true,
  },
  {
    stats: [
      { value: '5.1K', label: 'Clicks', highlight: true },
      { value: '263K', label: 'Views', highlight: true },
      { value: '1.9%', label: 'CTR', highlight: false },
    ],
    chartData: [5, 8, 6, 10, 12, 9, 15, 18, 14, 22, 28, 32, 38, 44, 52, 60],
    name: 'Sameer Kulkarni',
    role: 'CEO, OrbitCRM',
    initial: 'S',
    color: '#059669',
    featured: false,
  },
  {
    stats: [
      { value: '4.95K', label: 'Sessions', highlight: true },
      { value: '878K', label: 'Users', highlight: true },
      { value: '30.1', label: 'Position', highlight: false },
    ],
    chartData: [3, 5, 4, 6, 8, 7, 10, 9, 12, 14, 18, 22, 28, 34, 40, 48],
    name: 'Arjun Mehta',
    role: 'Founder, Loopwear',
    initial: 'A',
    color: '#f97316',
    featured: false,
  },
];

export default function BlogyEffect() {
  return (
    <section className="be-section">
      <div className="container">
        {/* Header */}
        <div className="be-header">
          <span className="be-label">Clients Success</span>
          <h2 className="be-heading">
            The Blogy <em>effect</em>
          </h2>
        </div>

        {/* Grid */}
        <div className="be-grid">
          {CARDS.map((c, i) => (
            <div key={i} className={`be-card ${c.featured ? 'be-card--featured' : ''}`}>
              {c.featured ? (
                /* Featured quote card */
                <>
                  <div className="be-ai-row">
                    <div className="be-ai-block">
                      <div className="be-ai-label">AI citations</div>
                      <div className="be-ai-values">
                        <span>AI Overview</span><strong>{c.aiCitations.overview}</strong>
                        <span style={{ marginLeft: 12 }}>ChatGPT</span><strong>{c.aiCitations.chatgpt}</strong>
                      </div>
                    </div>
                    <div className="be-dr">
                      <div className="be-dr-label">Domain Rating</div>
                      <div
                        className="be-dr-ring"
                        style={{ background: `conic-gradient(var(--teal-500) ${c.dr}%, var(--gray-200) 0)` }}
                      >
                        <div className="be-dr-inner">{c.dr}</div>
                      </div>
                    </div>
                  </div>
                  <p className="be-quote">
                    <em className="be-hl">"{c.quote}"</em>
                  </p>
                  <div className="be-author">
                    <div className="be-avatar" style={{ background: c.color }}>{c.initial}</div>
                    <div>
                      <div className="be-name">{c.name}</div>
                      <div className="be-role">{c.role}</div>
                    </div>
                    <button type="button" className="be-read">Read story →</button>
                  </div>
                </>
              ) : (
                /* Stats + chart card */
                <>
                  <div className="be-stats-row">
                    {c.stats.map((s, j) => (
                      <div
                        key={j}
                        className="be-stat-pill"
                        style={s.highlight ? { background: c.color, color: '#fff' } : {}}
                      >
                        <span className="be-pill-val">{s.value}</span>
                        <span className="be-pill-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <MiniChart data={c.chartData} color={c.color} />
                  <div className="be-author">
                    <div className="be-avatar" style={{ background: c.color }}>{c.initial}</div>
                    <div>
                      <div className="be-name">{c.name}</div>
                      <div className="be-role">{c.role}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="be-cta">
          <a href="https://dashboard.blogy.in/signup" target="_blank" rel="noopener noreferrer" className="be-btn">
            Start for Free →
          </a>
        </div>
      </div>
    </section>
  );
}
