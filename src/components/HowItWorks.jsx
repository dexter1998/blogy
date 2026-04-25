import { useState } from 'react';
import './HowItWorks.css';

const VIDEO_ID = '9CANRnnWG9k';

export default function HowItWorks() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
              data-analytics-event="cta_click_any"
              data-analytics-source="how_it_works_cta"
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
          {isVideoLoaded ? (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`}
              title="Blogy Demo — watch how it works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="hiw-iframe"
            />
          ) : (
            <button
              type="button"
              className="hiw-video-poster"
              onClick={() => setIsVideoLoaded(true)}
              aria-label="Play Blogy demo video"
            >
              <div className="hiw-video-badge">Live Demo</div>
              <div className="hiw-video-copy">
                <strong>Keyword to live article in under 10 minutes</strong>
                <span>Load the demo only when someone wants to watch it.</span>
              </div>
              <span className="hiw-video-play" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
