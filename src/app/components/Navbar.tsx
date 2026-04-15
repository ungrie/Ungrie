import { MessageSquare, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add a scroll listener to change the navbar styling when the user scrolls down
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
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/85 backdrop-blur-xl border-b border-gray-200 shadow-sm py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <motion.a 
            href="#" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#25D366] to-[#1da851] rounded-xl flex items-center justify-center shadow-md shadow-[#25D366]/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">Ungrie</span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group py-2"
              >
                {link.name}
                {/* Animated underline effect on hover */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#25D366] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Login
              </button>
              <button className="px-5 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#20bd5a] transition-all hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-95">
                Start Free Trial
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-semibold text-gray-700 hover:text-[#25D366] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-gray-100 my-2 w-full"></div>
              <button className="w-full py-3 text-gray-700 font-semibold bg-stone-50 rounded-xl border border-gray-200">
                Login
              </button>
              <button className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold shadow-md shadow-[#25D366]/20 active:scale-95 transition-all">
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}