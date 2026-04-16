import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function CTASection() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 bg-stone-50">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white border border-stone-200 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-xl shadow-stone-200/50"
        >
          {/* Background Glows for warmth */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-100/60 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            {/* Little Amber Accent Icon */}
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
              Start getting direct orders today
            </h2>
            <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of restaurants already using Ungrie to take control of their online ordering, bypass the apps, and grow their margins.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-[#25D366]/20 inline-flex items-center gap-2"
            >
              Request Access Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <p className="text-sm text-stone-400 mt-6 font-medium">
              Takes 5 minutes to set up • No credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}