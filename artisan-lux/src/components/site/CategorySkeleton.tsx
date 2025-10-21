export default function CategorySkeleton() {
  return (
    <div className="group p-6 border border-white/10 rounded-lg bg-white/5 animate-pulse">
      <div className="aspect-square w-full mb-4 rounded-md bg-white/10" />
      <div className="h-5 w-2/3 bg-white/10 rounded mb-2" />
      <div className="h-4 w-1/3 bg-white/10 rounded" />
    </div>
  );
}