export default function Testimonials() {
  const items = [
    {
      quote: "Exceptional quality. The craftsmanship is unmatched and worth every penny.",
      author: "Amara K.",
      role: "Verified Buyer",
    },
    {
      quote: "The unboxing felt like an experience. Fast delivery and beautiful finishing.",
      author: "Jonas R.",
      role: "Collector",
    },
    {
      quote: "Finally a store that respects artisans and gives luxury the attention it deserves.",
      author: "Lina M.",
      role: "Designer",
    },
  ];

  return (
    <section aria-labelledby="testimonials" className="mt-28">
      <h2 id="testimonials" className="text-3xl md:text-4xl font-serif text-center">
        Loved by our <span className="bg-gradient-to-r from-[#b87333] to-[#cd7f32] bg-clip-text text-transparent">customers</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {items.map((t, i) => (
          <figure key={i} className="p-8 border border-white/10 rounded-xl bg-white/5">
            <div className="text-[#cd7f32]">★★★★★</div>
            <blockquote className="mt-4 text-neutral-200 leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-sm text-neutral-400">
              <span className="font-semibold text-white">{t.author}</span> — {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
