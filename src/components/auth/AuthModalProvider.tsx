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
import LoginModal, { type AuthModalMode } from "@/components/auth/LoginModal";

type AuthModalContextValue = {
  openLogin: (callbackUrl?: string) => void;
  openRegister: (callbackUrl?: string) => void;
  closeLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

function AuthModalProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>("login");
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [registeredNotice, setRegisteredNotice] = useState(false);

  const clearAuthQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    let changed = false;
    for (const key of ["login", "register", "registered", "callbackUrl"]) {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    }
    if (!changed) {
      return;
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const closeLogin = useCallback(() => {
    setOpen(false);
    setRegisteredNotice(false);
    clearAuthQuery();
  }, [clearAuthQuery]);

  const openLogin = useCallback((nextCallback = "/") => {
    setCallbackUrl(nextCallback || "/");
    setMode("login");
    setOpen(true);
  }, []);

  const openRegister = useCallback((nextCallback = "/") => {
    setCallbackUrl(nextCallback || "/");
    setMode("register");
    setOpen(true);
  }, []);

  useEffect(() => {
    const wantsLogin = searchParams.get("login") === "1";
    const wantsRegister = searchParams.get("register") === "1";
    if (!wantsLogin && !wantsRegister) {
      return;
    }
    setCallbackUrl(searchParams.get("callbackUrl") || "/dashboard");
    setRegisteredNotice(searchParams.get("registered") === "1");
    setMode(wantsRegister && searchParams.get("registered") !== "1" ? "register" : "login");
    setOpen(true);
  }, [searchParams]);

  const value = useMemo(
    () => ({ openLogin, openRegister, closeLogin }),
    [openLogin, openRegister, closeLogin]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal
        open={open}
        mode={mode}
        callbackUrl={callbackUrl}
        registeredNotice={registeredNotice}
        onClose={closeLogin}
        onModeChange={setMode}
      />
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
