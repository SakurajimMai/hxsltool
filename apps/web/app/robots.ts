import type { MetadataRoute } from "next";
import { siteConfig } from "../../../config/site";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) return { rules: { userAgent: "*", disallow: ["/"] }, host: siteConfig.url };
  const localeAllows = siteConfig.locales.map((locale) => `/${locale}`);
  return {
    rules: [
      { userAgent: "*", allow: [...localeAllows, "/llms.txt", "/llms-full.txt", "/ads.txt", "/icon.svg", "/og-default.png", "/og-default.webp", "/favicon.ico"], disallow: ["/api/", "/admin", "/*?"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
