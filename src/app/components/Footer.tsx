import { MessageSquare, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-stone-200 py-12 px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Changed from 4 columns to 3 columns for a cleaner layout */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900 tracking-tight">Ungrie</span>
            </div>
            <p className="text-stone-500 text-sm">
              Turn WhatsApp into your ordering system. No commissions, just direct orders.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-stone-900 font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                {/* Added Login Link Here */}
                <a href="https://ungrie.com/login" className="text-stone-500 hover:text-orange-600 text-sm transition-colors font-medium">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal (Merged since Company was removed) */}
          <div>
            <h4 className="text-stone-900 font-semibold mb-4">Support & Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:ungrie.com@gmail.com" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-stone-500 hover:text-orange-600 text-sm transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm">
            © {new Date().getFullYear()} Ungrie. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/ungrie_com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 text-stone-500 transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/ungrie"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 text-stone-500 transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/ungrie.co"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 text-stone-500 transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/ungrie"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 text-stone-500 transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}