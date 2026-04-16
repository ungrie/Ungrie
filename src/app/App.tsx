import { useState, useEffect } from 'react';

// Import your landing page components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SocialProof } from './components/SocialProof';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';

// Import your new Legal Pages
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookiePolicy } from './components/CookiePolicy';

export default function App() {
  // 1. Create a state to track the current URL hash
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  // 2. Listen for URL changes
  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash;
      setCurrentPath(newHash);
      
      // ONLY jump to the top if opening a legal page or going back to home.
      // Otherwise, let the browser scroll to the #features or #pricing section!
      if (newHash === '#privacy' || newHash === '#terms' || newHash === '#cookies' || newHash === '') {
        window.scrollTo(0, 0); 
      }
    };
    
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 3. The Router: If the URL matches a legal page, render ONLY that page
  if (currentPath === '#privacy') return <PrivacyPolicy />;
  if (currentPath === '#terms') return <TermsOfService />;
  if (currentPath === '#cookies') return <CookiePolicy />;

  // 4. Default: Render the full Landing Page
  return (
    <div className="font-sans text-stone-900 bg-white selection:bg-orange-200 selection:text-orange-900">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}