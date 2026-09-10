import type { Metadata } from "next";
import { headers } from "next/headers";
import { LOCALES, type Locale } from "@hxsl/tool-registry";
import { siteConfig } from "../../../config/site";
import { getLanguageCopy } from "../lib/language-copy";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "../lib/json-ld";
import { adsConfig } from "../lib/ads";
import { GoogleAdsense } from "../components/GoogleAdsense";
import "./globals.css";
import "./mobile-presentation.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: "HXSL Tools is a browser-first PDF, image, SVG and icon utility. It is not Haxe Shader Language.",
  robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: { type: "website", siteName: siteConfig.name, title: siteConfig.name, description: "Browser-first PDF, image, SVG and icon tools.", images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "HXSL Tools" }] },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: "Browser-first PDF, image, SVG and icon tools.", images: ["/og-default.png"] },
  ...(adsConfig.enabled && adsConfig.client ? { other: { "google-adsense-account": adsConfig.client } } : {}),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-hxsl-locale");
  const locale = requestLocale && LOCALES.includes(requestLocale as (typeof LOCALES)[number]) ? requestLocale : "en";
  const typedLocale = locale as Locale;
  const jsonLd = [organizationJsonLd(), websiteJsonLd()];
  const themeScript = `try{var saved=localStorage.getItem('hxsl-theme');document.documentElement.dataset.theme=saved|| (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}`;
  return <html lang={locale} dir="ltr" suppressHydrationWarning><head><link rel="preload" href="/directory-pixels.svg" as="image" /></head><body><a className="skip-link" href="#main-content">{getLanguageCopy(typedLocale).skip}</a><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} /><GoogleAdsense />{children}</body></html>;
}
