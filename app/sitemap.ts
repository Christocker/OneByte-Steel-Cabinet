import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const products = await getInventory();
    for (const product of products) {
      entries.push({
        url: `${base}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // If the catalog cannot be read, still return the home URL.
  }

  return entries;
}
