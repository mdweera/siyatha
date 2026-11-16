import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { normalizeTrackingCode } from "@/lib/trackingCode";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("code") || "";
  const code = normalizeTrackingCode(raw);
  if (code.length < 4) {
    return NextResponse.json({ error: "Enter your tracking code." }, { status: 400 });
  }

  await dbConnect();
  const order = await Order.findOne({
    $or: [{ trackingCode: code }, { orderNumber: code }],
  }).lean();

  if (!order) {
    return NextResponse.json({ error: "No order matches that code." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    trackingCode: order.trackingCode || order.orderNumber,
    status: order.status,
    printStep: order.printStep || null,
    createdAt: order.createdAt,
    totalAmount: order.totalAmount,
    deliveryCharge: order.deliveryCharge || 0,
    city: order.shippingAddress?.city || "",
    items: (order.items || []).map((item: { name?: string; quantity?: number; kind?: string }) => ({
      name: item.name || "Item",
      quantity: item.quantity || 1,
      kind: item.kind || "product",
    })),
  });
}
