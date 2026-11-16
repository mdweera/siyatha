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
    <div className="inline-flex rounded-[12px] border border-[var(--line)] bg-white p-1 text-sm font-semibold" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => choose("si")}
        className={`min-h-11 rounded-[10px] px-3 ${lang === "si" ? "bg-[var(--yellow)] text-[var(--ink)]" : "text-[var(--muted)]"}`}
        aria-pressed={lang === "si"}
      >
        සිංහල
      </button>
      <button
        type="button"
        onClick={() => choose("en")}
        className={`min-h-11 rounded-[10px] px-3 ${lang === "en" ? "bg-[var(--yellow)] text-[var(--ink)]" : "text-[var(--muted)]"}`}
        aria-pressed={lang === "en"}
      >
        English
      </button>
    </div>
  );
}
