import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function PricingSection() {
  // State to track if the user has selected Annual billing
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Perfect for small restaurants',
      features: ['Up to 200 orders/month', 'WhatsApp ordering', 'Basic analytics', 'Email support', 'Payment integration'],
      highlighted: false,
    },
    {
      name: 'Growth',
      monthlyPrice: 99,
      annualPrice: 79,
      description: 'Most popular for growing businesses',
      features: ['Up to 1000 orders/month', 'WhatsApp ordering', 'Advanced analytics', 'Priority support', 'Payment integration', 'Custom branding', 'Marketing tools'],
      highlighted: true,
    },
    {
      name: 'Pro',
      monthlyPrice: 199,
      annualPrice: 159,
      description: 'For high-volume operations',
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, easeOut: true } }
  };

  return (
    <section id="pricing" className="py-16 md:py-24 px-6 lg:px-8 bg-white border-y border-stone-200/50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed">
            No hidden fees. No commission on orders. Just one flat monthly rate.
          </p>

          {/* The Animated Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-stone-900' : 'text-stone-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-orange-600 transition-transform duration-300 ease-in-out shadow-sm ${
                  isAnnual ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold transition-colors ${isAnnual ? 'text-stone-900' : 'text-stone-400'}`}>
                Annually
              </span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-extrabold text-green-700 uppercase tracking-wide">
                Save 20%
              </span>
            </div>
          </div>
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
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-white border-2 border-orange-500 shadow-2xl shadow-orange-500/20 lg:-mt-8 lg:mb-8' 
                  : 'bg-white border border-stone-200 hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                <p className="text-stone-500 text-sm h-10 font-medium">{plan.description}</p>
              </div>

              {/* Dynamic Price Display */}
              <div className="mb-6 flex flex-col">
                <div className="flex items-baseline overflow-hidden">
                  <motion.span 
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold text-stone-900 tracking-tight"
                  >
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                  <span className="text-stone-500 font-medium ml-1">/mo</span>
                </div>
                
                {/* Subtle "Billed yearly" hint that only shows on Annual */}
                <div className="h-6 mt-1 transition-opacity duration-300">
                  {isAnnual ? (
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                      Billed ${plan.annualPrice * 12} yearly
                    </span>
                  ) : (
                    <span className="text-sm text-transparent select-none">Placeholder</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 min-h-[320px]">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600 stroke-[3]" />
                    </div>
                    <span className="text-stone-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  plan.highlighted
                    ? 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30'
                    : 'bg-stone-50 text-stone-900 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Start 14-day free trial
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}