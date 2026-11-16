"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, Store } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { INITIAL_DELIVERY_CHARGE, INITIAL_FREE_DELIVERY, quoteDelivery, type ShopDelivery } from "@/lib/delivery";
import { formatRs } from "@/lib/storefront";
import { useLang } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export default function OrderBar() {
  const pathname = usePathname();
  const copy = t(useLang()).bar;
  const items = useCartStore((state) => state.items);
  const fulfillment = useCartStore((state) => state.fulfillment);
  const setFulfillment = useCartStore((state) => state.setFulfillment);
  const subtotal = useCartStore((state) => state.totalPrice());
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<ShopDelivery>({
    freeDeliveryAbove: INITIAL_FREE_DELIVERY,
    deliveryCharge: INITIAL_DELIVERY_CHARGE,
  });

  useEffect(() => {
    setMounted(true);
    fetch("/api/shop-settings")
      .then((response) => response.json())
      .then((payload: ShopDelivery) => {
        if (Number.isFinite(Number(payload?.freeDeliveryAbove))) {
          setSettings({
            freeDeliveryAbove: Number(payload.freeDeliveryAbove),
            deliveryCharge: Number(payload.deliveryCharge) || 0,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  if (!mounted || pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  const quote = quoteDelivery(subtotal, settings, fulfillment);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const progress = quote.pickup
    ? 100
    : quote.threshold > 0
      ? Math.min(100, (quote.subtotal / quote.threshold) * 100)
      : 0;
  const onCheckout = pathname.startsWith("/checkout");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F2B400]/35 bg-gradient-to-t from-[#fff3c4]/90 via-[#fff8ee]/95 to-white/90 shadow-[0_-10px_28px_rgba(104,24,120,0.08)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 py-2.5 pl-16 pr-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {count === 0 ? copy.cart : `${count} ${count === 1 ? copy.item : copy.items}`}
            <span className="ml-2 font-display text-lg font-black text-slate-900">{formatRs(quote.total)}</span>
          </p>
          <p className="truncate text-xs font-semibold text-[#B10C53]">
            {quote.pickup
              ? copy.pickup
              : quote.qualifies
                ? copy.free
                : quote.threshold > 0
                  ? `${copy.add} ${formatRs(quote.remaining)} ${copy.forFree}`.trim()
                  : copy.later}
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F9E094]">
            <div
              className={`h-full rounded-full ${quote.pickup ? "bg-emerald-500" : "bg-[#F2B400]"}`}
              style={{ width: `${quote.qualifies || quote.pickup ? 100 : progress}%` }}
            />
          </div>
          {count > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFulfillment("delivery")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  fulfillment === "delivery" ? "bg-[#F2B400] text-[#111]" : "bg-white text-slate-600 ring-1 ring-[var(--line)]"
                }`}
              >
                {copy.delivery}
              </button>
              <button
                type="button"
                onClick={() => setFulfillment("pickup")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  fulfillment === "pickup" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 ring-1 ring-[var(--line)]"
                }`}
              >
                <Store size={11} /> {copy.pickupShort}
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {pathname !== "/cart" ? (
            <Link
              href="/cart"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#CD7DA2]/50 bg-white px-4 py-2 text-sm font-semibold text-[#2b1636] no-underline"
              aria-label={copy.cart}
            >
              <ShoppingCart size={16} /> {copy.cart}
            </Link>
          ) : null}
          {!onCheckout ? (
            <Link
              href={count > 0 ? "/checkout" : "/photo-prints/order"}
              className="inline-flex min-h-11 items-center rounded-full bg-[#F2B400] px-4 py-2 text-sm font-bold text-[#2b1636] no-underline"
            >
              {count > 0 ? copy.checkout : copy.upload}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
