"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Truck, X } from "lucide-react";
import { formatRs } from "@/lib/storefront";

type FreeDeliveryBannerProps = {
  remaining: number;
  threshold: number;
  charge: number;
  storageKey?: string;
};

export default function FreeDeliveryBanner({
  remaining,
  threshold,
  charge,
  storageKey = "siyatha-free-delivery-note",
}: FreeDeliveryBannerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (remaining <= 0 || charge <= 0 || threshold <= 0) {
      setOpen(false);
      return;
    }
    setOpen(window.sessionStorage.getItem(storageKey) !== "hidden");
  }, [remaining, charge, threshold, storageKey]);

  if (!open || remaining <= 0 || charge <= 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-[#F2B400] bg-[#F2B400] px-4 py-3 text-[#111]">
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 shrink-0" size={18} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Add {formatRs(remaining)} more for free delivery</p>
          <p className="mt-1 text-sm leading-6">
            Orders from {formatRs(threshold)} ship free. Under that, delivery is {formatRs(charge)}.
          </p>
          <Link href="/shop" className="mt-2 inline-flex text-sm font-bold underline">
            Add something else
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#111]/25 bg-[#111]/5"
          aria-label="Dismiss free delivery note"
          onClick={() => {
            window.sessionStorage.setItem(storageKey, "hidden");
            setOpen(false);
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
