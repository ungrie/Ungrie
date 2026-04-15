import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export function FAQSection() {
  const faqs = [
    {
      question: 'How does Ungrie work with WhatsApp?',
      answer:
        'Ungrie integrates with WhatsApp Business API to enable automated order taking. When customers message your business number, our AI-powered bot handles the conversation, takes orders, and sends them to your dashboard in real-time.',
    },
    {
      question: 'Do I need a special WhatsApp account?',
      answer:
        'Yes, you\'ll need a WhatsApp Business API account, which is different from the regular WhatsApp Business app. We help you set this up during onboarding - it typically takes 1-2 business days.',
    },
    {
      question: 'Can I customize the bot responses?',
      answer:
        'Absolutely! You can customize greetings, menu items, pricing, delivery areas, and more through our dashboard. The bot learns from your preferences and adapts to your business needs.',
    },
    {
      question: 'What payment methods are supported?',
      answer:
        'We integrate with major payment providers including Stripe, PayPal, and local payment gateways. You can also enable cash on delivery or send payment links directly through WhatsApp.',
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
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Ungrie
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white border border-gray-200 rounded-xl px-6 data-[state=open]:border-[#25D366]/30"
            >
              <AccordionTrigger className="text-left text-gray-900 hover:text-[#25D366] py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}