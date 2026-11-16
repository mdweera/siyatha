import ShopClient from "./ShopClient";
import { getPublishedProducts } from "@/lib/publishedProducts";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; level?: string; concept?: string; dept?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = typeof params.category === "string" ? params.category : "";
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const initialLevel = typeof params.level === "string" ? params.level : "all";
  const initialDept = typeof params.dept === "string" ? params.dept : typeof params.concept === "string" ? params.concept : "all";
  const products = await getPublishedProducts();

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ShopClient
          products={products}
          initialCategory={decodeURIComponent(initialCategory)}
          initialQuery={decodeURIComponent(initialQuery)}
          initialLevel={decodeURIComponent(initialLevel) as "all" | "best-value" | "premium" | "best-products"}
          initialDept={decodeURIComponent(initialDept) as "all" | "packaging" | "craft" | "online-stores"}
        />
      </div>
    </div>
  );
}