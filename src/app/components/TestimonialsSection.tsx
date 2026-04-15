import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Owner, Spice Kitchen',
      image: 'RK',
      content:
        'Ungrie has completely transformed how we take orders. We saved over $3,000 in the first month just from avoiding delivery app commissions.',
      rating: 5,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Manager, Cloud Burgers Co.',
      image: 'MR',
      content:
        'The WhatsApp integration is seamless. Our customers love it because they don\'t need to download another app. Orders have increased by 40%.',
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'Co-founder, Fresh Bowl',
      image: 'DC',
      content:
        'Best decision we made this year. We now own our customer data and can directly market to them. The ROI is incredible.',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Loved by restaurant owners
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers have to say about Ungrie
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#25D366]/30 transition-all hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] font-bold">
                  {testimonial.image}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}