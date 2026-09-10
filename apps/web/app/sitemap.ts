import type { MetadataRoute } from "next";
import { siteConfig } from "../../../config/site";
import { getPublicTools } from "../lib/public-config";
export const dynamic = "force-dynamic";
const contentUpdated = new Date("2026-09-10T00:00:00.000Z");
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.allowIndexing) return [];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of siteConfig.locales) {
    entries.push({ url: `${siteConfig.url}/${locale}`, lastModified: contentUpdated });
    const published = getPublicTools(locale);
    for (const category of ["pdf", "image", "svg", "icons"] as const) {
      entries.push({ url: `${siteConfig.url}/${locale}/${category}`, lastModified: contentUpdated });
      for (const tool of published.filter((item) => item.category === category)) entries.push({ url: `${siteConfig.url}/${locale}/${category}/${tool.slug}`, lastModified: contentUpdated });
    }
    for (const guide of ["prepare-images-for-web", "pdf-privacy-basics"]) entries.push({ url: `${siteConfig.url}/${locale}/guides/${guide}`, lastModified: contentUpdated });
    for (const page of ["about", "privacy", "terms", "contact"]) entries.push({ url: `${siteConfig.url}/${locale}/${page}`, lastModified: contentUpdated });
  }
  return entries;
}
