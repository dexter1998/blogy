import './Integrations.css';

const PLATFORMS = [
  { name: 'Shopify', color: '#95BF47', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 109 124" fill="#95BF47" width="32" height="32"><path d="M74.7,14.8c0,0-1.4,0.4-3.7,1.1c-0.4-1.3-1-2.8-1.8-4.4c-2.6-5-6.5-7.7-11.1-7.7c0,0,0,0,0,0c-0.3,0-0.6,0-1,0.1c-0.1-0.2-0.3-0.3-0.4-0.5c-2-2.2-4.6-3.2-7.7-3.1c-6,0.2-12,4.5-16.8,12.2c-3.4,5.4-6,12.2-6.7,17.5c-6.9,2.1-11.7,3.6-11.8,3.7c-3.5,1.1-3.6,1.2-4,4.5C9.3,41,0,111.5,0,111.5l75.6,13.1V14.6C75.1,14.7,74.9,14.7,74.7,14.8z"/><path d="M109,105.5L97.2,14.8c-0.1-0.9-0.9-1.5-1.8-1.4l-19.8,0v110.2L109,105.5z" fill="#5E8E3E"/></svg>
  },
  { name: 'WordPress', color: '#21759B', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#21759B"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 19.542c-5.267 0-9.542-4.275-9.542-9.542S6.733 2.458 12 2.458s9.542 4.275 9.542 9.542-4.275 9.542-9.542 9.542z"/><path d="M2.893 12c0 3.875 2.254 7.217 5.523 8.817L3.616 8.91A9.497 9.497 0 002.893 12zm15.642-0.47c0-1.212-.435-2.052-.808-2.706-.496-.808-1.018-1.491-1.018-2.3 0-.901.682-1.74 1.643-1.74.043 0 .085.005.126.008A9.522 9.522 0 0012 2.458c-3.33 0-6.266 1.71-7.99 4.303.225.007.435.011.616.011 1.003 0 2.556-.121 2.556-.121.516-.03.578.727.063.789 0 0-.52.061-1.1.091l3.497 10.401 2.102-6.3-1.494-4.1c-.516-.03-1.005-.091-1.005-.091-.516-.03-.456-.82.06-.789 0 0 1.587.121 2.529.121.003 0 .007 0 .01 0 1.003 0 2.558-.121 2.558-.121.517-.03.578.727.062.789 0 0-.52.06-1.099.091l3.47 10.322.958-3.198c.415-1.329.732-2.283.732-3.106zM12.166 12.9l-2.88 8.375a9.547 9.547 0 005.35-.139.844.844 0 01-.067-.131L12.166 12.9zm7.359-4.851c.043.314.067.653.067 1.018 0 1.004-.188 2.13-.75 3.545l-3.013 8.713A9.527 9.527 0 0021.107 12c0-1.41-.305-2.749-.843-3.96z"/></svg>
  },
  { name: 'Webflow', color: '#4353FF', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#4353FF"><path d="M17.803 5.112l-4.248 12.552-2.91-7.498L13.8 7.44h-3.168L6 18.888h3.024l1.248-3.816 2.928 7.44 5.256-15.96H24L17.803 5.112zm-9.24 3.024L5.472 18.912H2.424L.264 7.44H3.36l1.224 8.16 2.976-7.464h1.003z"/></svg>
  },
  { name: 'Wix', color: '#FAAD00', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#FAAD00"><path d="M10.07 7.89c-.55.28-1.03.68-1.44 1.19L7.1 12.65l-1.55-4.76H3.39l2.66 8.22h1.72l2.3-4.17c.1-.19.22-.29.34-.29s.24.1.34.29l2.3 4.17h1.72l2.66-8.22h-2.16l-1.55 4.76-1.53-3.57c-.41-.51-.89-.91-1.44-1.19zm10.28.61c-.28-.28-.63-.42-1.03-.42-.41 0-.76.14-1.03.42-.28.28-.42.62-.42 1.02v6.96h2.09V9.52c0-.4-.14-.74-.42-1.02h.81z"/></svg>
  },
  { name: 'Custom Site', color: '#6366f1', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#6366f1" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
  },
  { name: 'Ghost', color: '#15171A', href: 'https://dashboard.blogy.in',
    icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="#15171A"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.136 0 7.5 3.364 7.5 7.5 0 1.46-.42 2.817-1.143 3.97l1.143 1.03H12L9.857 19.5h-.714l-2.143-2.5H5.5v-2.5h1.5v-5h1.5v5h1.5V9h1.5v5h1.5V9h1.5v6H12c-2.071 0-3.75-1.679-3.75-3.75 0-2.072 1.679-3.75 3.75-3.75z"/></svg>
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="integrations-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Works With Your <span className="text-teal">Existing Stack</span></h2>
          <p className="section-sub">Connect Blogy to your favorite CMS and publish automatically — no technical setup needed.</p>
        </div>
        <div className="integrations-grid">
          {PLATFORMS.map((p, i) => (
            <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className="integration-card" style={{ '--accent': p.color }}>
              <div className="int-icon">{p.icon}</div>
              <div className="int-name">{p.name}</div>
              <div className="int-badge">Connect</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
