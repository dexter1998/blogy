import './Hero.css';

const BG_CHARS = [
  { c: 'Z',  t: 7,  l: 2  }, { c: 'W',  t: 19, l: 5  }, { c: 'L',  t: 33, l: 1  },
  { c: 'E',  t: 47, l: 4  }, { c: 'C',  t: 60, l: 2  }, { c: 'R',  t: 73, l: 5  },
  { c: 'T',  t: 85, l: 1  }, { c: 'B',  t: 94, l: 3  },
  { c: 'H',  t: 6,  l: 13 }, { c: 'M',  t: 20, l: 11 }, { c: 'X',  t: 35, l: 15 },
  { c: 'Q',  t: 50, l: 12 }, { c: 'V',  t: 65, l: 14 }, { c: 'N',  t: 79, l: 11 },
  { c: 'P',  t: 91, l: 13 },
  { c: 'A',  t: 10, l: 24 }, { c: 'F',  t: 26, l: 22 }, { c: 'Y',  t: 43, l: 27 },
  { c: 'J',  t: 59, l: 23 }, { c: 'K',  t: 75, l: 26 }, { c: 'D',  t: 89, l: 22 },
  { c: 'O',  t: 4,  l: 37 }, { c: 'G',  t: 96, l: 39 },
  { c: 'S',  t: 4,  l: 61 }, { c: 'T',  t: 97, l: 63 },
  { c: 'Z',  t: 9,  l: 73 }, { c: 'W',  t: 24, l: 76 }, { c: 'L',  t: 40, l: 72 },
  { c: 'E',  t: 56, l: 75 }, { c: 'C',  t: 71, l: 73 }, { c: 'H',  t: 85, l: 76 },
  { c: 'M',  t: 95, l: 72 },
  { c: 'X',  t: 7,  l: 84 }, { c: 'Q',  t: 21, l: 88 }, { c: 'V',  t: 36, l: 85 },
  { c: 'N',  t: 52, l: 89 }, { c: 'P',  t: 67, l: 86 }, { c: 'A',  t: 81, l: 89 },
  { c: 'F',  t: 93, l: 84 },
  { c: 'Y',  t: 5,  l: 94 }, { c: 'J',  t: 17, l: 97 }, { c: 'K',  t: 31, l: 95 },
  { c: 'D',  t: 46, l: 98 }, { c: 'O',  t: 61, l: 94 }, { c: 'G',  t: 76, l: 97 },
  { c: 'S',  t: 89, l: 95 },
  { c: 'TB', t: 14, l: 32 }, { c: 'HM', t: 28, l: 35 }, { c: 'CE', t: 44, l: 31 },
  { c: 'GS', t: 60, l: 34 }, { c: 'VW', t: 76, l: 32 },
  { c: 'EH', t: 12, l: 54 }, { c: 'XQ', t: 30, l: 58 }, { c: 'NP', t: 48, l: 55 },
  { c: 'TB', t: 66, l: 57 }, { c: 'WL', t: 82, l: 54 },
];

const LOGOS = [
  { name: 'elia',          cls: 'logo-elia'     },
  { name: 'InsuranceHub',  cls: 'logo-insurance'},
  { name: 'TokPortal',     cls: 'logo-tokportal'},
  { name: 'legal family',  cls: 'logo-legal'    },
];

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Scattered letter background */}
      <div className="hero-bg" aria-hidden="true">
        {BG_CHARS.map(({ c, t, l }, i) => (
          <span key={i} className="hero-letter" style={{ top: `${t}%`, left: `${l}%` }}>
            {c}
          </span>
        ))}
      </div>

      <div className="container hero-container">
        {/* Badge */}
        <div className="hero-badge animate-fade-up">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1699 0.58575C14.9429-0.19525 13.7499-0.19525 13.5229 0.58575L13.2029 1.69275C12.5109 4.07875 11.5669 5.94175 8.99994 6.58375L7.80794 6.88175C7.43 6.96 7.18 7.28 7.18 7.64675C7.18 8.01 7.43 8.33 7.80794 8.41175L8.99994 8.70975C11.5669 9.35275 12.5109 11.2157 13.2029 13.6007L13.5229 14.7078C13.7499 15.4897 14.9429 15.4897 15.1699 14.7078L15.4899 13.6007C16.1819 11.2157 17.1269 9.35275 19.6939 8.71075L20.8839 8.41175C21.2619 8.32675 21.5117 8.01 21.5117 7.64675C21.5117 7.28 21.2619 6.96 20.8839 6.88175L19.6939 6.58375C17.1269 5.94175 16.1819 4.07875 15.4899 1.69375L15.1699 0.58575Z" fill="url(#g1)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.283 11.8368C5.147 11.3488 4.431 11.3488 4.296 11.8368L4.103 12.5288C3.688 14.0188 3.122 15.1838 1.581 15.5858L0.867 15.7718C0.525 15.855 0.488 16.1 0.488 16.2498C0.488 16.4 0.525 16.645 0.867 16.7278L1.581 16.9148C3.121 17.3158 3.688 18.4808 4.103 19.9708L4.296 20.6628C4.431 21.1518 5.147 21.1518 5.283 20.6628L5.476 19.9708C5.890 18.4808 6.458 17.3158 7.998 16.9148L8.712 16.7278C9.054 16.645 9.091 16.4 9.091 16.2498C9.091 16.1 9.054 15.855 8.712 15.7718L7.998 15.5858C6.458 15.1848 5.890 14.0198 5.476 12.5288L5.283 11.8368Z" fill="url(#g2)"/>
            <defs>
              <linearGradient id="g1" x1="7.18" y1="0" x2="21.51" y2="15.29" gradientUnits="userSpaceOnUse"><stop stopColor="#2dd4bf"/><stop offset="1" stopColor="#0d9488"/></linearGradient>
              <linearGradient id="g2" x1="9.09" y1="11.47" x2="0.49" y2="21.03" gradientUnits="userSpaceOnUse"><stop stopColor="#14b8a6"/><stop offset="1" stopColor="#0f766e"/></linearGradient>
            </defs>
          </svg>
          <span>Most Powerful SEO Growth Engine</span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline animate-fade-up delay-1">
          <span className="text-gradient">Rank #1</span> on<br />
          Google &amp; ChatGPT
        </h1>

        {/* Subtext */}
        <p className="hero-sub animate-fade-up delay-2">
          Scale your organic traffic 100% automatically<br />
          with AI-driven, auto-published SEO blog articles.
        </p>

        {/* CTAs */}
        <div className="hero-ctas animate-fade-up delay-2">
          <a href="https://dashboard.blogy.in" target="_blank" rel="noopener noreferrer" className="hero-btn-google">
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Join with Google
          </a>
          <a href="https://dashboard.blogy.in" target="_blank" rel="noopener noreferrer" className="hero-btn-primary">
            Start for free
          </a>
        </div>

        {/* Social proof */}
        <div className="hero-proof animate-fade-up delay-3">
          <div className="avatars">
            {['T', 'A', 'B'].map((l, i) => (
              <div key={i} className="avatar">{l}</div>
            ))}
          </div>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill="#f59e0b">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span>150+ customers satisfied</span>
          </div>
        </div>

        {/* Logo strip */}
        <div className="hero-logos animate-fade-up delay-4">
          {LOGOS.map(({ name, cls }) => (
            <span key={name} className={`logo-item ${cls}`}>{name}</span>
          ))}
        </div>

        {/* Video demo */}
        <div className="hero-video animate-fade-up delay-4">
          <div className="hero-video-glow" />
          <div className="hero-video-frame">
            <iframe
              title="Blogy Demo"
              width="100%"
              height="100%"
              loading="lazy"
              src="https://www.youtube.com/embed/9CANRnnWG9k?rel=0&modestbranding=1"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
