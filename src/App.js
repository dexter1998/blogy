import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ProblemSolution from './components/ProblemSolution';
import GetDiscovered from './components/GetDiscovered';
import Languages from './components/Languages';
import EverythingYouNeed from './components/EverythingYouNeed';
import HowItWorks from './components/HowItWorks';
import BlogyEffect from './components/BlogyEffect';
import SampleBlogs from './components/SampleBlogs';
import Integrations from './components/Integrations';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Blogs from './components/Blogs';
import AsSeenOn from './components/AsSeenOn';
import FAQ from './components/FAQ';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import NotFound from './components/NotFound';
import { AnalyticsTracker } from './lib/analytics';

const StartupNamesHub = lazy(() => import('./pages/StartupNamesHub'));
const StartupNamesCategory = lazy(() => import('./pages/StartupNamesCategory'));
const StartupNameGenerator = lazy(() => import('./pages/StartupNameGenerator'));

function RouteLoader() {
  return (
    <main className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '120px 0 80px' }}>
      <div style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>Loading…</div>
    </main>
  );
}

function LandingPage() {
  return (
    <main>
      <SEOHead
        title="Blogy — Rank #1 on Google & ChatGPT with AI Blog Posts"
        description="Blogy writes SEO-optimized blog posts that rank on Google and AI search engines. Start your first 10 posts free."
        path="/"
      />
      <Hero />
      <Marquee />
      <ProblemSolution />
      <GetDiscovered />
      <Languages />
      <EverythingYouNeed />
      <HowItWorks />
      <BlogyEffect />
      <SampleBlogs />
      <Integrations />
      <Testimonials />
      <Pricing />
      <Blogs />
      <AsSeenOn />
      <FAQ />
      <CTABanner />
    </main>
  );
}

function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Navbar dark={dark} setDark={setDark} />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/startup-names" element={<StartupNamesHub />} />
            <Route path="/startup-names/:slug" element={<StartupNamesCategory />} />
            <Route path="/startup-name-generator" element={<StartupNameGenerator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
