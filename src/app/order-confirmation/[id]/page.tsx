import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { CheckCircle, Truck, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-semibold text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-blue-600 capitalize">{order.status}</span>
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.detail ? <p className="text-xs text-gray-500">{item.detail}</p> : null}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900">Rs {item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
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

        {/* Shipping Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
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
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  {order.shippingAddress.notes && (
                    <p className="mt-2 text-sm italic">Notes: {order.shippingAddress.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">What's Next?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• Photo prints ship within one business day</li>
              <li>• You&apos;ll get a message when the order is on the way</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/shop"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/dashboard"
              className="flex-1 border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold text-center hover:bg-blue-50 transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}