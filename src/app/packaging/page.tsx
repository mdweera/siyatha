import type { Metadata } from "next";
import DepartmentPage from "@/components/departments/DepartmentPage";
import { getPublishedProducts } from "@/lib/publishedProducts";
import { productMatchesDepartment } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Packaging for online sellers",
  description:
    "Packaging for Sri Lankan online sellers: poly mailers, courier boxes, bubble wrap, packing tape, thank-you cards, and labels.",
  alternates: { canonical: "/packaging" },
};

export default async function PackagingPage() {
  const products = (await getPublishedProducts()).filter((product) => productMatchesDepartment(product, "packaging"));
  return <DepartmentPage dept="packaging" products={products} />;
}
