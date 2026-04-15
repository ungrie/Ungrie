import { TrendingUp, Users2, DollarSign, Clock } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      icon: DollarSign,
      value: '$150K+',
      label: 'Commissions Saved',
      description: 'By our restaurant partners',
    },
    {
      icon: Users2,
      value: '500+',
      label: 'Active Restaurants',
      description: 'Across 20 cities',
    },
    {
      icon: TrendingUp,
      value: '2.5x',
      label: 'Order Growth',
      description: 'Average increase in 3 months',
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Order Taking',
      description: 'AI never sleeps',
    },
  ];

  return (
    <section className="py-16 px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-[#25D366]" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}