"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("register", "1");
    next.set("callbackUrl", searchParams.get("callbackUrl") || "/dashboard");
    router.replace(`/?${next.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-[var(--muted)]">
      Opening create account…
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-[var(--muted)]">Loading…</div>}>
      <RegisterRedirect />
    </Suspense>
  );
}
