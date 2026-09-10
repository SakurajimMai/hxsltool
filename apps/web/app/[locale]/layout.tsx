import { notFound } from "next/navigation";
import type { Locale } from "@hxsl/tool-registry";
import { LOCALES } from "@hxsl/tool-registry";
import { isLocale } from "../../lib/i18n";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { AdSlot } from "../../components/AdSlot";
import { adsConfig } from "../../lib/ads";

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <div lang={locale} className="public-site"><SiteHeader locale={locale as Locale} />{children}{adsConfig.enabled && adsConfig.slot ? <div className="shell"><AdSlot locale={locale as Locale} /></div> : null}<SiteFooter locale={locale as Locale} /></div>;
}
