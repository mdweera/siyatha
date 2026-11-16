import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { CheckCircle, MapPin, Phone, Mail, PackageSearch } from "lucide-react";
import Link from "next/link";
import CopyTrackingCode from "@/components/order/CopyTrackingCode";

async function getOrder(orderId: string) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId).lean();
    if (!order) return null;
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const trackingCode = String(order.trackingCode || order.orderNumber || "");
  const isGuest = !order.userId;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-xl text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className="mb-8 rounded-2xl border border-[#F2B400] bg-[#F2B400] p-6 text-[#111]">
        <p className="text-sm font-semibold">Your tracking code</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="font-mono text-3xl font-black tracking-wide">{trackingCode}</p>
          <CopyTrackingCode code={trackingCode} />
        </div>
        <p className="mt-3 text-sm leading-6">
          Save this code. You can track the order anytime at{" "}
          <Link href={`/track?code=${encodeURIComponent(trackingCode)}`} className="font-bold underline">
            Track order
          </Link>
          .
        </p>
        {isGuest ? (
          <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm leading-6">
            <p className="font-bold">Want easier tracking next time?</p>
            <p className="mt-1">
              Log in with the same email and your future orders appear in your account. You can still track this one with the code above.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/track?code=${trackingCode}`)}`}
                className="btn-primary no-underline"
              >
                Log in
              </Link>
              <Link href={`/track?code=${encodeURIComponent(trackingCode)}`} className="btn-secondary no-underline">
                <PackageSearch size={16} /> Track now
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/track?code=${encodeURIComponent(trackingCode)}`} className="btn-secondary no-underline">
              <PackageSearch size={16} /> Track order
            </Link>
            <Link href="/dashboard" className="btn-primary no-underline">
              View my orders
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Order Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-semibold text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking code:</span>
              <span className="font-semibold text-gray-900">{trackingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold capitalize text-gray-900">{order.paymentMethod.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold capitalize text-[#681878]">{order.status}</span>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: { image?: string; name?: string; detail?: string; quantity?: number; subtotal?: number }, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name || "Item"} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.detail ? <p className="text-xs text-gray-500">{item.detail}</p> : null}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">Rs {Number(item.subtotal || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            {Number(order.deliveryCharge) > 0 ? (
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>Rs {Number(order.deliveryCharge).toLocaleString()}</span>
              </div>
            ) : (
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span>Free</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total Amount:</span>
              <span>Rs {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </h3>
                <div className="mb-2 flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{order.shippingAddress.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={16} className="mt-1" />
                <div>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.notes ? (
                    <p className="mt-2 text-sm italic">Notes: {order.shippingAddress.notes}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 font-bold text-blue-900">What&apos;s Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep your tracking code handy</li>
              <li>• Photo prints ship within one business day</li>
              <li>• You&apos;ll get a message when the order is on the way</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/shop" className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
              Continue Shopping
            </Link>
            <Link
              href={isGuest ? `/track?code=${encodeURIComponent(trackingCode)}` : "/dashboard"}
              className="flex-1 rounded-lg border border-[#681878] px-6 py-3 text-center font-semibold text-[#681878] transition hover:bg-[var(--yellow-tint)]"
            >
              {isGuest ? "Track order" : "View My Orders"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
