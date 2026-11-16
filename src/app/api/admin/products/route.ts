import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getPrivilegedSession } from "@/lib/adminAuth";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivilegedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const search = searchParams.get("search") || "";
    const limitValue = Number(searchParams.get("limit") || "150");
    const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 500) : 150;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    await dbConnect();

    const products = await Product.find(query)
      .select("name sku category onlinePrice posPrice stockQty images barcode")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    );
  }
}
