export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a1a10] to-[#1a0f08] text-white">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-12 w-1/2 bg-white/10 rounded animate-pulse mb-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 border border-white/10 rounded-lg bg-white/5 animate-pulse">
              <div className="aspect-square w-full mb-4 rounded-md bg-white/10" />
              <div className="h-5 w-2/3 bg-white/10 rounded mb-2" />
              <div className="h-4 w-1/3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
