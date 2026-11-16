import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/cart",
  "Your cart",
  "Review photo prints and shop items, see the delivery fee, and continue to checkout."
);

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
