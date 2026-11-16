"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import { SHOP_PHONE_DISPLAY, SHOP_PLACE } from "@/lib/storefront";

export default function SiteFooter() {
  const lang = useLang();
  const copy = t(lang).footer;
  const mapHref = "https://www.google.com/maps/search/?api=1&query=Kirimatiya+Batapola+Ambalangoda";

  return (
    <footer className="mt-auto border-t border-[#F2B400]/40 bg-gradient-to-b from-[#fff8ee] via-[#fff3c4]/50 to-[#f9e094]/35 text-[var(--ink)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-[12px] bg-white ring-1 ring-black/5">
              <Image src="/logo.jpg" alt="" fill className="object-cover" sizes="44px" />
            </span>
            <div>
              <p className="text-base font-bold leading-tight">Siyatha Online</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {lang === "si" ? "ඡායාරූප මුද්‍රණ" : "Photo prints"}
              </p>
            </div>
          </div>
          <p className="font-sinhala mt-4 text-xl font-bold leading-[1.85] text-[var(--ink)]">
            සෑමවිටම හොඳම මිල ඔබට
          </p>
          <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">{copy.order}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{copy.pay}</p>
        </div>

        <div>
          <p className="text-sm font-bold text-[var(--ink)]">{copy.policies}</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <Link href="/track" className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4">
                {copy.track}
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4">
                {copy.shipping}
              </Link>
            </li>
            <li>
              <Link href="/returns" className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4">
                {copy.returns}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4">
                {copy.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4">
                {copy.terms}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2 text-sm leading-7 text-[var(--muted)]">
          <p className="font-semibold text-[var(--ink)]">WhatsApp: {SHOP_PHONE_DISPLAY}</p>
          <p>{copy.hours}</p>
          <p>{SHOP_PLACE}</p>
          <p>
            <a
              className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4"
              href={mapHref}
              target="_blank"
              rel="noreferrer"
            >
              Map
            </a>
            {" · "}
            <a
              className="font-medium text-[var(--ink)] underline decoration-[#F2B400] underline-offset-4"
              href="https://www.facebook.com/profile.php?id=61587396941428"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
          </p>
          <p>Courier across Sri Lanka</p>
        </div>
      </div>

      <div className="border-t border-[#F2B400]/25 px-4 py-4 text-xs leading-6 text-[var(--muted)] sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Siyatha Online. {copy.rights}
      </div>
    </footer>
  );
}
