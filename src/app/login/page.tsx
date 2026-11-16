"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("login", "1");
    next.set("callbackUrl", searchParams.get("callbackUrl") || "/dashboard");
    if (searchParams.get("registered")) {
      next.set("registered", "1");
    }
    router.replace(`/?${next.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-[var(--muted)]">
      Opening sign in…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-[var(--muted)]">Loading…</div>}>
      <LoginRedirect />
    </Suspense>
  );
}
