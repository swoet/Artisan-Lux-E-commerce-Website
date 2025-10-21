export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <main className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-start">
        <div className="aspect-square w-full rounded-lg border border-white/10 bg-white/10 animate-pulse" />
        <section>
          <div className="h-10 w-2/3 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-6 w-1/3 bg-white/10 rounded mb-8 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
