import { NextRequest, NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/publishedProducts";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const products = await getPublishedProducts();
  const matches = products
    .filter((product) => {
      const haystack = [product.name, product.description, product.category, product.brand, product.sku]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 8)
    .map((product) => ({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: Number(product.onlinePrice ?? product.posPrice ?? 0),
      category: product.category || "",
    }));

  return NextResponse.json({ products: matches });
}
