"use client";

import { useCartStore } from "@/store/useCartStore";
import { INITIAL_DELIVERY_CHARGE, INITIAL_FREE_DELIVERY, quoteDelivery, type ShopDelivery } from "@/lib/delivery";
import { formatRs, SHOP_PLACE } from "@/lib/storefront";
import { Minus, PhoneCall, Plus, Store, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FreeDeliveryBanner from "@/components/cart/FreeDeliveryBanner";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, fulfillment, setFulfillment } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [delivery, setDelivery] = useState<ShopDelivery>({
    freeDeliveryAbove: INITIAL_FREE_DELIVERY,
    deliveryCharge: INITIAL_DELIVERY_CHARGE,
  });
  const orderPhone = "+94 76 660 9143";
  const telHref = `tel:${orderPhone.replace(/\s+/g, "")}`;

  useEffect(() => {
    setMounted(true);
    fetch("/api/shop-settings")
      .then((response) => response.json())
      .then((payload: ShopDelivery) => {
        if (Number.isFinite(Number(payload?.freeDeliveryAbove))) {
          setDelivery({
            freeDeliveryAbove: Number(payload.freeDeliveryAbove),
            deliveryCharge: Number(payload.deliveryCharge) || 0,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  if (!mounted) return null;

  const pickup = fulfillment === "pickup";
  const quote = quoteDelivery(totalPrice(), delivery, fulfillment);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-8 font-display text-3xl font-black tracking-tight text-slate-900">Shopping cart</h1>
      {items.length > 0 && !pickup ? (
        <FreeDeliveryBanner
          remaining={quote.remaining}
          threshold={quote.threshold}
          charge={quote.charge}
          storageKey="siyatha-cart-free-delivery"
        />
      ) : null}
      {items.length > 0 ? (
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {[
            { id: "delivery" as const, label: "Home delivery", text: "Courier to your address", icon: Truck },
            { id: "pickup" as const, label: "Store pickup", text: `Collect at ${SHOP_PLACE}`, icon: Store },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFulfillment(option.id)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                fulfillment === option.id
                  ? "border-[#F2B400] bg-[#fff3c4] ring-2 ring-[#F2B400]/40"
                  : "border-[var(--line)] bg-white hover:bg-[var(--yellow-tint)]"
              }`}
            >
              <option.icon className="mt-0.5 shrink-0 text-[#681878]" size={18} />
              <span>
                <span className="block text-sm font-bold">{option.label}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{option.text}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="surface-card rounded-[1.75rem] p-12 text-center">
          <p className="text-gray-500 mb-6 text-lg">Your cart is empty.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/photo-prints/order" className="btn-primary no-underline">
              Upload photos
            </Link>
            <Link href="/packaging" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-full font-medium text-slate-800">
              Packaging
            </Link>
            <Link href="/craft" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-full font-medium text-slate-800">
              Craft materials
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="surface-card flex items-center gap-4 rounded-[1.5rem] p-4">
                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TjwvdGV4dD48L3N2Zz4=";
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  {item.detail ? <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.detail}</p> : null}
                  <p className="mt-1 font-bold text-[var(--ink)]">{formatRs(item.price)}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-lg bg-gray-50">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="inline-flex h-11 w-11 items-center justify-center text-gray-500"
                        aria-label={`Fewer ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-medium text-gray-700">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="inline-flex h-11 w-11 items-center justify-center text-gray-500"
                        aria-label={`More ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-[12px]"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="surface-card sticky top-24 h-fit rounded-[1.5rem] p-6">
            <h3 className="mb-6 border-b border-[#CD7DA2]/20 pb-4 font-display text-xl font-bold text-slate-900">Order summary</h3>
            <div className="space-y-3 text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRs(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{pickup ? "Pickup" : "Delivery"}</span>
                <span>{quote.charge === 0 ? "Free" : formatRs(quote.charge)}</span>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {pickup
                  ? "Store pickup has no delivery charge."
                  : quote.qualifies
                    ? `Free delivery applies above ${formatRs(quote.threshold)}.`
                    : `Add ${formatRs(quote.remaining)} for free delivery.`}
              </p>
            </div>
            <div className="flex justify-between items-center border-t pt-4 mb-6">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-display text-2xl font-black text-slate-900">{formatRs(quote.total)}</span>
            </div>
            
            <Link 
              href="/checkout"
              className="btn-primary w-full no-underline"
            >
              Checkout
            </Link>

            <a
              href={telHref}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 py-3 px-4 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              <PhoneCall size={16} /> Call and Place Order
            </a>
            <p className="mt-2 text-center text-xs text-slate-500">Hotline: {orderPhone}</p>
          </div>
        </div>
      )}
    </div>
  );
}