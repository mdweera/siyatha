"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoginModal from "@/components/auth/LoginModal";

type AuthModalContextValue = {
  openLogin: (callbackUrl?: string) => void;
  closeLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

function AuthModalProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  const closeLogin = useCallback(() => {
    setOpen(false);
    if (searchParams.get("login") === "1") {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("login");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const openLogin = useCallback((nextCallback = "/") => {
    setCallbackUrl(nextCallback || "/");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (searchParams.get("login") === "1") {
      setCallbackUrl(searchParams.get("callbackUrl") || "/dashboard");
      setOpen(true);
    }
  }, [searchParams]);

  const value = useMemo(() => ({ openLogin, closeLogin }), [openLogin, closeLogin]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal open={open} callbackUrl={callbackUrl} onClose={closeLogin} />
    </AuthModalContext.Provider>
  );
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <AuthModalProviderInner>{children}</AuthModalProviderInner>
    </Suspense>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const value = useContext(AuthModalContext);
  if (!value) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return value;
}
