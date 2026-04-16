import { MessageSquare, Menu, X, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

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
      // BUMPED TO z-[100] TO FORCE IT ABOVE THE HERO SECTION ORBS
      className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo - Made explicitly visible on all screens */}
          <div className="flex items-center gap-2 group cursor-pointer relative z-[101]">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <MessageSquare className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-stone-900 tracking-tighter">
              UNGRIE
            </span>
          </div>

          {/* Desktop Navigation - Forced flex layout strictly on medium screens and up */}
          <div className="hidden md:!flex items-center gap-8 relative z-[101]">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-bold text-stone-600 hover:text-orange-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-stone-900 relative z-[101]"
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
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden shadow-xl absolute top-full left-0 w-full"
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
              <button 
                onClick={() => navigate('/login')} 
                className="w-full flex items-center justify-center gap-2 py-4 bg-stone-900 text-white rounded-xl font-bold"
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}