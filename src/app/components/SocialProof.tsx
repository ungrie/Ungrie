export function SocialProof() {
  const logos = [
    'Restaurant A',
    'Cloud Kitchen B',
    'Bistro C',
    'Cafe D',
    'Kitchen E',
  ];

  return (
    <section className="py-12 px-6 lg:px-8 border-y border-gray-200">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-gray-500 mb-8">
          Trusted by restaurants across the country
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="text-gray-400 font-semibold text-lg hover:text-gray-600 transition-colors"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}