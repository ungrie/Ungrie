import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Rajesh Kumar', role: 'Owner, Spice Kitchen', image: 'RK', rating: 5,
      content: 'Ungrie has completely transformed how we take orders. We saved over $3,000 in the first month just from avoiding delivery app commissions.',
    },
    {
      name: 'Maria Rodriguez', role: 'Manager, Cloud Burgers Co.', image: 'MR', rating: 5,
      content: 'The WhatsApp integration is seamless. Our customers love it because they don\'t need to download another app. Orders have increased by 40%.',
    },
    {
      name: 'David Chen', role: 'Co-founder, Fresh Bowl', image: 'DC', rating: 5,
      content: 'Best decision we made this year. We now own our customer data and can directly market to them. The ROI is incredible.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 px-6 lg:px-8 bg-stone-100 border-y border-stone-200">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            Loved by restaurant owners
          </h2>
          <p className="text-xl text-stone-600">
            See what our customers have to say about Ungrie
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white border border-stone-200 rounded-3xl p-8 hover:border-amber-200 transition-colors shadow-sm hover:shadow-xl"
            >
              {/* Amber Stars for the Hospitality feel */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-stone-700 leading-relaxed mb-8 text-lg font-medium">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                  {testimonial.image}
                </div>
                <div>
                  <div className="text-stone-900 font-bold">{testimonial.name}</div>
                  <div className="text-sm text-stone-500 font-medium">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}