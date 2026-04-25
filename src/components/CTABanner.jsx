import './CTABanner.css';

export default function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="container">
        <div className="cta-inner">
          <div className="cta-blobs" aria-hidden="true">
            <div className="cta-blob-1"/>
            <div className="cta-blob-2"/>
          </div>
          <div className="cta-content">
            <h2 className="cta-title">Ready to grow your traffic on autopilot?</h2>
            <p className="cta-sub">Join 150+ startups already publishing SEO-optimized content automatically.</p>
            <div className="cta-buttons">
              <a
                href="https://dashboard.blogy.in/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn-main"
                data-analytics-event="cta_click_any"
                data-analytics-source="cta_banner_primary"
              >
                Start For Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a
                href="https://dashboard.blogy.in"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn-ghost"
                data-analytics-event="cta_click_any"
                data-analytics-source="cta_banner_secondary"
              >
                See Live Demo
              </a>
            </div>
            <p className="cta-note">Free forever plan • No credit card • Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}
