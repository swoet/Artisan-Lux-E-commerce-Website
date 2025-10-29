import { Suspense } from "react";
import dynamicImport from "next/dynamic";

export const dynamic = 'force-dynamic';

const LoginForm = dynamicImport(() => import("@/components/LoginForm"), { ssr: false });

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
