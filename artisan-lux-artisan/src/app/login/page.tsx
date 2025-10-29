"use client";

import dynamic from "next/dynamic";

// Keep the page client-only so ssr: false is valid
const LoginForm = dynamic(() => import("@/components/LoginForm"), { ssr: false });

export default function LoginPage() {
  return <LoginForm />;
}
