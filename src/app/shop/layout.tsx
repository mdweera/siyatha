import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/shop",
  "Shop packaging and craft",
  "Buy mailers, boxes, tape, paper, glue, and sewing supplies from Siyatha. Photo prints are ordered separately."
);

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
