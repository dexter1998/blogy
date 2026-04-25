import { useState, useEffect } from 'react';
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
import StartupNamesHub from './pages/StartupNamesHub';
import StartupNamesCategory from './pages/StartupNamesCategory';
import StartupNameGenerator from './pages/StartupNameGenerator';
import SEOHead from './components/SEOHead';
import NotFound from './components/NotFound';
import { AnalyticsTracker } from './lib/analytics';

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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/startup-names" element={<StartupNamesHub />} />
          <Route path="/startup-names/:slug" element={<StartupNamesCategory />} />
          <Route path="/startup-name-generator" element={<StartupNameGenerator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
