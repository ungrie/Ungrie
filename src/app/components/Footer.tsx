import { MessageSquare, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Ungrie</span>
            </div>
            <p className="text-gray-500 text-sm">
              Turn WhatsApp into your ordering system. No commissions, just direct orders.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Ungrie. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-500 transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-500 transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-500 transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-500 transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}