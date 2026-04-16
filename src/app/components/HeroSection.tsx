import { ArrowDown, Calendar } from 'lucide-react';
import { WhatsAppMockup } from './WhatsAppMockup';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    // Removed horizontal padding here so the mockup can touch the very edge
    <section className="pt-28 md:pt-32 pb-16 md:pb-20 relative overflow-hidden bg-white bg-[radial-gradient(#fed7aa_1px,transparent_1px)] [background-size:20px_20px]">
      
      {/* Background Gradient Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-orange-400/20 rounded-full blur-3xl -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl -z-10" 
      />
      
      {/* Container - Added min-height so the absolutely positioned phone doesn't overflow the section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative min-h-[680px] flex items-center">
        
        {/* Left Content (Text & CTAs) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full lg:w-[55%] space-y-6 md:space-y-8 text-center lg:text-left z-10 py-12"
        >
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Accepting New Restaurants
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-stone-900 leading-[1.1] tracking-tight">
              Turn WhatsApp into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">ordering system</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              No commissions. No apps. Just direct orders from the app your customers already use.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
            {/* Primary Calendly Link */}
            <a 
              href="https://calendly.com/ungrie-com/30min" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 md:px-8 md:py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-600/30 active:scale-95 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book a Setup Call
            </a>
            
            {/* Secondary Discovery Button */}
            <a 
              href="#pricing"
              className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-stone-900 rounded-xl font-bold hover:bg-orange-50 transition-all border border-orange-200 flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-md active:scale-95 group cursor-pointer"
            >
              View Pricing
              <ArrowDown className="w-4 h-4 text-orange-600 group-hover:translate-y-1 transition-transform" strokeWidth={3} />
            </a>
          </div>
          
          <p className="text-sm font-medium text-stone-500 mt-4">
            Free 30-minute consultation • No commitment required
          </p>
        </motion.div>

        {/* Right Content - DESKTOP ONLY (Absolutely positioned to the right edge) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 xl:-translate-x-8 z-0 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-auto"
          >
            <WhatsAppMockup />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Content - MOBILE ONLY (Normal flow, stacked below text) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="lg:hidden mt-12 px-6 flex justify-center w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <WhatsAppMockup />
        </motion.div>
      </motion.div>

    </section>
  );
}