export const LANG_COOKIE = "siyatha-lang";
export type Lang = "en" | "si";

export function parseLang(value: string | undefined | null): Lang {
  return value === "si" ? "si" : "en";
}
