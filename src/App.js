import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
const Deck = lazy(() => import('./pages/Deck'));
const InvestorLanding = lazy(() => import('./pages/InvestorLanding'));

function RouteLoader() {
  return (
    <main className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '120px 0 80px' }}>
      <div style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>Loading…</div>
    </main>
  );
}

function DeferredBlock({ children, size = '840px' }) {
  return (
    <div className="deferred-block" style={{ '--deferred-size': size }}>
      {children}
    </div>
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
      <DeferredBlock size="920px">
        <EverythingYouNeed />
      </DeferredBlock>
      <DeferredBlock size="860px">
        <HowItWorks />
      </DeferredBlock>
      <DeferredBlock size="900px">
        <BlogyEffect />
      </DeferredBlock>
      <DeferredBlock size="980px">
        <SampleBlogs />
      </DeferredBlock>
      <DeferredBlock size="760px">
        <Integrations />
      </DeferredBlock>
      <DeferredBlock size="760px">
        <Testimonials />
      </DeferredBlock>
      <DeferredBlock size="1120px">
        <Pricing />
      </DeferredBlock>
      <DeferredBlock size="720px">
        <Blogs />
      </DeferredBlock>
      <DeferredBlock size="520px">
        <AsSeenOn />
      </DeferredBlock>
      <DeferredBlock size="860px">
        <FAQ />
      </DeferredBlock>
      <DeferredBlock size="420px">
        <CTABanner />
      </DeferredBlock>
    </main>
  );
}

function AppShell({ dark, setDark }) {
  const location = useLocation();
  const isDeck = location.pathname === '/deck' || location.pathname === '/alternative-landingpage';

  return (
    <>
      <AnalyticsTracker />
      {!isDeck && <Navbar dark={dark} setDark={setDark} />}
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/startup-names" element={<StartupNamesHub />} />
          <Route path="/startup-names/:slug" element={<StartupNamesCategory />} />
          <Route path="/startup-name-generator" element={<StartupNameGenerator />} />
          <Route path="/deck" element={<Deck />} />
          <Route path="/alternative-landingpage" element={<InvestorLanding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isDeck && <Footer />}
      <Analytics />
      <SpeedInsights />
    </>
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
        <AppShell dark={dark} setDark={setDark} />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
