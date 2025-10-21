import AdminsManager from "@/components/AdminsManager";

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif bg-gradient-to-r from-[var(--brand-from)] to-[var(--brand-to)] bg-clip-text text-transparent">Admins</h1>
      <AdminsManager />
    </div>
  );
}
