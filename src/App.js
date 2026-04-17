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

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Integrations />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}

export default App;
