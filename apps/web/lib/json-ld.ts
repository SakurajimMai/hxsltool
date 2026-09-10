import type { Locale } from "@hxsl/tool-registry";
import { siteConfig } from "../../../config/site";
import { getLocalePath } from "./i18n";

const description = "HXSL Tools is a browser-first PDF, image, SVG and icon utility. It is not Haxe Shader Language. Local tasks stay in the tab; server tasks require consent and expire after 15 minutes.";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: ["HXSL Tools"],
    url: siteConfig.url,
    logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon-512.png`, width: 512, height: 512 },
    image: `${siteConfig.url}/og-default.png`,
    description,
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: [...siteConfig.locales],
    description,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

export function webPageJsonLd(locale: Locale, path: string, name: string, extraType?: "AboutPage" | "ContactPage" | "CollectionPage") {
  const url = `${siteConfig.url}${getLocalePath(locale, path)}`;
  return {
    "@context": "https://schema.org",
    "@type": extraType ? [extraType, "WebPage"] : "WebPage",
    name,
    url,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    about: { "@type": "Organization", name: siteConfig.name },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}

export function webApplicationJsonLd(name: string, descriptionText: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description: descriptionText,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "JavaScript enabled for file processing",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}

export function jsonLdScript(data: unknown[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
