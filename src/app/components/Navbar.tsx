import { MessageSquare, Menu, X, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <MessageSquare className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-900 tracking-tighter">
              UNGRIE
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-bold text-stone-600 hover:text-orange-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            {/* Swapped Trial Button for Login */}
            <a 
              href="https://tasty-flbj1a845-daredevildd7s-projects.vercel.app/" 
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Login
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-stone-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-bold text-stone-900"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="https://tasty-flbj1a845-daredevildd7s-projects.vercel.app/" 
                className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 text-white rounded-xl font-bold"
              >
                <LogIn className="w-5 h-5" />
                Login
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}