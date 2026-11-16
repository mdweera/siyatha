"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

export default function ShippingNotice() {
  const pathname = usePathname();
  const lang = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(window.sessionStorage.getItem("siyatha-ship-note") !== "hidden");
  }, []);

  const visible = open && !pathname.startsWith("/admin") && !pathname.startsWith("/login") && !pathname.startsWith("/register");
  if (!visible) {
    return null;
  }

  const message =
    lang === "si"
      ? "ඡායාරූප මුද්‍රණ එක් ව්‍යාපාරික දිනයක් ඇතුළත යවනවා"
      : "Photo prints ship within one business day";

  return (
    <div className="bg-gradient-to-r from-[#DE2684] via-[#F2B400] to-[#F9E094] text-[#2b1636]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <p>{message}</p>
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2b1636]/20 bg-white/40"
          aria-label={lang === "si" ? "වසන්න" : "Dismiss shipping note"}
          onClick={() => {
            window.sessionStorage.setItem("siyatha-ship-note", "hidden");
            setOpen(false);
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
