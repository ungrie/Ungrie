import { Play } from 'lucide-react';
import { WhatsAppMockup } from './WhatsAppMockup';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    // Changed to a warm off-white background
    <section className="pt-28 md:pt-32 pb-16 md:pb-20 px-6 lg:px-8 relative overflow-hidden bg-[#FFFCF8]">
      {/* Background Gradient Orbs - Softened for the warm theme */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-amber-100/50 rounded-full blur-3xl -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#25D366]/10 rounded-full blur-3xl -z-10" 
      />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center text-center lg:text-left">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-stone-900 leading-[1.1] tracking-tight">
                Turn WhatsApp into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#25D366] to-[#128C7E]">ordering system</span>
              </h1>
              <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                No commissions. No apps. Just direct orders from the app your customers already use.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <button className="px-6 py-3.5 md:px-8 md:py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-95">
                Start Free Trial
              </button>
              <button className="px-6 py-3.5 md:px-8 md:py-4 bg-white text-stone-900 rounded-xl font-bold hover:bg-stone-50 transition-all border border-stone-200 flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-md active:scale-95 group">
                {/* Amber accent on the play button */}
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Play className="w-4 h-4 text-amber-600 ml-0.5" fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex justify-center lg:justify-start gap-6 md:gap-8 pt-6 md:pt-8 border-t border-stone-200/60 mt-8"
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-stone-900">15%</div>
                <div className="text-xs md:text-sm text-stone-500 font-medium">Commission Saved</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-stone-900">2.5x</div>
                <div className="text-xs md:text-sm text-stone-500 font-medium">More Repeat Orders</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-stone-900">100%</div>
                <div className="text-xs md:text-sm text-stone-500 font-medium">Data Yours</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - WhatsApp Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center lg:justify-end mt-8 lg:mt-0"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <WhatsAppMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}