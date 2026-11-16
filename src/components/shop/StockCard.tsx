import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ShopProduct } from "@/lib/publishedProducts";

type StockCardProps = {
  product: ShopProduct;
};

function productId(value: ShopProduct["_id"]): string {
  return typeof value === "string" ? value : "";
}

export default function StockCard({ product }: StockCardProps) {
  const id = productId(product._id);
  if (!id) {
    return null;
  }

  const price = Number(product.onlinePrice || product.posPrice || 0);
  const imageUrl = product.images?.[0];

  return (
    <Link href={`/shop/${id}`} className="surface-card group overflow-hidden rounded-3xl p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#fff1d2]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-[#B10C53]">
            {product.category || "Siyatha"}
          </div>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#B10C53]">
        {product.category || "Shop"}
      </p>
      <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold text-slate-900">{product.name}</h3>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xl font-bold text-[#B10C53]">Rs {price.toLocaleString("en-LK")}</p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          View <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
