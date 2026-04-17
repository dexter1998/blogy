import './Hero.css';

export default function Hero() {
  return (
    <section id="home" className="hero">
      {/* Background blobs */}
      <div className="hero-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
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
          Automate your{' '}
          <span className="text-teal">Blogs</span>{' '}
          in one click<br />
          with Intelligent{' '}
          <span className="text-teal">SEO Growth Engine</span>
        </h1>

        {/* Subtext */}
        <p className="hero-sub animate-fade-up delay-2">
          SEO-optimized blogs, published automatically for your niche.<br />
          Grow your startup while you sleep.
        </p>

        {/* Social proof */}
        <div className="hero-proof animate-fade-up delay-2">
          <div className="avatars">
            {['T','A','B'].map((l,i) => (
              <div key={i} className="avatar">{l}</div>
            ))}
          </div>
          <div className="stars">
            {[...Array(5)].map((_,i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill="#f59e0b"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            ))}
            <span>150+ customers satisfied</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-ctas animate-fade-up delay-3">
          <a href="https://dashboard.blogy.in" target="_blank" rel="noopener noreferrer" className="hero-btn-primary">
            Start For Free
          </a>
          <a href="https://dashboard.blogy.in" target="_blank" rel="noopener noreferrer" className="hero-btn-outline">
            Get Demo
          </a>
        </div>

        {/* Trust tags */}
        <div className="hero-trust animate-fade-up delay-4">
          <span>✓ Free Demo</span>
          <span>✓ No Credit Card Required</span>
          <span>✓ Cancel Anytime</span>
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
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
