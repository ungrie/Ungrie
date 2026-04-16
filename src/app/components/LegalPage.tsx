import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Show the "Back to Top" button only when the user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] py-16 md:py-24 px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <a 
          href="#" 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>
        
        {/* Document Header */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">
            {title}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Last Updated: {lastUpdated}
          </div>
        </div>
        
        {/* The Magic Readability Wrapper! 
          This uses Tailwind's arbitrary variants to perfectly style the raw HTML 
          you pasted into the other files, ensuring maximum readability.
        */}
        <div className="
          bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200/60
          [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-12 [&>h3]:mb-4 [&>h3]:tracking-tight [&>h3:first-child]:mt-0
          [&>p]:text-lg [&>p]:text-stone-600 [&>p]:leading-relaxed [&>p]:mb-6
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul]:space-y-3
          [&>ul>li]:text-lg [&>ul>li]:text-stone-600 [&>ul>li]:leading-relaxed
          [&>ul>li>strong]:text-stone-900 [&>p>strong]:text-stone-900
          [&>a]:text-orange-600 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-orange-700
        ">
          {children}
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 bg-white border border-stone-200 text-stone-600 rounded-full shadow-lg hover:text-orange-600 hover:border-orange-200 transition-all duration-300 z-50 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}