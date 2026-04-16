import { ArrowLeft, Video, Phone, MoreVertical, Plus, Camera, Mic, CheckCheck } from 'lucide-react';

export function WhatsAppMockup() {
  return (
    // ADDED text-left HERE: This forces all chat text to stay strictly left-aligned
    <div className="relative w-full max-w-[340px] mx-auto text-left">
      
      {/* Phone Frame */}
      <div className="bg-gray-900 rounded-[3rem] p-2.5 border-4 border-gray-800 shadow-2xl relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

        {/* Screen */}
        <div className="bg-[#efeae2] rounded-[2.5rem] overflow-hidden relative flex flex-col h-[650px]">
          
          {/* Authentic WhatsApp Header */}
          <div className="bg-[#128c7e] px-3 pt-8 pb-3 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-base font-bold text-amber-600">U</span>
              </div>
              <div className="leading-tight ml-1">
                <div className="text-[15px] font-semibold">Ungrie</div>
                <div className="text-[11px] text-white/90">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Video className="w-5 h-5 fill-current" />
              <Phone className="w-4 h-4 fill-current" />
              <MoreVertical className="w-5 h-5" />
            </div>
          </div>

          {/* Chat Messages Area with DOODLE BACKGROUND */}
          <div 
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3 relative"
            style={{
              backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '400px',
              backgroundBlendMode: 'multiply',
              opacity: 0.95
            }}
          >
            {/* Date Badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-[#d4eaf4] text-gray-600 text-[11px] px-3 py-1 rounded-lg shadow-sm">
                Today
              </span>
            </div>

            {/* Customer Message (Outgoing) */}
            <div className="flex justify-end mb-2">
              <div className="bg-[#dcf8c6] text-gray-900 px-3 py-1.5 rounded-lg rounded-tr-none max-w-[85%] shadow-sm relative">
                <p className="text-[15px] leading-snug pb-3.5 pt-0.5">Hi! I'd like to order</p>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">10:41 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Bot Response (Incoming) */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-3 py-1.5 rounded-lg rounded-tl-none max-w-[85%] shadow-sm relative">
                <p className="text-[15px] leading-snug pb-4 pt-0.5">
                  Welcome! 👋 I'm here to take your order.
                  <br /><br />
                  What would you like to order today?
                </p>
                <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">10:41 AM</span>
              </div>
            </div>

            {/* Customer Order (Outgoing) */}
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] text-gray-900 px-3 py-1.5 rounded-lg rounded-tr-none max-w-[85%] shadow-sm relative">
                <div className="text-[15px] leading-snug pb-3.5 pt-0.5">
                  <p>1 Margherita Pizza (Large)</p>
                  <p>1 Caesar Salad</p>
                </div>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Bot Confirmation (Incoming) */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-3 py-1.5 rounded-lg rounded-tl-none max-w-[85%] shadow-sm relative">
                <div className="pb-4 pt-0.5">
                  <p className="text-[15px] font-bold mb-2">Order Summary:</p>
                  <div className="space-y-1.5 text-[14px]">
                    
                    <div className="flex justify-between gap-3 items-start">
                      <span className="leading-tight text-gray-800">1x Margherita Pizza (L)</span>
                      <span className="whitespace-nowrap font-medium text-gray-700">4.50 KWD</span>
                    </div>
                    
                    <div className="flex justify-between gap-3 items-start">
                      <span className="leading-tight text-gray-800">1x Caesar Salad</span>
                      <span className="whitespace-nowrap font-medium text-gray-700">2.50 KWD</span>
                    </div>
                    
                    <div className="border-t border-gray-200 my-2 pt-1.5">
                      <div className="flex justify-between gap-3 font-extrabold text-gray-900 text-[15px]">
                        <span>Total</span>
                        <span className="whitespace-nowrap">7.00 KWD</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-2 italic">
                    Reply with your delivery address to confirm ✅
                  </p>
                </div>
                <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">10:42 AM</span>
              </div>
            </div>

            {/* Customer Address (Outgoing) */}
            <div className="flex justify-end">
              <div className="bg-[#dcf8c6] text-gray-900 px-3 py-1.5 rounded-lg rounded-tr-none max-w-[85%] shadow-sm relative">
                <p className="text-[15px] leading-snug pb-3.5 pt-0.5">123 Main Street, Apt 4B</p>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">10:43 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Final Confirmation (Incoming) */}
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-3 py-1.5 rounded-lg rounded-tl-none max-w-[85%] shadow-sm relative">
                <p className="text-[15px] leading-snug pb-4 pt-0.5">
                  Perfect! Your order is confirmed 🎉
                  <br /><br />
                  Estimated delivery: 30-40 mins
                  <br />
                  <span className="font-medium text-gray-500">Order #12847</span>
                </p>
                <span className="absolute bottom-1 right-2 text-[10px] text-gray-400">10:43 AM</span>
              </div>
            </div>
            
            <div className="h-2"></div>
          </div>

          {/* Authentic WhatsApp Input Footer */}
          <div className="bg-[#f0f2f5] p-2 flex items-end gap-2 z-10">
            <div className="flex-1 bg-white rounded-full flex items-center px-2 py-1.5 shadow-sm border border-gray-200 min-h-[40px]">
              <Plus className="w-6 h-6 text-gray-500 mx-1 cursor-pointer" />
              <div className="flex-1 px-2 text-[15px] text-gray-400">Message</div>
              <Camera className="w-5 h-5 text-gray-500 mx-1 cursor-pointer" />
            </div>
            <div className="w-10 h-10 bg-[#128c7e] rounded-full flex items-center justify-center shrink-0 shadow-sm cursor-pointer mb-0.5">
              <Mic className="w-5 h-5 text-white fill-current" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating Glow Effect */}
      <div className="absolute -inset-6 bg-gradient-to-r from-orange-400/20 to-red-500/20 blur-2xl -z-10 rounded-[4rem] pointer-events-none" />
    </div>
  );
}