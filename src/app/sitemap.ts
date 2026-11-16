import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/storefront";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/photo-prints", "/photo-prints/order", "/packaging", "/craft", "/shop", "/who-are-we"];

  return paths.map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" || path === "/photo-prints" ? 1 : 0.7,
  }));
}
