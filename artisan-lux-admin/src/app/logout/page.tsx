"use client";

export default function Logout() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl">Logging out...</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Session & Logout
        </button>
      </div>
    </div>
  );
}