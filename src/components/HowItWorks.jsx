import './HowItWorks.css';

const VIDEO_ID = '9CANRnnWG9k';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="container">
        {/* Top row — heading left, desc + CTA right */}
        <div className="hiw-top">
          <div className="hiw-left">
            <span className="hiw-label">Live Demo</span>
            <h2 className="hiw-heading">
              Watch Blogy turn a keyword into a<br />
              <em>live ranking article</em>
            </h2>
          </div>
          <div className="hiw-right">
            <p className="hiw-desc">
              See the full workflow in action — keyword research, AI writing, SEO optimization, and auto-publishing to your CMS. All in under 10 minutes.
            </p>
            <a
              href="https://dashboard.blogy.in/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="hiw-cta"
            >
              Try it yourself
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Full-width video below */}
        <div className="hiw-video-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
            title="Blogy Demo — watch how it works"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="hiw-iframe"
          />
        </div>
      </div>
    </section>
  );
}
