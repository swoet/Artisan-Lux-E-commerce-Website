"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/custom-orders", label: "Orders" },
    { href: "/profile", label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-transparent border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "py-4 border-b-2 " +
                (isActive(l.href)
                  ? "border-brand-dark-wood font-medium text-brand-dark-wood"
                  : "border-transparent text-neutral-300 hover:text-neutral-100 hover:border-neutral-600")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
