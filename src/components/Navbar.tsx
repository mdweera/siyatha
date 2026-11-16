"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  User as UserIcon,
  LogIn,
  ShoppingCart,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const pathname = usePathname();

  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const cartItemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const dashboardHref =
    session?.user.role === "ADMIN" || session?.user.role === "STAFF" ? "/admin" : "/dashboard";

  const navLinkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-full px-4 py-2 text-sm font-semibold transition ${
      active
        ? "bg-cyan-100 text-cyan-800"
        : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-100/80 bg-white/90 backdrop-blur-xl">
      {showPromo && (
        <div className="bg-gradient-to-r from-pink-600 via-amber-500 to-emerald-600 px-4 py-2 text-white shadow-sm" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} />
              Photo prints ship within one business day
            </span>
            <button
              type="button"
              onClick={() => setShowPromo(false)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/35 bg-white/10 transition hover:bg-white/20"
              aria-label="Close promotion banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-[#CD7DA2]/50 bg-white shadow-lg shadow-[#CD7DA2]/35">
            <Image
              src="/siyatha-logo.jpg"
              alt="Siyatha logo"
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-slate-900">Siyatha Online</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Photo print Sri Lanka
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className={navLinkClass("/")}>Home</Link>
          <Link href="/photo-prints" className={navLinkClass("/photo-prints")}>Photo prints</Link>
          <Link href="/packaging" className={navLinkClass("/packaging")}>Packaging</Link>
          <Link href="/craft" className={navLinkClass("/craft")}>Craft</Link>
          <Link href="/shop" className={navLinkClass("/shop")}>Shop</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Suspense
            fallback={
              <LanguageToggleFallback
                pathname={pathname}
                containerClassName="inline-flex rounded-full border border-cyan-100 bg-cyan-50/80 p-1 text-xs font-semibold"
              />
            }
          >
            <LanguageToggle containerClassName="inline-flex rounded-full border border-cyan-100 bg-cyan-50/80 p-1 text-xs font-semibold" />
          </Suspense>

          <Link
            href="/cart"
            className="relative rounded-full border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700 transition hover:border-cyan-200 hover:bg-cyan-100"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DE2684] px-1 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>

          {!loading && !session && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              <LogIn size={16} /> Login
            </Link>
          )}

          {!loading && session && (
            <div className="flex items-center gap-2">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-200 transition hover:bg-slate-800"
              >
                <UserIcon size={16} />
                {session.user.role === "ADMIN" || session.user.role === "STAFF" ? "Panel" : "Dashboard"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative rounded-full border border-cyan-100 bg-cyan-50 p-2.5 text-cyan-700"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DE2684] px-1 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-xl border border-cyan-100 bg-white p-2 text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-cyan-100 bg-white/95 px-4 pb-5 pt-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
            <Suspense
              fallback={
                <LanguageToggleFallback
                  pathname={pathname}
                  containerClassName="mb-1 inline-flex w-fit rounded-full border border-cyan-100 bg-cyan-50/80 p-1 text-xs font-semibold"
                />
              }
            >
              <LanguageToggle containerClassName="mb-1 inline-flex w-fit rounded-full border border-cyan-100 bg-cyan-50/80 p-1 text-xs font-semibold" />
            </Suspense>

            <Link href="/" className={navLinkClass("/")}>Home</Link>
            <Link href="/photo-prints" className={navLinkClass("/photo-prints")}>Photo prints</Link>
            <Link href="/packaging" className={navLinkClass("/packaging")}>Packaging</Link>
            <Link href="/craft" className={navLinkClass("/craft")}>Craft</Link>
            <Link href="/shop" className={navLinkClass("/shop")}>Shop</Link>
            <Link href="/cart" className={navLinkClass("/cart")}>Cart{cartItemCount > 0 ? ` (${cartItemCount})` : ""}</Link>

            {!loading && !session && (
              <Link
                href="/login"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700"
              >
                <LogIn size={16} /> Login
              </Link>
            )}

            {!loading && session && (
              <>
                <Link
                  href={dashboardHref}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  <UserIcon size={16} />
                  {session.user.role === "ADMIN" || session.user.role === "STAFF" ? "Panel" : "Dashboard"}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageToggle({
  containerClassName,
}: {
  containerClassName: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const langMode: "mix" | "en" = searchParams.get("lang") === "en" ? "en" : "mix";

  const buildLangHref = (mode: "mix" | "en") => {
    const params = new URLSearchParams(searchParams.toString());

    if (mode === "en") {
      params.set("lang", "en");
    } else {
      params.delete("lang");
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className={containerClassName}>
      <Link
        href={buildLangHref("mix")}
        className={`rounded-full px-3 py-1.5 transition ${
          langMode === "mix" ? "bg-white text-cyan-800" : "text-cyan-700 hover:bg-white"
        }`}
      >
        සිංහල
      </Link>
      <Link
        href={buildLangHref("en")}
        className={`rounded-full px-3 py-1.5 transition ${
          langMode === "en" ? "bg-white text-cyan-800" : "text-cyan-700 hover:bg-white"
        }`}
      >
        English
      </Link>
    </div>
  );
}

function LanguageToggleFallback({
  pathname,
  containerClassName,
}: {
  pathname: string;
  containerClassName: string;
}) {
  return (
    <div className={containerClassName}>
      <Link href={pathname} className="rounded-full bg-white px-3 py-1.5 text-cyan-800">
        සිංහල
      </Link>
      <Link
        href={`${pathname}?lang=en`}
        className="rounded-full px-3 py-1.5 text-cyan-700 hover:bg-white"
      >
        English
      </Link>
    </div>
  );
}