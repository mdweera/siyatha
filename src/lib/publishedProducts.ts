import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export type ShopProduct = {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  onlinePrice?: number;
  posPrice?: number;
  sku?: string;
  category?: string;
  brand?: string;
  stockQty?: number;
};

export async function getPublishedProducts(): Promise<ShopProduct[]> {
  try {
    await dbConnect();
    const products = await Product.find({ isPublishedOnline: true })
      .sort({ updatedAt: -1 })
      .select("name description images onlinePrice posPrice sku _id category brand stockQty")
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(products)) as ShopProduct[];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
