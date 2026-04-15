import { MessageCircle, Cpu, ChefHat, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Customer Messages',
      description: 'Customer sends a WhatsApp message to your business number.',
    },
    {
      icon: Cpu,
      title: 'AI Takes Order',
      description: 'Our AI bot understands the order, confirms items, and collects details.',
    },
    {
      icon: ChefHat,
      title: 'Restaurant Fulfills',
      description: 'You receive the order instantly and prepare for delivery or pickup.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in minutes. No complex setup required.
          </p>
        </div>

        <div className="relative">
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#25D366] to-transparent">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#25D366]/30 transition-all relative z-10 hover:shadow-lg">
                  <div className="w-16 h-16 bg-[#25D366] rounded-xl flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[#25D366] mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}