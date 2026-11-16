"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, PackageSearch, Search, ShoppingCart, User as UserIcon, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLang } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import LoginButton from "@/components/auth/LoginButton";
import { formatRs } from "@/lib/storefront";

const links = [
  { href: "/photo-prints", key: "prints" },
  { href: "/packaging", key: "packaging" },
  { href: "/craft", key: "craft" },
  { href: "/who-are-we", key: "about" },
] as const;

type SearchHit = {
  _id: string;
  name: string;
  image: string;
  price: number;
  category: string;
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const pathname = usePathname();
  const lang = useLang();
  const copy = t(lang).nav;
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }
    inputRef.current?.focus();
    const onPointer = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [searchOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!searchOpen || trimmed.length < 1) {
      setHits([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      void fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((payload: { products?: SearchHit[] }) => {
          if (!cancelled) {
            setHits(payload.products || []);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setHits([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setSearching(false);
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  const cartItemCount = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const dashboardHref = session?.user.role === "ADMIN" || session?.user.role === "STAFF" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 no-underline" aria-label="Siyatha Online">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[12px] bg-white sm:h-11 sm:w-11">
            <Image src="/logo.jpg" alt="" fill className="object-cover" sizes="44px" priority />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-[var(--ink)] sm:text-base">Siyatha Online</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:block">
              {lang === "si" ? "ඡායාරූප මුද්‍රණ" : "Photo prints"}
            </span>
          </span>
        </Link>

        <nav className="ml-1 hidden items-center gap-1 lg:flex" aria-label="Primary">
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

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--line)] sm:h-11 sm:w-11 ${
                searchOpen ? "bg-[var(--yellow)]" : "hover:bg-[var(--yellow-tint)]"
              }`}
              aria-label={copy.search}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {searchOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-xl">
                <div className="border-b border-[var(--line)] p-3">
                  <label className="relative block">
                    <span className="sr-only">{copy.search}</span>
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={copy.search}
                      className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] pl-9 pr-3 text-sm"
                    />
                  </label>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searching ? <p className="px-4 py-3 text-sm text-[var(--muted)]">Searching…</p> : null}
                  {!searching && query.trim() && hits.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[var(--muted)]">No items found.</p>
                  ) : null}
                  {!query.trim() ? <p className="px-4 py-3 text-sm text-[var(--muted)]">Type to find packaging or craft items.</p> : null}
                  <ul>
                    {hits.map((hit) => (
                      <li key={hit._id}>
                        <Link
                          href={`/shop/${hit._id}`}
                          className="flex items-center gap-3 px-3 py-2.5 no-underline hover:bg-[var(--yellow-tint)]"
                          onClick={() => setSearchOpen(false)}
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--page)]">
                            {hit.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={hit.image} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-[var(--ink)]">{hit.name}</span>
                            <span className="mt-0.5 block text-xs text-[var(--muted)]">
                              {hit.category || "Shop"} · {formatRs(hit.price)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <LanguageSwitch />

          <Link
            href="/track"
            className="hidden h-10 items-center gap-1.5 rounded-[12px] px-2.5 text-sm font-semibold no-underline hover:bg-[var(--yellow-tint)] md:inline-flex"
            aria-label={copy.track}
          >
            <PackageSearch size={16} />
            <span className="hidden lg:inline">{copy.track}</span>
          </Link>
          {!loading && !session ? (
            <LoginButton className="hidden h-10 items-center rounded-[12px] px-2.5 text-sm font-semibold hover:bg-[var(--yellow-tint)] md:inline-flex">
              {copy.login}
            </LoginButton>
          ) : null}
          <Link href="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--line)] sm:h-11 sm:w-11" aria-label={copy.cart}>
            <ShoppingCart size={18} />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DE2684] px-1 text-[10px] font-bold text-white">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
          {!loading && session ? (
            <Link href={dashboardHref} className="hidden h-10 items-center gap-2 rounded-[12px] bg-[var(--ink)] px-3 text-sm font-semibold text-white no-underline md:inline-flex" aria-label={copy.account}>
              <UserIcon size={16} />
            </Link>
          ) : null}
          {!loading && session ? (
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="hidden h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--line)] md:inline-flex" aria-label="Log out">
              <LogOut size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--line)] lg:hidden sm:h-11 sm:w-11"
            aria-label={mobileOpen ? copy.close : copy.menu}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[var(--line)] bg-white px-4 py-4 lg:hidden">
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
              <LoginButton className="rounded-[12px] px-3 py-3 text-left text-base font-semibold hover:bg-[var(--yellow-tint)]">
                {copy.login}
              </LoginButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
