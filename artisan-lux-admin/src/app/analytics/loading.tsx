export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-52 bg-[var(--color-fg)]/10 rounded animate-pulse" />
      <div className="card p-6 space-y-4">
        <div className="h-7 w-40 bg-[var(--color-fg)]/10 rounded animate-pulse" />
        <div className="h-64 bg-[var(--color-fg)]/10 rounded animate-pulse" />
      </div>
    </div>
  );
}
