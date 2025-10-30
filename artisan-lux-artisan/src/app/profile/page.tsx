import { requireArtisanAuth } from "@/lib/auth";
import TopNav from "@/components/TopNav";

export default async function ProfilePage() {
  const artisan = await requireArtisanAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-transparent border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-serif font-bold text-brand-dark-wood">Profile</h1>
          <p className="text-sm text-neutral-400">Your studio information</p>
        </div>
      </header>

      {/* Navigation */}
      <TopNav />

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="card">
          <h2 className="text-xl font-serif font-bold mb-4">Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-400">Name</div>
              <div className="font-medium">{artisan.name}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Email</div>
              <div className="font-medium">{artisan.email}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Slug</div>
              <div className="font-medium">{artisan.slug}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Status</div>
              <div className="font-medium capitalize">{artisan.status}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-serif font-bold mb-4">Security</h2>
          <p className="text-neutral-400 mb-4">For your security, you can sign out of the portal.</p>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn btn-secondary">Sign Out</button>
          </form>
        </div>
      </main>
    </div>
  );
}
