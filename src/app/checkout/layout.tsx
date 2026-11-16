import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "/checkout",
  "Checkout",
  "Place a photo print or shop order with cash on delivery or bank transfer. No account is required."
);

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
