import { Check, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function PricingSection() {
  const plans = [
    {
      name: 'Starter', price: '$49', period: '/month', description: 'Perfect for small restaurants',
      features: ['Up to 200 orders/month', 'WhatsApp ordering', 'Basic analytics', 'Email support', 'Payment integration'],
      highlighted: false,
    },
    {
      name: 'Growth', price: '$99', period: '/month', description: 'Most popular for growing businesses',
      features: ['Up to 1000 orders/month', 'WhatsApp ordering', 'Advanced analytics', 'Priority support', 'Payment integration', 'Custom branding', 'Marketing tools'],
      highlighted: true,
    },
    {
      name: 'Pro', price: '$199', period: '/month', description: 'For high-volume operations',
      features: ['Unlimited orders', 'WhatsApp ordering', 'Full analytics suite', '24/7 phone support', 'Payment integration', 'Custom branding', 'Marketing automation', 'API access', 'Dedicated account manager'],
      highlighted: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section id="pricing" className="py-20 md:py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            No hidden fees. No commission on orders. Just one flat monthly rate.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`relative rounded-3xl p-8 transition-shadow duration-300 ${
                plan.highlighted
                  ? 'bg-white border-2 border-[#25D366] shadow-2xl shadow-[#25D366]/20 lg:-mt-8 lg:mb-8' // Makes the popular plan pop out more on desktop
                  : 'bg-white border border-gray-200 hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{plan.price}</span>
                <span className="text-gray-500 font-medium ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 min-h-[320px]">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#25D366] stroke-[3]" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  plan.highlighted
                    ? 'bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/30'
                    : 'bg-stone-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center text-gray-500 text-sm mt-12 font-medium"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}