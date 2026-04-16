import { MessageCircle, Cpu, ChefHat, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function HowItWorksSection() {
  const steps = [
    { icon: MessageCircle, title: 'Customer Messages', description: 'Customer sends a WhatsApp message to your business number.' },
    { icon: Cpu, title: 'AI Takes Order', description: 'Our AI bot understands the order, confirms items, and collects details.' },
    { icon: ChefHat, title: 'Restaurant Fulfills', description: 'You receive the order instantly and prepare for delivery or pickup.' },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 px-6 lg:px-8 bg-[#FFFCF8]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            How it works
          </h2>
          <p className="text-xl text-stone-600">
            Get started in minutes. No complex setup required.
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                {/* Animated Connecting Line */}
                {index < steps.length - 1 && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: "80%", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index * 0.2) + 0.4, duration: 0.8 }}
                    className="hidden md:block absolute top-12 left-[60%] h-[3px] bg-gradient-to-r from-[#25D366] to-transparent rounded-full"
                  >
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-600" />
                  </motion.div>
                )}

                <div className="bg-[#FFFCF8] border border-stone-200 rounded-3xl p-8 transition-all relative z-10 hover:shadow-xl hover:-translate-y-2 duration-300">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#25D366]/20">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-amber-500 mb-2 tracking-wide uppercase">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-600 leading-relaxed font-medium">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}