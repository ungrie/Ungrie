import { motion } from 'motion/react';
import { Pizza, Coffee, Utensils, ChefHat, IceCream, Croissant, Flame, Sandwich } from 'lucide-react';

export function SocialProof() {
  // Mock logos combining an icon and a restaurant name
  const logos = [
    { icon: Pizza, name: 'Slice Haven' },
    { icon: Coffee, name: 'Morning Brew' },
    { icon: Utensils, name: 'The Rustic Fork' },
    { icon: ChefHat, name: 'Chef’s Corner' },
    { icon: IceCream, name: 'Gelato Spot' },
    { icon: Croissant, name: 'Parisian Bakery' },
    { icon: Flame, name: 'Grill Master' },
    { icon: Sandwich, name: 'Deli Express' },
  ];

  // We duplicate the array. Framer Motion will slide the entire container 
  // to the left by exactly 50%, and then instantly snap back to 0%. 
  // Because both halves are identical, the user never sees the snap!
  const duplicatedLogos = [...logos, ...logos];

  return (
    // Kept the white background and orange border to match the Food Delivery theme
    <section className="py-10 bg-white border-y border-orange-100 overflow-hidden relative z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 text-center">
        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          Trusted by 500+ restaurants worldwide
        </p>
      </div>

      {/* Carousel Container 
        The before: and after: classes create the white gradient fade on the edges 
      */}
      <div className="relative w-full overflow-hidden flex bg-white before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-24 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-24 after:bg-gradient-to-l after:from-white after:to-transparent">
        
        <motion.div
          className="flex items-center gap-16 md:gap-24 w-max pl-16 md:pl-24"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35, // How long it takes to do one full scroll (higher = slower)
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <logo.icon className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-stone-800 tracking-tight whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}