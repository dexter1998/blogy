import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Integrations from './components/Integrations';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTABanner from './components/CTABanner';
import Footer from './components/Footer';
import StartupNamesHub from './pages/StartupNamesHub';
import StartupNamesCategory from './pages/StartupNamesCategory';
import SEOHead from './components/SEOHead';

function LandingPage() {
  return (
    <main>
      <SEOHead
        title="Blogy — Rank #1 on Google & ChatGPT with AI Blog Posts"
        description="Blogy writes SEO-optimized blog posts that rank on Google and AI search engines. Start your first 10 posts free."
        path="/"
      />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Integrations />
      <Pricing />
      <FAQ />
      <CTABanner />
    </main>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/startup-names" element={<StartupNamesHub />} />
          <Route path="/startup-names/:slug" element={<StartupNamesCategory />} />
        </Routes>
        <Footer />
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
