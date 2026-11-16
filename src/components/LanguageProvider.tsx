"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Lang } from "@/lib/language";

const LanguageContext = createContext<Lang>("en");

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LanguageContext);
}
