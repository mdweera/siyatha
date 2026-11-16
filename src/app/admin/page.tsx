import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Package,
  Truck,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

type RecentOrder = {
  _id: string;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
};

type LowStockProduct = {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  stockQty?: number;
  onlinePrice?: number;
  posPrice?: number;
};

function formatCurrency(amount: number) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

function statusPill(status: RecentOrder["status"]) {
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "processing") return "bg-sky-100 text-sky-700";
  if (status === "shipped") return "bg-indigo-100 text-indigo-700";
  if (status === "delivered") return "bg-emerald-100 text-emerald-700";
  return "bg-rose-100 text-rose-700";
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  await dbConnect();

  const [
    pendingOrders,
    lowStockCount,
    totalOrders,
    totalProducts,
    recentOrdersRaw,
    lowStockProductsRaw,
    salesAggregate,
  ] = await Promise.all([
    Order.countDocuments({ status: "pending" }),
    Product.countDocuments({ stockQty: { $lte: 5 } }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.find({ source: "ONLINE" })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("orderNumber customerName phone totalAmount status createdAt")
      .lean(),
    Product.find({ stockQty: { $lte: 5 } })
      .sort({ stockQty: 1, updatedAt: -1 })
      .limit(8)
      .select("name sku category stockQty onlinePrice posPrice")
      .lean(),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "online_products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productRow",
        },
      },
      {
        $addFields: {
          productCost: { $ifNull: [{ $arrayElemAt: ["$productRow.costPrice", 0] }, 0] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$items.subtotal" },
          totalCost: { $sum: { $multiply: ["$productCost", "$items.quantity"] } },
        },
      },
    ]),
  ]);

  const recentOrders = JSON.parse(JSON.stringify(recentOrdersRaw)) as RecentOrder[];
  const lowStockProducts = JSON.parse(JSON.stringify(lowStockProductsRaw)) as LowStockProduct[];

  const totalSales = Number(salesAggregate?.[0]?.totalSales || 0);
  const estimatedProfit = Math.max(0, totalSales - Number(salesAggregate?.[0]?.totalCost || 0));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          Role: {session.user.role}
        </span>
      </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {isAdmin && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-sm font-medium text-gray-500">Total Sales</h3>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</div>
              </div>
            )}

            {isAdmin && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-sm font-medium text-gray-500">Estimated Profit</h3>
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(estimatedProfit)}</div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-medium text-gray-500">Pending Orders</h3>
              <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-1 text-sm font-medium text-gray-500">Low Stock Items</h3>
              <div className="text-2xl font-bold text-cyan-700">{lowStockCount}</div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Online Orders</h2>
                <Link
                  href="/admin/marketing?tab=orders"
                  className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  Open Orders
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No orders found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber || "Order"}</p>
                        <p className="text-sm text-gray-600">
                          {order.customerName || "N/A"} • {order.phone || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-cyan-700">{formatCurrency(order.totalAmount)}</p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                <Link
                  href="/admin/marketing?tab=inventory"
                  className="text-sm font-semibold text-cyan-700 hover:text-cyan-800"
                >
                  Manage Inventory
                </Link>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No low stock products.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {lowStockProducts.map((product) => (
                    <div key={product._id} className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.sku || "NO-SKU"} • {product.category || "General"}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Stock: {Number(product.stockQty || 0)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Selling Price: {formatCurrency(Number(product.onlinePrice || product.posPrice || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Quick Action</p>
              <Link
                href="/admin/marketing?tab=orders"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
              >
                <Truck className="h-4 w-4" /> Open Dispatch Panel
              </Link>
            </div>
          </section>
    </>
  );
}
