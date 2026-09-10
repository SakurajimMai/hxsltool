import type { Metadata } from "next";
import { LOCALES, type Locale } from "@hxsl/tool-registry";
import { siteConfig } from "../../../config/site";
import { getLocalePath } from "./i18n";

const ogImage = { url: "/og-default.png", width: 1200, height: 630, alt: "HXSL Tools — browser-first PDF, image, SVG and icon utilities" };

export function localizedMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((item) => [item, getLocalePath(item, path)]));
  languages["x-default"] = getLocalePath("en", path);
  const url = getLocalePath(locale, path);
  return {
    title,
    description,
    robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { type: "website", siteName: siteConfig.name, title, description, url, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}
