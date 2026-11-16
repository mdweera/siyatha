import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track order",
  description: "Track a Siyatha Online order with your tracking code, or log in to see saved orders.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
