import type { Metadata } from "next";
import DepartmentPage from "@/components/departments/DepartmentPage";
import { getPublishedProducts } from "@/lib/publishedProducts";
import { productMatchesDepartment } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Craft materials",
  description:
    "Craft materials in Sri Lanka for sewing, paper craft, glue, ribbon, paint, and home DIY, with islandwide delivery.",
  alternates: { canonical: "/craft" },
};

export default async function CraftPage() {
  const products = (await getPublishedProducts()).filter((product) => productMatchesDepartment(product, "craft"));
  return <DepartmentPage dept="craft" products={products} />;
}
