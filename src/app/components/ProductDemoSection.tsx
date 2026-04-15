import { Check, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export function ProductDemoSection() {
  // Animation variants for the staggered chat messages
  const chatContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.5, delayChildren: 0.2 }
    }
  };

  const messageRight = {
    hidden: { opacity: 0, x: 20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  const messageLeft = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left - WhatsApp Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-2xl">
              <div className="bg-[#E5DDD5] rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-300/50">
                  <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-xs font-bold text-white">
                    JD
                  </div>
                  <div>
                    <div className="text-gray-900 text-sm font-semibold">John Doe</div>
                    <div className="text-xs text-gray-600">Online</div>
                  </div>
                </div>

                {/* Animated Messages */}
                <motion.div 
                  variants={chatContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  <motion.div variants={messageRight} className="flex justify-end">
                    <div className="bg-[#DCF8C6] text-gray-900 px-3 py-2 rounded-lg rounded-tr-sm text-sm max-w-[80%] shadow-sm">
                      I want 2 Chicken Burgers
                    </div>
                  </motion.div>
                  
                  <motion.div variants={messageLeft} className="flex justify-start">
                    <div className="bg-white text-gray-900 px-3 py-2 rounded-lg rounded-tl-sm text-sm max-w-[80%] shadow-sm">
                      Great choice! 🍔
                      <br />2x Chicken Burger = $24.00
                      <br />Confirm order?
                    </div>
                  </motion.div>
                  
                  <motion.div variants={messageRight} className="flex justify-end">
                    <div className="bg-[#DCF8C6] text-gray-900 px-3 py-2 rounded-lg rounded-tr-sm text-sm shadow-sm">
                      Yes, please!
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right - Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-gray-900 font-bold text-xl mb-1">Incoming Orders</h3>
                <p className="text-gray-500 text-sm">Real-time order dashboard</p>
              </div>

              {/* Order Cards */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, type: "spring" }} // Animates in right after the last chat message!
                  className="bg-stone-50 border-2 border-[#25D366] rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-gray-900 font-bold">Order #12848</div>
                      <div className="text-sm text-gray-500 font-medium">John Doe</div>
                    </div>
                    <div className="bg-[#25D366]/20 text-[#25D366] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                      New Order
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700 mb-4 font-medium">
                    <div>2x Chicken Burger</div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Just now</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-900 font-bold text-lg">
                      <DollarSign className="w-4 h-4 text-[#25D366]" />
                      <span>24.00</span>
                    </div>
                  </div>
                </motion.div>

                <div className="bg-stone-50 border border-gray-200 rounded-xl p-4 opacity-70">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-gray-900 font-semibold">Order #12847</div>
                      <div className="text-sm text-gray-500">Sarah Smith</div>
                    </div>
                    <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Completed
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div>1x Margherita Pizza</div>
                    <div>1x Caesar Salad</div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>45 min ago</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>30.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}