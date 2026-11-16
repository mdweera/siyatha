import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import UserTrackingEvent from "@/models/UserTrackingEvent";
import { authOptions } from "@/lib/auth";
import { findFinish, findPrintSize, printUnitPrice } from "@/lib/storefront";
import { isFulfillmentMethod, quoteDelivery } from "@/lib/delivery";
import { getShopSettings } from "@/lib/shopDelivery";
import { movePrintToOrder } from "@/lib/cloudinaryPrints";
import { makeTrackingCode } from "@/lib/trackingCode";
import { SHOP_PLACE } from "@/lib/storefront";

type CheckoutItemInput = {
  productId?: string;
  quantity: number;
  kind?: string;
  sizeId?: string;
  finishId?: string;
  name?: string;
  image?: string;
  detail?: string;
};

function toPositiveInt(value: unknown, fallback = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.floor(numeric);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    await dbConnect();
    const orderData = await request.json();

    const { items, shippingAddress, paymentMethod } = orderData;
    const fulfillmentMethod = isFulfillmentMethod(orderData.fulfillmentMethod)
      ? orderData.fulfillmentMethod
      : "delivery";
    const pickup = fulfillmentMethod === "pickup";
    const phone = String(shippingAddress?.phone || "").replace(/\s+/g, "");
    const email = String(shippingAddress?.email || "").trim();
    const firstName = String(shippingAddress?.firstName || "").trim();
    const lastName = String(shippingAddress?.lastName || "").trim();
    const address = pickup
      ? String(shippingAddress?.address || "").trim() || `Store pickup · ${SHOP_PLACE}`
      : String(shippingAddress?.address || "").trim();
    const city = pickup
      ? String(shippingAddress?.city || "").trim() || "Batapola"
      : String(shippingAddress?.city || "").trim();
    if (!items || !shippingAddress || !firstName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!pickup && (!address || !city)) {
      return NextResponse.json({ error: "Enter a delivery address and city." }, { status: 400 });
    }
    if (!/^(?:\+94|0)7\d{8}$/.test(phone)) {
      return NextResponse.json({ error: "Use a Sri Lankan mobile number." }, { status: 400 });
    }
    if (paymentMethod !== "cash_on_delivery" && paymentMethod !== "bank_transfer") {
      return NextResponse.json({ error: "Choose cash on delivery or bank transfer." }, { status: 400 });
    }

    const safeAddress = {
      ...shippingAddress,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode: String(shippingAddress?.postalCode || "").trim() || "-",
      notes: String(shippingAddress?.notes || ""),
    };

    const normalizedItems: CheckoutItemInput[] = (Array.isArray(items) ? items : [])
      .map((item: any) => ({
        productId: String(item?.productId || "").trim(),
        quantity: toPositiveInt(item?.quantity, 1),
        kind: item?.kind === "print" ? "print" : "product",
        sizeId: String(item?.sizeId || "").trim(),
        finishId: String(item?.finishId || "").trim(),
        name: String(item?.name || "").trim(),
        image: String(item?.image || "").trim(),
        detail: String(item?.detail || "").trim(),
      }))
      .filter((item) => (item.kind === "print" ? item.sizeId.length > 0 : item.productId.length > 0));

    const printItems = normalizedItems.filter((item) => item.kind === "print");
    const productItems = normalizedItems.filter((item) => item.kind !== "print");

    if (printItems.length + productItems.length === 0) {
      return NextResponse.json({ error: "No valid order items provided" }, { status: 400 });
    }

    const printCopies = new Map<string, number>();
    for (const item of printItems) {
      if (!findPrintSize(item.sizeId || "")) {
        return NextResponse.json({ error: "Unknown photo print size." }, { status: 400 });
      }
      const key = `${item.sizeId}|${item.finishId || "lustre"}`;
      printCopies.set(key, (printCopies.get(key) || 0) + item.quantity);
    }

    const uniqueProductIds = Array.from(new Set(productItems.map((item) => item.productId || "")));
    const products = await Product.find({ _id: { $in: uniqueProductIds } }).lean();
    const productMap = new Map<string, any>(products.map((p: any) => [String(p._id), p]));

    for (const item of productItems) {
      const product = productMap.get(item.productId || "");
      if (!product) {
        return NextResponse.json(
          { error: `Product not found for ID ${item.productId}` },
          { status: 400 }
        );
      }

      const stockQty = Number(product.stockQty || 0);
      if (stockQty < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}`,
            productId: item.productId,
            availableStock: stockQty,
          },
          { status: 400 }
        );
      }
    }

    const shop = await getShopSettings();

    const orderItems = [
      ...productItems.map((item) => {
        const product = productMap.get(item.productId || "");
        const price = Number(product.onlinePrice || product.posPrice || 0);
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price,
          image: product.images?.[0] || "",
          subtotal: price * item.quantity,
          kind: "product" as const,
          detail: "",
        };
      }),
      ...printItems.map((item) => {
        const size = findPrintSize(item.sizeId || "");
        const finish = findFinish(item.finishId || "") || findFinish("lustre");
        const copies = printCopies.get(`${item.sizeId}|${item.finishId || "lustre"}`) || item.quantity;
        const price = printUnitPrice(item.sizeId || "", copies, shop.printPrices) || 0;
        return {
          name: item.name || `${size?.label || "Photo"} print · ${finish?.title || "Lustre"}`,
          quantity: item.quantity,
          price,
          image: item.image || "",
          subtotal: price * item.quantity,
          kind: "print" as const,
          detail: item.detail || "",
          sizeId: item.sizeId || "",
          finishId: item.finishId || finish?.id || "lustre",
        };
      }),
    ];

    const computedTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryQuote = quoteDelivery(computedTotal, shop, fulfillmentMethod);

    // Create order
    const orderNumber = `SO-${Date.now()}`;
    if (printItems.length > 0) {
      for (let index = 0; index < orderItems.length; index += 1) {
        const item = orderItems[index];
        if (item.kind === "print" && item.image) {
          item.image = await movePrintToOrder(item.image, orderNumber, index);
        }
      }
    }

    let trackingCode = makeTrackingCode();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await Order.exists({ trackingCode });
      if (!clash) {
        break;
      }
      trackingCode = makeTrackingCode();
    }

    const order = new Order({
      userId: session?.user?.id,
      customerName: `${firstName} ${lastName}`.trim(),
      phone,
      items: orderItems,
      shippingAddress: safeAddress,
      deliveryCharge: deliveryQuote.charge,
      fulfillmentMethod,
      totalAmount: deliveryQuote.total,
      paymentMethod,
      status: "pending",
      trackingCode,
      ...(printItems.length > 0 ? { printStep: "received" as const } : {}),
      orderNumber,
    });

    await order.save();

    const stockOps = productItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stockQty: -item.quantity } },
      },
    }));

    if (stockOps.length > 0) {
      await Product.bulkWrite(stockOps);
    }

    await UserTrackingEvent.create({
      visitorId: session?.user?.id || phone,
      sessionId: `checkout_${Date.now()}`,
      userId: session?.user?.id,
      userRole: session?.user?.role || "guest",
      eventName: "order_placed",
      pageUrl: "/checkout",
      pageTitle: "Checkout",
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        totalAmount: deliveryQuote.total,
        itemCount: orderItems.length,
        fulfillmentMethod,
      },
    });

    return NextResponse.json(JSON.parse(JSON.stringify(order)), { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}