import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { Features } from './Features';
import { SaiSection } from './SaiSection';
import { Portfolio } from './Portfolio';
import { Comparison } from './Comparison';
import { CTA } from './CTA';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
    return (
        <div className="landing-mode min-h-screen bg-amber-50">
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
};

export default LandingPage;
