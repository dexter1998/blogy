import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { trackEvent } from '../lib/analytics';

export default function NotFound() {
  useEffect(() => {
    trackEvent(
      'error_404',
      { source: 'route_not_found' },
      { onceKey: `error_404:${window.location.pathname}` }
    );
  }, []);

  return (
    <main className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '120px 0 80px' }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <p className="section-label">404</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 24 }}>
          The page you are looking for does not exist or may have moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary-nav">Go Home</Link>
          <Link to="/startup-names" className="btn-ghost-nav">Browse Startup Names</Link>
        </div>
      </div>
    </main>
  );
}

