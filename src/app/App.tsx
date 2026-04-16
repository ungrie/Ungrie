import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SocialProof } from './components/SocialProof';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { CTASection } from './components/CTASection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookiePolicy } from './components/CookiePolicy';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash;
      setCurrentHash(newHash);
      if (['#privacy', '#terms', '#cookies', ''].includes(newHash)) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (currentHash === '#privacy') return <PrivacyPolicy />;
  if (currentHash === '#terms') return <TermsOfService />;
  if (currentHash === '#cookies') return <CookiePolicy />;

  return (
    <div className="font-sans text-stone-900 bg-white selection:bg-orange-200 selection:text-orange-900">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <FAQSection />
      <Footer />
      <BackToTop />
    </div>
  );
}