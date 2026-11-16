import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import Order from "@/models/Order";
import UserTrackingEvent from "@/models/UserTrackingEvent";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (
      body?.status === "pending" ||
      body?.status === "processing" ||
      body?.status === "shipped" ||
      body?.status === "delivered" ||
      body?.status === "cancelled"
    ) {
      update.status = body.status;
    }

    if (typeof body?.trackingNumber === "string") {
      update.trackingNumber = body.trackingNumber.trim() || undefined;
    }

    if (typeof body?.courierService === "string") {
      update.courierService = body.courierService.trim() || undefined;
    }

    if (body?.status === "shipped" && !update.trackingNumber) {
      update.trackingNumber = `TRK-${Date.now()}`;
    }

    await dbConnect();

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (body?.status === "shipped" || body?.status === "delivered") {
      await UserTrackingEvent.create({
        visitorId: `admin_${session.user.id}`,
        sessionId: `admin_session_${Date.now()}`,
        userId: session.user.id,
        userRole: session.user.role,
        eventName: body.status === "shipped" ? "order_dispatched" : "order_delivered",
        pageUrl: "/admin/marketing",
        pageTitle: "Admin Marketing",
        metadata: {
          orderId: id,
          orderNumber: (order as any).orderNumber,
          trackingNumber: (order as any).trackingNumber,
          courierService: (order as any).courierService,
        },
      });
    }

    return NextResponse.json({ order: JSON.parse(JSON.stringify(order)) });
  } catch (error: any) {
    console.error("Admin order patch error:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}
