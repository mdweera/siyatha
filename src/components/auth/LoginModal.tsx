"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Lock, Phone, User as UserIcon, X } from "lucide-react";
import { signalNavigationPending } from "@/lib/navigationPending";

export type AuthModalMode = "login" | "register";

type LoginModalProps = {
  open: boolean;
  mode: AuthModalMode;
  callbackUrl: string;
  registeredNotice?: boolean;
  onClose: () => void;
  onModeChange: (mode: AuthModalMode) => void;
};

export default function LoginModal({
  open,
  mode,
  callbackUrl,
  registeredNotice = false,
  onClose,
  onModeChange,
}: LoginModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setError("");
    setNotice(registeredNotice ? "Account created. Sign in to continue." : "");
    if (registeredNotice) {
      onModeChange("login");
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, onModeChange, registeredNotice]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setError("");
    setPassword("");
  }, [mode, open]);

  if (!open) {
    return null;
  }

  const isLogin = mode === "login";

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email/phone or password.");
      return;
    }
    onClose();
    signalNavigationPending("Opening account");
    router.push(callbackUrl || "/");
    router.refresh();
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      setUsername(phone);
      setPassword("");
      setNotice("Account created. Sign in to continue.");
      onModeChange("login");
      setLoading(false);
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#2b1636]/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close account" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] transition hover:border-[#681878] hover:bg-[#fff1d6] hover:text-[#681878]"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="pr-8">
          <p className="text-sm font-semibold text-[var(--muted)]">Account</p>
          <h2 id="auth-modal-title" className="mt-1 text-2xl font-bold text-[var(--ink)]">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {isLogin
              ? "Sign in to track saved orders and checkout faster."
              : "Join Siyatha Online to track your orders and checkout faster."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-[var(--line)] bg-[var(--page)] p-1">
          <button
            type="button"
            onClick={() => onModeChange("login")}
            className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isLogin ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => onModeChange("register")}
            className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              !isLogin ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Create account
          </button>
        </div>

        {notice ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            <p>{notice}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        ) : null}

        {isLogin ? (
          <form className="mt-5 space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-username" className="mb-1 block text-sm font-medium text-slate-700">
                Email or phone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] py-3 pl-10 pr-3 text-sm"
                  placeholder="you@email.com or 07XXXXXXXX"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] py-3 pl-10 pr-3 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full cursor-pointer disabled:opacity-70">
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              className="btn-secondary w-full cursor-pointer"
              onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
            >
              Continue with Google
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] py-3 pl-10 pr-3 text-sm"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="register-phone" className="mb-1 block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] py-3 pl-10 pr-3 text-sm"
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] py-3 pl-10 pr-3 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full cursor-pointer disabled:opacity-70">
              {loading ? "Creating account…" : "Create account"}
            </button>
            <button
              type="button"
              className="btn-secondary w-full cursor-pointer"
              onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
            >
              Continue with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
