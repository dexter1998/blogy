import './Testimonials.css';

const QUOTES = [
  {
    q: "Blogy ships more SEO in a week than our agency did in six months. Traffic is up 4x — I check the dashboard like it's a game.",
    name: 'Arjun Mehta', role: 'Founder, Loopwear', tint: 'var(--teal-600)',
  },
  {
    q: 'We went from 300 to 12,000 monthly organic visits without hiring a writer. ROI was positive in month two.',
    name: 'Riya Shah', role: 'Head of Growth, Paperform', tint: '#f97316',
  },
  {
    q: "The LLM-ready formatting is the killer feature. We're getting cited by ChatGPT for branded queries now.",
    name: 'Sameer Kulkarni', role: 'CEO, OrbitCRM', tint: '#059669',
  },
  {
    q: "Finally a tool that understands Indian SaaS buyers. Pricing that doesn't assume I'm a US Series-B.",
    name: 'Meghna Iyer', role: 'Solo founder, Brewline', tint: '#3b82f6',
  },
  {
    q: 'Programmatic SEO used to be a moat. Blogy makes it a checkbox. 800 pages live by week 3.',
    name: 'Devansh Raj', role: 'CTO, Frameshift', tint: '#ec4899',
  },
  {
    q: 'Replaced two freelancers and a content ops hire. Margin went up, output doubled. Zero drama.',
    name: 'Nikita Bose', role: 'COO, Sprout Labs', tint: '#0891b2',
  },
];

export default function Testimonials() {
  return (
    <section className="tm-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Loved by founders</span>
          <h2 className="section-title">
            Teams shipping SEO <em>without a content team.</em>
          </h2>
          <p className="section-sub">
            500+ founders use Blogy to stop thinking about SEO — and start ranking.
          </p>
        </div>

        <div className="tm-grid">
          {QUOTES.map((q, i) => (
            <div key={i} className="tm-card">
              <div className="tm-stars">★★★★★</div>
              <p className="tm-quote">"{q.q}"</p>
              <div className="tm-author">
                <div className="tm-avatar" style={{ background: q.tint }}>
                  {q.name[0]}
                </div>
                <div>
                  <div className="tm-name">{q.name}</div>
                  <div className="tm-role">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
