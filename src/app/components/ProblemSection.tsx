import { TrendingDown, Users, ShieldAlert } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: TrendingDown,
      title: 'High Commissions',
      description: 'Food delivery apps charge 15-30% commission on every order, eating into your margins.',
    },
    {
      icon: Users,
      title: 'No Customer Ownership',
      description: 'You never own customer data. Every order could be their last with you.',
    },
    {
      icon: ShieldAlert,
      title: 'Zero Brand Loyalty',
      description: 'Customers browse by cuisine, not by your brand. You\'re just another option.',
    },
  ];

  return (
    <section className="py-16 md:py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            Food delivery apps are killing your business
          </h2>
          <p className="text-xl text-stone-600">
            It's time to take back control and build direct relationships with your customers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-[#25D366]/30 transition-all hover:scale-105 hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <problem.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">{problem.title}</h3>
              <p className="text-stone-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}