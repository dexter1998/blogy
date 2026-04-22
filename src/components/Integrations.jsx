import './Integrations.css';

const PLATFORMS = [
  { name: 'WordPress',     color: '#21759B', g: 'WP' },
  { name: 'Webflow',       color: '#4353FF', g: 'Wf' },
  { name: 'Shopify',       color: '#95BF47', g: 'S'  },
  { name: 'Notion',        color: '#18181b', g: 'N'  },
  { name: 'HubSpot',       color: '#FF7A59', g: 'H'  },
  { name: 'Zapier',        color: '#FF4A00', g: 'Z'  },
  { name: 'Make',          color: '#6D00CC', g: 'M'  },
  { name: 'Airtable',      color: '#18BFFF', g: 'At' },
  { name: 'Ghost',         color: '#15171A', g: 'G'  },
  { name: 'Wix',           color: '#FAAD00', g: 'W'  },
  { name: 'Slack',         color: '#4A154B', g: 'S'  },
  { name: 'Google Sheets', color: '#34A853', g: 'GS' },
  { name: 'Medium',        color: '#18181b', g: 'M'  },
  { name: 'Contentful',    color: '#2478CC', g: 'Ct' },
  { name: 'Webhooks',      color: '#6366f1', g: '{}' },
  { name: 'REST API',      color: '#0d9488', g: '</>' },
];

export default function Integrations() {
  return (
    <section id="integrations" className="int-section">
      <div className="container">
        <div className="int-layout">
          {/* Left */}
          <div className="int-left">
            <span className="int-label">Integrations</span>
            <h2 className="int-heading">
              Seamless <em>publishing</em><br />to your stack
            </h2>
            <p className="int-desc">
              Push to your CMS, sync data, or automate workflows. Connect Blogy to the tools your team already uses — setup takes under 5 minutes.
            </p>
            <a
              href="https://dashboard.blogy.in/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="int-cta"
            >
              Start for Free →
            </a>
          </div>

          {/* Right — pill grid */}
          <div className="int-pills">
            {PLATFORMS.map((p, i) => (
              <div key={i} className="int-pill">
                <span className="int-pill-icon" style={{ background: p.color }}>{p.g}</span>
                <span className="int-pill-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
