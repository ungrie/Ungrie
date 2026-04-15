import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { SocialProof } from "./components/SocialProof";
import { StatsSection } from "./components/StatsSection";
import { ProblemSection } from "./components/ProblemSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { ProductDemoSection } from "./components/ProductDemoSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { PricingSection } from "./components/PricingSection";
import { CTASection } from "./components/CTASection";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";

export default function App() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <StatsSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ProductDemoSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <FAQSection />
      <Footer />
      <BackToTop />
    </div>
  );
}