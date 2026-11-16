"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Lock, Phone, X } from "lucide-react";
import { signalNavigationPending } from "@/lib/navigationPending";

type LoginModalProps = {
  open: boolean;
  callbackUrl: string;
  onClose: () => void;
};

export default function LoginModal({ open, callbackUrl, onClose }: LoginModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
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

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#2b1636]/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close login" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)]"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="pr-8">
          <p className="text-sm font-semibold text-[var(--muted)]">Account</p>
          <h2 id="login-modal-title" className="mt-1 text-2xl font-bold text-[var(--ink)]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Sign in to track saved orders and checkout faster.</p>
        </div>

        {error ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        ) : null}

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
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-70">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          No account?{" "}
          <Link href="/register" className="font-semibold text-[#681878] underline" onClick={onClose}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
