import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const faqs = [
    {
      question: 'How does Ungrie work with WhatsApp?',
      answer:
        'Ungrie integrates with WhatsApp Business API to enable automated order taking. When customers message your business number, our AI-powered bot handles the conversation, takes orders, and sends them to your dashboard in real-time.',
    },
    {
      question: "Do my customers need to download a new app?",
      answer: "Not at all. That is the magic of Ungrie. Your customers simply send a text to your restaurant's WhatsApp number—an app they already use every single day. No downloads, no new accounts to create, and no friction."
    },
    {
      question: 'Do I need a special WhatsApp account?',
      answer:
        'Yes, you\'ll need a WhatsApp Business API account, which is different from the regular WhatsApp Business app. We help you set this up during onboarding - it typically takes 1-2 business days.',
    },
    {
      question: 'Is there a setup fee?',
      answer:
        'No setup fees. You only pay the monthly subscription based on your chosen plan. We provide free onboarding support to help you get started quickly.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your service will continue until the end of your current billing period.',
    },
    {
      question: "How do you make money if you don't charge commissions?",
      answer: "We believe restaurants should keep their hard-earned money. Instead of taking a 15-30% cut of every order like traditional delivery apps, we simply charge a flat, predictable monthly subscription fee. You keep 100% of your food sales."
    },
    {
      question: "How do I actually receive and view the orders?",
      answer: "Orders are instantly sent directly to your existing WhatsApp Business app, and they also appear in your Ungrie web dashboard. You can easily view order summaries, delivery addresses, and mark them as completed with one tap."
    },
    {
      question: "Can customers pay online through WhatsApp?",
      answer: "Yes! Ungrie automatically generates and sends secure payment links (via Stripe or PayPal) directly in the WhatsApp chat. The customer taps the link, pays with Apple Pay, Google Pay, or a card, and the bot instantly confirms the payment."
    },
    {
      question: "What happens if someone tries to order after closing time?",
      answer: "You can easily set your business hours in your dashboard. If a customer messages you after hours, the AI will politely inform them that you are currently closed, provide your regular operating hours, and let them know when they can order next."
    }
  ];

  return (
    // Using the warm off-white background to alternate with the Pricing section's pure white
    <section id="faq" className="py-16 md:py-24 px-6 lg:px-8 bg-[#FFFCF8] border-y border-stone-200/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-stone-600">
            Everything you need to know about setting up your WhatsApp ordering system.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div 
                key={index}
                initial={false}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen ? 'bg-white border-orange-200 shadow-sm' : 'bg-white border-stone-200 hover:border-orange-200'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg transition-colors duration-300 ${
                    isOpen ? 'text-orange-600' : 'text-stone-900'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isOpen ? 'bg-orange-100 text-orange-600' : 'bg-stone-50 text-stone-400'
                  }`}>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-stone-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}