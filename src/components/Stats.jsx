import './Stats.css';

const STATS = [
  { value: '85%', label: 'Time Saved Per Blog', desc: 'From 6-8 hours manually → under 10 minutes setup with Blogy', color: '#0d9488' },
  { value: '3x', label: 'Better ROI', desc: 'Improved marketing ROI vs traditional methods', color: '#ec4899' },
  { value: '10X', label: 'Publishing Speed', desc: 'Compared to traditional workflows', color: '#3b82f6' },
  { value: '70%', label: 'Cost Reduction', desc: 'Vs. hiring freelance writers or marketing agencies', color: '#8b5cf6' },
  { value: '24/7', label: 'Autonomous Publishing', desc: 'Blogs generated and scheduled without human intervention', color: '#10b981' },
  { value: '3x', label: 'Higher Organic ROI', desc: 'Compounding traffic without increasing spend', color: '#f97316' },
];

export default function Stats() {
  return (
    <section id="facts" className="stats-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">The Numbers <span className="text-teal">Don't Lie</span></h2>
          <p className="section-sub">See how Blogy transforms content marketing with measurable results</p>
        </div>
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-icon" style={{ background: `linear-gradient(135deg, ${s.color}22, ${s.color}11)` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
