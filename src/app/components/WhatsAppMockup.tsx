import { Check } from 'lucide-react';

export function WhatsAppMockup() {
  return (
    <div className="relative w-full max-w-sm">
      {/* Phone Frame */}
      <div className="bg-gray-200 rounded-[3rem] p-3 border border-gray-300 shadow-2xl">
        {/* Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-[#25D366]">U</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">Ungrie</div>
              <div className="text-white/80 text-xs">Online</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="bg-stone-50 px-4 py-6 space-y-3 min-h-[500px]">
            {/* Customer Message */}
            <div className="flex justify-end">
              <div className="bg-[#25D366] text-white px-4 py-2 rounded-lg rounded-tr-sm max-w-[80%]">
                <p className="text-sm">Hi! I'd like to order</p>
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-4 py-2 rounded-lg rounded-tl-sm max-w-[85%] shadow-sm border border-gray-200">
                <p className="text-sm">
                  Welcome! 👋 I'm here to take your order.
                  <br /><br />
                  What would you like to order today?
                </p>
              </div>
            </div>

            {/* Customer Order */}
            <div className="flex justify-end">
              <div className="bg-[#25D366] text-white px-4 py-2 rounded-lg rounded-tr-sm max-w-[80%]">
                <p className="text-sm">1 Margherita Pizza (Large)</p>
                <p className="text-sm">1 Caesar Salad</p>
              </div>
            </div>

            {/* Bot Confirmation */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-4 py-2.5 rounded-lg rounded-tl-sm max-w-[85%] space-y-2 shadow-sm border border-gray-200">
                <p className="text-sm font-semibold">Order Summary:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>1x Margherita Pizza (L)</span>
                    <span>$18.00</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>1x Caesar Salad</span>
                    <span>$12.00</span>
                  </div>
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex justify-between gap-4 font-semibold text-[#25D366]">
                      <span>Total</span>
                      <span>$30.00</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Reply with your delivery address to confirm ✅
                </p>
              </div>
            </div>

            {/* Customer Address */}
            <div className="flex justify-end">
              <div className="bg-[#25D366] text-white px-4 py-2 rounded-lg rounded-tr-sm max-w-[80%]">
                <p className="text-sm">123 Main Street, Apt 4B</p>
              </div>
            </div>

            {/* Final Confirmation */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-4 py-2.5 rounded-lg rounded-tl-sm max-w-[85%] shadow-sm border border-gray-200">
                <p className="text-sm">
                  Perfect! Your order is confirmed 🎉
                  <br /><br />
                  Estimated delivery: 30-40 mins
                  <br />
                  Order #12847
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <span>Delivered</span>
                  <Check className="w-3 h-3 text-[#25D366]" />
                  <Check className="w-3 h-3 text-[#25D366] -ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#25D366]/20 to-[#25D366]/5 blur-3xl -z-10 rounded-full" />
    </div>
  );
}