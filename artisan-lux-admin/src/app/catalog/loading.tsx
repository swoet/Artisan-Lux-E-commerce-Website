export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-52 bg-[var(--color-fg)]/10 rounded animate-pulse" />
      <div className="card p-6 space-y-4">
        <div className="h-7 w-40 bg-[var(--color-fg)]/10 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-[var(--color-fg)]/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="card p-6">
        <div className="h-6 w-32 bg-[var(--color-fg)]/10 rounded animate-pulse mb-4" />
        <div className="h-44 bg-[var(--color-fg)]/10 rounded animate-pulse" />
      </div>
    </div>
  );
}
