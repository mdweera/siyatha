"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

const SESSION_KEY = "siyatha-welcome-popup-shown";
const DISMISS_KEY = "siyatha-welcome-popup-dismissed-at";
const SHOW_DELAY_MS = 12000;
const DISMISS_COOLDOWN_MS = 12 * 60 * 60 * 1000;

export default function WelcomePopup() {
  const pathname = usePathname();
  const lang = useLang();
  const [isOpen, setIsOpen] = useState(false);

  const t = (siText: string, enText: string) => (lang === "si" ? siText : enText);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const alreadyShownThisSession = sessionStorage.getItem(SESSION_KEY) === "1";
    if (alreadyShownThisSession) {
      return;
    }

    const lastDismissedAt = Number(localStorage.getItem(DISMISS_KEY) || "0");
    const stillCoolingDown = Date.now() - lastDismissedAt < DISMISS_COOLDOWN_MS;
    if (stillCoolingDown) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", onEscape);
    }

    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/30 p-4 backdrop-blur-[2px] sm:items-center">
      <div className="surface-card relative w-full max-w-lg overflow-hidden rounded-3xl p-6 shadow-2xl shadow-cyan-900/30 sm:p-7">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100 bg-white text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
          aria-label="Close welcome popup"
        >
          <X size={18} />
        </button>

        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
          <Sparkles size={14} />
          {t("සාදරයෙන් පිළිගනිමු", "Welcome")}
        </p>

        <h2 className="mt-4 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("Siyatha Online වෙත ඔබව පිළිගනිමු", "Welcome to Siyatha Online")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          {t(
            "ඡායාරූප upload කරලා print කරගන්න. Online sellers ට packaging, ගෙදර හදන අයට craft materials.",
            "Send your photos for printing, pack what you sell online, and pick up craft materials for making at home."
          )}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href="/photo-prints"
            onClick={handleClose}
            className="btn-primary no-underline"
          >
            {t("Photo prints", "Photo prints")} <ArrowRight size={16} />
          </Link>
          <Link
            href="/who-are-we"
            onClick={handleClose}
            className="inline-flex items-center rounded-full border border-cyan-200 bg-white px-5 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
          >
            {t("අපි කවුද?", "Who Are We")}
          </Link>
        </div>
      </div>
    </div>
  );
}
