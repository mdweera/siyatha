"use client";

import { useCartStore } from "@/store/useCartStore";
import { INITIAL_FREE_DELIVERY, quoteDelivery, type ShopDelivery } from "@/lib/delivery";
import { formatRs } from "@/lib/storefront";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Truck, MapPin, PhoneCall } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const orderPhone = "+94 76 660 9143";
  const telHref = `tel:${orderPhone.replace(/\s+/g, "")}`;
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState<ShopDelivery>({
    freeDeliveryAbove: INITIAL_FREE_DELIVERY,
    deliveryCharge: 0,
  });
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  useEffect(() => {
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

  const quote = quoteDelivery(totalPrice(), delivery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to place an order");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: session.user.id,
        items: items.map((item) => ({
          productId: item.kind === "print" ? undefined : item._id,
          kind: item.kind || "product",
          sizeId: item.sizeId,
          finishId: item.finishId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          detail: item.detail,
        })),
        shippingAddress: shippingForm,
        totalAmount: quote.total,
        status: "pending",
        paymentMethod: "cash_on_delivery", // For now, mock payment
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to place order");

      const order = await response.json();
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${order._id}`);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart before checking out.</p>
        <Link href="/shop" className="text-blue-600 font-semibold hover:underline">← Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <h1 className="mb-8 font-display text-4xl font-black text-slate-900">Checkout</h1>
      {items.some((item) => item.kind === "print") ? (
        <p className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
          Photo prints in this order use the pictures you uploaded. We message you on WhatsApp if a file needs a crop check before printing.
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Shipping Form */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={shippingForm.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={shippingForm.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                value={shippingForm.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                required
                value={shippingForm.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                required
                rows={3}
                value={shippingForm.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address, apartment, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingForm.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={shippingForm.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
              <textarea
                name="notes"
                rows={2}
                value={shippingForm.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special instructions..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-lg font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
            </div>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatRs(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatRs(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{quote.charge === 0 ? "Free" : formatRs(quote.charge)}</span>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {quote.qualifies
                  ? `Free delivery applies above ${formatRs(quote.threshold)}.`
                  : `Add ${formatRs(quote.remaining)} for free delivery.`}
              </p>
              <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>{formatRs(quote.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="text-blue-600" size={24} />
              <h3 className="font-bold text-blue-900">Delivery Information</h3>
            </div>
            <p className="text-blue-800 text-sm">
              Photo prints ship within one business day. Packaging and craft items go out with the same order.
              {quote.threshold > 0 ? ` Free delivery starts at ${formatRs(quote.threshold)}.` : ""}
            </p>
          </div>

          <div className="bg-cyan-50 rounded-2xl p-6 border border-cyan-200">
            <div className="flex items-center gap-3 mb-4">
              <PhoneCall className="text-cyan-700" size={24} />
              <h3 className="font-bold text-cyan-900">Prefer to Order by Phone?</h3>
            </div>
            <p className="text-cyan-800 text-sm mb-4">
              Call our team and place your order directly with assisted checkout.
            </p>
            <a
              href={telHref}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              <PhoneCall size={16} /> Call {orderPhone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}