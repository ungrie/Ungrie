import { MessageSquare, Bell, UserCheck, CreditCard, BarChart3, Zap } from 'lucide-react';
import { motion } from 'motion/react'; // Using the motion library from your package.json

export function FeaturesSection() {
  const features = [
    { icon: MessageSquare, title: 'WhatsApp Ordering', description: 'Customers order directly via WhatsApp - the app they already use daily.' },
    { icon: Bell, title: 'Real-time Alerts', description: 'Get instant notifications for new orders, with all details organized.' },
    { icon: UserCheck, title: 'Customer Retention', description: 'Build a database of customers you own. Send offers and drive repeat orders.' },
    { icon: CreditCard, title: 'Integrated Payments', description: 'Accept payments seamlessly through WhatsApp Pay or other integrations.' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track orders, revenue, customer behavior, and peak times in one place.' },
    { icon: Zap, title: 'AI-Powered Automation', description: 'Smart bots handle orders 24/7, reducing manual work and errors.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 } // Staggers the animation of the cards
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" as const } }
  };

  return (
    <section id="features" className="py-16 md:py-20 px-6 lg:px-8 bg-stone-50 overflow-hidden border-y border-stone-200/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Everything you need to run orders on WhatsApp
          </h2>
          <p className="text-lg md:text-xl text-gray-600 px-4">
            Turn conversations into revenue with powerful features built for restaurants.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-[#25D366]/30 transition-colors group hover:shadow-xl"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 md:mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}