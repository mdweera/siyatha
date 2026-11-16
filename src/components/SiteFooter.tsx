"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import { SHOP_PHONE_DISPLAY, SHOP_PLACE } from "@/lib/storefront";

export default function SiteFooter() {
  const lang = useLang();
  const copy = t(lang).footer;
  const mapHref = "https://www.google.com/maps/search/?api=1&query=Kirimatiya+Batapola+Ambalangoda";

  return (
    <footer className="site-footer mt-auto border-t-4 border-[#F2B400] bg-[#2b1636] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-sinhala text-2xl font-bold leading-[1.85] text-white">සෑමවිටම හොඳම මිල ඔබට</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/85">{copy.order}</p>
          <p className="mt-3 text-sm text-white/85">{copy.pay}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{copy.policies}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/track" className="footer-link">
                {copy.track}
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="footer-link">
                {copy.shipping}
              </Link>
            </li>
            <li>
              <Link href="/returns" className="footer-link">
                {copy.returns}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-link">
                {copy.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="footer-link">
                {copy.terms}
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm leading-7 text-white/85">
          <p>WhatsApp: {SHOP_PHONE_DISPLAY}</p>
          <p>{copy.hours}</p>
          <p>{SHOP_PLACE}</p>
          <p>
            <a className="footer-link" href={mapHref} target="_blank" rel="noreferrer">
              Map
            </a>
          </p>
          <p>
            <a
              className="footer-link"
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
      <div className="border-t border-white/10 px-4 py-4 text-xs text-white/70 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Siyatha Online. {copy.rights}
      </div>
    </footer>
  );
}
