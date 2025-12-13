import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import SaiSection from './components/SaiSection';
import Portfolio from './components/Portfolio';
import Comparison from './components/Comparison';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <HeroSection />
      <Features />
      <SaiSection />
      <Portfolio />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
