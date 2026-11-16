import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const STEPS = ["received", "printing", "packed", "shipped", "delivered"] as const;

const STEP_LABEL: Record<string, string> = {
  received: "Received",
  printing: "Printing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  pending: "Received",
  processing: "Printing",
  cancelled: "Cancelled",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await dbConnect();
  const email = session.user.email || "";
  const orders = await Order.find({
    $or: [{ userId: session.user.id }, ...(email ? [{ "shippingAddress.email": email }] : [])],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-[var(--muted)]">Your account</p>
      <h1 className="mt-2 text-4xl font-bold">Hello, {session.user.name?.split(" ")[0] || "there"}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Order status updates here when the shop moves a print along.</p>

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="surface-card p-6">
            <p>No orders yet.</p>
            <Link href="/photo-prints/order" className="btn-primary mt-4 no-underline">
              Upload photos
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const step = String(order.printStep || order.status || "received");
            const stepIndex = STEPS.indexOf(step as (typeof STEPS)[number]);
            return (
              <article key={String(order._id)} className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--muted)]">{order.orderNumber}</p>
                    <h2 className="text-xl font-bold">{STEP_LABEL[step] || step}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {new Date(order.createdAt).toLocaleString("en-LK")} · Rs {Number(order.totalAmount || 0).toLocaleString("en-LK")}
                    </p>
                    {order.trackingCode ? (
                      <p className="mt-1 text-sm font-semibold">
                        Tracking:{" "}
                        <Link href={`/track?code=${encodeURIComponent(String(order.trackingCode))}`} className="underline">
                          {String(order.trackingCode)}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  <Link href={`/order-confirmation/${order._id}`} className="text-sm font-semibold underline">
                    View order
                  </Link>
                </div>
                {step !== "cancelled" && stepIndex >= 0 ? (
                  <ol className="mt-4 grid grid-cols-5 gap-2">
                    {STEPS.map((item, index) => (
                      <li
                        key={item}
                        className={`rounded-xl px-2 py-2 text-center text-xs font-bold ${
                          index <= stepIndex ? "bg-[#F2B400] text-[#111]" : "bg-white text-slate-400"
                        }`}
                      >
                        {STEP_LABEL[item]}
                      </li>
                    ))}
                  </ol>
                ) : null}
                <ul className="mt-4 space-y-1 text-sm">
                  {(order.items || []).map((item: { name?: string; quantity?: number }, index: number) => (
                    <li key={`${item.name}-${index}`}>
                      {item.quantity} × {item.name}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
