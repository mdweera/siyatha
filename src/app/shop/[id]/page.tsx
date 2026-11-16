import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Link from "next/link";
import SingleProductClient from "./SingleProductClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  let product = null;
  let relatedProducts: any[] = [];
  const { id } = await params;

  try {
    await dbConnect();
    const doc = await Product.findOne({ _id: id, isPublishedOnline: true }).lean().exec();

    if (doc) {
      product = JSON.parse(JSON.stringify(doc));

      const relatedDocs = await Product.find({
        _id: { $ne: id },
        isPublishedOnline: true,
        category: doc.category,
      })
        .select("name category images onlinePrice posPrice _id")
        .limit(4)
        .lean()
        .exec();

      relatedProducts = JSON.parse(JSON.stringify(relatedDocs));
    }
  } catch (error) {
    console.error("Failed to fetch single product:", error);
  }

  if (!product) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="vibrant-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
          Siyatha Online
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Product Not Found</h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          The product you are looking for is unavailable or removed from online listings.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-600 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:brightness-105"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <SingleProductClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}