import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import Product from "@/models/Product";
import UserTrackingEvent from "@/models/UserTrackingEvent";

type ExternalProduct = Record<string, any>;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInt(value: unknown, fallback = 0) {
  return Math.max(0, Math.floor(toNumber(value, fallback)));
}

function sanitizeSku(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function normalizeSpecifications(rawSpecs: unknown): Record<string, string> {
  if (!rawSpecs || typeof rawSpecs !== "object") return {};

  const specs = rawSpecs as Record<string, unknown>;
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(specs)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      normalized[key] = String(value);
    }
  }

  return normalized;
}

function mapCloudPosProduct(raw: ExternalProduct) {
  const name = String(raw?.name || raw?.title || raw?.productName || "").trim();

  const category =
    typeof raw?.category === "object" && raw.category
      ? String(raw.category.name || raw.category.title || "General")
      : String(raw?.category || "General");

  const skuBase = String(raw?.sku || raw?.itemCode || raw?.barcode || name).trim();
  const sku = sanitizeSku(`CP-${skuBase || `ITEM-${Date.now()}`}`);

  const onlinePrice = toNumber(
    raw?.onlinePrice ?? raw?.sellingPrice ?? raw?.posPrice ?? raw?.price,
    0
  );

  const posPrice = toNumber(raw?.posPrice ?? raw?.sellingPrice ?? onlinePrice, onlinePrice);
  const costPrice = toNumber(raw?.buyingPrice ?? raw?.costPrice ?? 0, 0);
  const stockQty = toInt(raw?.stock ?? raw?.stockQty ?? raw?.quantity ?? 0, 0);

  const imageUrl =
    String(raw?.imageUrl || raw?.image || "").trim() ||
    (Array.isArray(raw?.images) && typeof raw.images[0] === "string" ? raw.images[0] : "");

  return {
    name,
    description: String(raw?.description || "Imported from Cloud POS").trim(),
    sku,
    barcode: String(raw?.barcode || "").trim() || undefined,
    category: category || "General",
    brand: String(raw?.brand || "Cloud POS").trim() || "Cloud POS",
    images: imageUrl ? [imageUrl] : [],
    costPrice,
    posPrice,
    onlinePrice,
    stockQty,
    isPublishedOnline:
      typeof raw?.isPublishedOnline === "boolean" ? raw.isPublishedOnline : true,
    warrantyPeriod: String(raw?.warrantyPeriod || "No Warranty").trim() || "No Warranty",
    specifications: normalizeSpecifications(raw?.specifications),
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const endpointUrl =
      String(body?.endpointUrl || process.env.CLOUD_POS_PRODUCTS_API_URL || "").trim();

    if (!endpointUrl) {
      return NextResponse.json(
        {
          error:
            "Missing Cloud POS endpoint URL. Provide endpointUrl or set CLOUD_POS_PRODUCTS_API_URL.",
        },
        { status: 400 }
      );
    }

    const apiKey = String(body?.apiKey || process.env.CLOUD_POS_API_KEY || "").trim();

    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["x-api-key"] = apiKey;
    }

    const response = await fetch(endpointUrl, {
      method: "GET",
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch products from Cloud POS",
          status: response.status,
          statusText: response.statusText,
        },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const incomingProducts: ExternalProduct[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    if (incomingProducts.length === 0) {
      return NextResponse.json(
        {
          error: "No products found from Cloud POS response",
          hint: "Expected an array or { products: [] } payload",
        },
        { status: 400 }
      );
    }

    const mapped = incomingProducts.map(mapCloudPosProduct);
    const validMapped = mapped.filter((item) => item.name.length > 0 && item.posPrice > 0);
    const skippedCount = mapped.length - validMapped.length;

    await dbConnect();

    const ops = validMapped.map((item) => ({
      updateOne: {
        filter: { sku: item.sku },
        update: { $set: item },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Product.bulkWrite(ops);
    }

    await UserTrackingEvent.create({
      visitorId: `admin_${session.user.id}`,
      sessionId: `admin_session_${Date.now()}`,
      userId: session.user.id,
      userRole: session.user.role,
      eventName: "cloud_pos_inventory_sync",
      pageUrl: "/admin/marketing",
      pageTitle: "Admin Marketing",
      metadata: {
        endpointUrl,
        totalReceived: incomingProducts.length,
        imported: validMapped.length,
        skipped: skippedCount,
      },
    });

    return NextResponse.json({
      success: true,
      endpointUrl,
      totalReceived: incomingProducts.length,
      imported: validMapped.length,
      skipped: skippedCount,
      sample: validMapped.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Cloud POS sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync inventory from Cloud POS", details: error.message },
      { status: 500 }
    );
  }
}
