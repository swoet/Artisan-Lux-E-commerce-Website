"use client";

import { useEffect, useState } from "react";
import { isAuthenticated, getCustomerName, logout } from "@/lib/auth";
import Link from "next/link";

export default function UserMenu() {
  const [isAuth, setIsAuth] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setName(getCustomerName());
  }, []);

  if (!isAuth) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">
          Categories
        </Link>
        <Link href="/signin" className="hover:text-[#cd7f32] transition-colors">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 border border-[#cd7f32] rounded-md hover:bg-[#cd7f32]/10 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  // Get first name or full name
  const displayName = name ? name.split(' ')[0] : 'Account';

  return (
    <div className="flex items-center gap-6 text-sm">
      <Link href="/categories" className="hover:text-[#cd7f32] transition-colors">
        Categories
      </Link>
      <Link href="/wishlist" className="hover:text-[#cd7f32] transition-colors">
        Wishlist
      </Link>
      
      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 border border-[#cd7f32] rounded-md hover:bg-[#cd7f32]/10 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#b87333] to-[#cd7f32] text-white text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span>{displayName}</span>
          <svg
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#1a0f08] shadow-xl z-20">
              <div className="p-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">{name || 'User'}</p>
                <p className="text-xs text-neutral-400 truncate">{getCustomerEmail()}</p>
              </div>
              
              <div className="py-2">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Wishlist
                </Link>
              </div>
              
              <div className="py-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getCustomerEmail(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const emailCookie = cookies.find(cookie => cookie.trim().startsWith('customer_email='));
  if (!emailCookie) return null;
  try {
    return emailCookie.split('=')[1] || null;
  } catch {
    return null;
  }
}
