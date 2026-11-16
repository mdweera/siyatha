import { cookies } from "next/headers";
import { LANG_COOKIE, parseLang, type Lang } from "@/lib/language";

export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  return parseLang(jar.get(LANG_COOKIE)?.value);
}

function withLang(path: string, lang: string): string {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", lang);
  return `${base}?${params.toString()}`;
}

export function pageMeta(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        en: withLang(path, "en"),
        si: withLang(path, "si"),
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "website" as const,
    },
  };
}
