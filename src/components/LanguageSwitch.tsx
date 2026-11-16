"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, type Lang } from "@/lib/language";
import { useLang } from "@/components/LanguageProvider";

export default function LanguageSwitch() {
  const lang = useLang();
  const router = useRouter();

  const choose = (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    router.replace(`${url.pathname}?${url.searchParams.toString()}`);
    router.refresh();
  };

  return (
    <div
      className="inline-flex h-9 items-center rounded-full border border-[var(--line)] bg-white p-0.5 text-xs font-bold"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => choose("si")}
        className={`rounded-full px-2.5 py-1.5 ${lang === "si" ? "bg-[var(--yellow)] text-[var(--ink)]" : "text-[var(--muted)]"}`}
        aria-pressed={lang === "si"}
        title="සිංහල"
      >
        සි
      </button>
      <button
        type="button"
        onClick={() => choose("en")}
        className={`rounded-full px-2.5 py-1.5 ${lang === "en" ? "bg-[var(--yellow)] text-[var(--ink)]" : "text-[var(--muted)]"}`}
        aria-pressed={lang === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
