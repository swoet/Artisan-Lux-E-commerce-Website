import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/db/queries/admins";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session_v2");
  
  if (!sessionCookie?.value) {
    redirect("/login");
  }
  
  // Validate session exists and hasn't expired
  const session = await getSession(sessionCookie.value);
  if (!session || session.expiresAt < new Date()) {
    redirect("/login");
  }
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)]/60 bg-gradient-to-br from-black/20 via-black/10 to-white/5 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Artisan Lux Admin</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Manage your luxury e-commerce platform.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/catalog" className="group card p-5 transition-transform hover:-translate-y-0.5">
          <h2 className="font-semibold">Catalog</h2>
          <p className="text-sm text-[var(--color-muted)]">Manage items and categories</p>
        </Link>
        <Link href="/dashboard/artisan-portal" className="group card p-5 transition-transform hover:-translate-y-0.5">
          <h2 className="font-semibold">🏺 Artisan Portal</h2>
          <p className="text-sm text-[var(--color-muted)]">Manage artisan accounts & portal</p>
        </Link>
        <Link href="http://localhost:3000" target="_blank" className="group card p-5 transition-transform hover:-translate-y-0.5">
          <h2 className="font-semibold">View User Site</h2>
          <p className="text-sm text-[var(--color-muted)]">See live customer-facing site</p>
        </Link>
      </div>
    </div>
  );
}
