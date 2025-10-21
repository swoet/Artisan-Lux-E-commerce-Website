"use client";
import dynamic from "next/dynamic";
const VisitorsMap = dynamic(() => import("@/components/VisitorsMap"), { ssr: false });

type Point = { lat: number; lon: number; city?: string | null; country?: string | null; count?: number; visits?: number };

type CountryAgg = { code: string; count: number };

export default function AnalyticsClient({ points, countries }: { points: Point[]; countries: CountryAgg[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="card p-6 md:col-span-2">
        <h2 className="font-semibold mb-2">Visitors Map</h2>
        <VisitorsMap points={points ?? []} />
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-2">By Country</h2>
        <ul className="divide-y divide-[var(--color-border)]">
          {(countries ?? []).map((c) => (
            <li key={c.code} className="py-2 flex items-center justify-between text-sm">
              <span className="font-medium tracking-wide">{c.code}</span>
              <span className="text-neutral-400">{c.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
