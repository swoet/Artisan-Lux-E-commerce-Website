"use client";

export default function Logout() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--color-bg)] text-[var(--color-fg)]">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-serif">Logging out...</h1>
        <button 
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Clear Session & Logout
        </button>
      </div>
    </div>
  );
}