import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import UserTrackingEvent from "@/models/UserTrackingEvent";

type ManualOrderItemInput = {
  productId: string;
  quantity: number;
};

function toPositiveInt(value: unknown, fallback = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.floor(numeric);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const status = searchParams.get("status");
    const limitValue = Number(searchParams.get("limit") || "120");
    const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 300) : 120;

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    await dbConnect();

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const manualItems: ManualOrderItemInput[] = (rawItems as any[])
      .map((item: any) => ({
        productId: String(item?.productId || "").trim(),
        quantity: toPositiveInt(item?.quantity, 1),
      }))
      .filter((item: ManualOrderItemInput) => item.productId.length > 0);

    if (manualItems.length === 0) {
      return NextResponse.json({ error: "At least one order item is required" }, { status: 400 });
    }

    const mergedItemMap = new Map<string, number>();
    for (const item of manualItems) {
      const existingQty = mergedItemMap.get(item.productId) || 0;
      mergedItemMap.set(item.productId, existingQty + item.quantity);
    }

    const mergedItems: ManualOrderItemInput[] = Array.from(mergedItemMap.entries()).map(
      ([productId, quantity]) => ({ productId, quantity })
    );

    await dbConnect();

    const uniqueProductIds = mergedItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: uniqueProductIds } }).lean();

    const productMap = new Map<string, any>(
      products.map((product: any) => [String(product._id), product])
    );

    const missingProducts = uniqueProductIds.filter((id) => !productMap.has(id));
    if (missingProducts.length > 0) {
      return NextResponse.json(
        { error: "Some products are missing", missingProducts },
        { status: 400 }
      );
    }

    for (const item of mergedItems) {
      const product = productMap.get(item.productId);
      const availableStock = Number(product?.stockQty || 0);
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.name || item.productId}`,
            productId: item.productId,
            availableStock,
          },
          { status: 400 }
        );
      }
    }

    const orderItems = mergedItems.map((item) => {
      const product = productMap.get(item.productId);
      const unitPrice = Number(product.onlinePrice || product.posPrice || 0);

      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: unitPrice,
        image: product.images?.[0] || "",
        subtotal: unitPrice * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const customerName = String(body?.customerName || "Walk-in Customer").trim() || "Walk-in Customer";
    const phone = String(body?.phone || "").trim() || undefined;
    const paymentMethod = String(body?.paymentMethod || "cash").trim() || "cash";

    const shipping = body?.shippingAddress || {};

    const order = await Order.create({
      userId: session.user.id,
      customerName,
      phone,
      source: "ONLINE",
      items: orderItems,
      totalAmount,
      status: "pending",
      orderNumber: `ADM-SO-${Date.now()}`,
      paymentMethod,
      shippingAddress: {
        firstName: String(shipping?.firstName || customerName.split(" ")[0] || "Customer"),
        lastName: String(
          shipping?.lastName ||
            customerName.split(" ").slice(1).join(" ") ||
            "Online"
        ),
        email: String(shipping?.email || "admin-order@siyatha.local"),
        phone: String(shipping?.phone || phone || "N/A"),
        address: String(shipping?.address || "No address provided"),
        city: String(shipping?.city || "Colombo"),
        postalCode: String(shipping?.postalCode || "00000"),
        notes: String(shipping?.notes || "Created from admin marketing panel"),
      },
    });

    const stockOps = mergedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stockQty: -item.quantity } },
      },
    }));

    if (stockOps.length > 0) {
      await Product.bulkWrite(stockOps);
    }

    await UserTrackingEvent.create({
      visitorId: `admin_${session.user.id}`,
      sessionId: `admin_session_${Date.now()}`,
      userId: session.user.id,
      userRole: session.user.role,
      eventName: "admin_order_created",
      pageUrl: "/admin/marketing",
      pageTitle: "Admin Marketing",
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        itemCount: orderItems.length,
        totalAmount,
      },
    });

    return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) }, { status: 201 });
  } catch (error: any) {
    console.error("Admin order create error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
