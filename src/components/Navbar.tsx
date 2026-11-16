"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, PackageSearch, Search, ShoppingCart, User as UserIcon, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLang } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import { signalNavigationPending } from "@/lib/navigationPending";

const links = [
  { href: "/photo-prints", key: "prints" },
  { href: "/packaging", key: "packaging" },
  { href: "/craft", key: "craft" },
  { href: "/shop", key: "shop" },
  { href: "/who-are-we", key: "about" },
] as const;

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const pathname = usePathname();
  const router = useRouter();
  const lang = useLang();
  const copy = t(lang).nav;
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const cartItemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const dashboardHref = session?.user.role === "ADMIN" || session?.user.role === "STAFF" ? "/admin" : "/dashboard";

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    signalNavigationPending(copy.search);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center" aria-label="Siyatha">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[12px] bg-white">
            <Image src="/logo.jpg" alt="Siyatha" fill className="object-cover" sizes="44px" priority />
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[12px] px-3 py-2 text-sm font-semibold no-underline ${
                  active ? "bg-[var(--yellow)] text-[var(--ink)]" : "text-[var(--ink)] hover:bg-[var(--yellow-tint)]"
                }`}
              >
                {copy[link.key]}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 flex-1 max-w-xs md:block">
          <label className="relative block">
            <span className="sr-only">{copy.search}</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--page)] pl-9 pr-3 text-sm text-[var(--ink)]"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="hidden sm:block">
            <LanguageSwitch />
          </div>
          <Link
            href="/track"
            className="hidden h-11 items-center gap-2 rounded-[12px] px-3 text-sm font-semibold no-underline hover:bg-[var(--yellow-tint)] md:inline-flex"
            aria-label={copy.track}
          >
            <PackageSearch size={16} />
            {copy.track}
          </Link>
          {!loading && !session ? (
            <Link href="/login" className="hidden h-11 items-center rounded-[12px] px-3 text-sm font-semibold no-underline hover:bg-[var(--yellow-tint)] md:inline-flex">
              {copy.login}
            </Link>
          ) : null}
          <Link href="/cart" className="relative inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--line)]" aria-label={copy.cart}>
            <ShoppingCart size={18} />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DE2684] px-1 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
          {!loading && session ? (
            <Link href={dashboardHref} className="hidden h-11 items-center gap-2 rounded-[12px] bg-[var(--ink)] px-3 text-sm font-semibold text-white no-underline md:inline-flex" aria-label={copy.account}>
              <UserIcon size={16} />
            </Link>
          ) : null}
          {!loading && session ? (
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="hidden h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--line)] md:inline-flex" aria-label="Log out">
              <LogOut size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--line)] lg:hidden"
            aria-label={mobileOpen ? copy.close : copy.menu}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--line)] bg-white px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <label className="relative block">
              <span className="sr-only">{copy.search}</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                className="h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--page)] pl-9 pr-3 text-base"
              />
            </label>
          </form>
          <div className="mb-3 sm:hidden">
            <LanguageSwitch />
          </div>
          <div className="grid gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-[12px] px-3 py-3 text-base font-semibold no-underline hover:bg-[var(--yellow-tint)]">
                {copy[link.key]}
              </Link>
            ))}
            <Link href="/track" className="rounded-[12px] px-3 py-3 text-base font-semibold no-underline hover:bg-[var(--yellow-tint)]">
              {copy.track}
            </Link>
            {!loading && !session ? (
              <Link href="/login" className="rounded-[12px] px-3 py-3 text-base font-semibold no-underline hover:bg-[var(--yellow-tint)]">
                {copy.login}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
