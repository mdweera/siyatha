"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { INITIAL_FREE_DELIVERY, quoteDelivery, type ShopDelivery } from "@/lib/delivery";
import { formatRs } from "@/lib/storefront";

export default function OrderBar() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.totalPrice());
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<ShopDelivery>({
    freeDeliveryAbove: INITIAL_FREE_DELIVERY,
    deliveryCharge: 0,
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

  const quote = quoteDelivery(subtotal, settings);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const progress = quote.threshold > 0 ? Math.min(100, (quote.subtotal / quote.threshold) * 100) : 0;
  const onCheckout = pathname.startsWith("/checkout");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#CD7DA2]/30 bg-white/95 shadow-[0_-8px_30px_rgba(104,24,120,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 py-2.5 pl-16 pr-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {count === 0 ? "Cart" : `${count} item${count === 1 ? "" : "s"}`}
            <span className="ml-2 font-display text-lg font-black text-slate-900">{formatRs(quote.total)}</span>
          </p>
          <p className="truncate text-xs font-semibold text-[#B10C53]">
            {quote.qualifies
              ? "Free delivery"
              : quote.threshold > 0
                ? `Add ${formatRs(quote.remaining)} for free delivery`
                : "Delivery added at checkout"}
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F9E094]/70">
            <div className="h-full rounded-full bg-[#00a36a]" style={{ width: `${quote.qualifies ? 100 : progress}%` }} />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {pathname !== "/cart" ? (
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
              <ShoppingCart size={16} /> Cart
            </Link>
          ) : null}
          {!onCheckout ? (
            <Link
              href={count > 0 ? "/checkout" : "/photo-prints/order"}
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              {count > 0 ? "Checkout" : "Upload photos"}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
