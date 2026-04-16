import { Calendar } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-stone-900 relative overflow-hidden">
      {/* Background ambient glow matching your theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Ready to take control of your orders?
        </h2>
        <p className="text-lg md:text-xl text-stone-400 mb-10 max-w-2xl mx-auto">
          Join hundreds of restaurants saving thousands on commissions every month. We'll set everything up for you.
        </p>

        {/* The Calendly Link Button */}
        <a
          href="https://calendly.com/ungrie-com/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-600/30 active:scale-95 text-lg"
        >
          <Calendar className="w-5 h-5" />
          Book a Demo
        </a>
      </div>
    </section>
  );
}