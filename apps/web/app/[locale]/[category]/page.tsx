import { LOCALES } from "@hxsl/tool-registry";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale, ToolCategory } from "@hxsl/tool-registry";
import { getCategoryDescription, getMessages, isLocale } from "../../../lib/i18n";
import { getToolSearchEntries } from "../../../lib/search";
import { localizedMetadata } from "../../../lib/metadata";
import { jsonLdScript, webPageJsonLd } from "../../../lib/json-ld";
import { CategoryBrowser } from "../../../components/CategoryBrowser";

const categories: ToolCategory[] = ["pdf", "image", "svg", "icons"];
export const dynamic = "force-dynamic";

export function generateStaticParams() { return LOCALES.flatMap((locale) => categories.map((category) => ({ locale, category }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale: rawLocale, category: rawCategory } = await params;
  if (!isLocale(rawLocale) || !categories.includes(rawCategory as ToolCategory)) return { title: "Not found" };
  const locale = rawLocale as Locale;
  const category = rawCategory as ToolCategory;
  const messages = getMessages(locale);
  return localizedMetadata(locale, `/${category}`, messages.category[category], getCategoryDescription(locale, category));
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale: rawLocale, category: rawCategory } = await params;
  if (!isLocale(rawLocale) || !categories.includes(rawCategory as ToolCategory)) notFound();
  const locale = rawLocale as Locale;
  const category = rawCategory as ToolCategory;
  const m = getMessages(locale);
  const entries = getToolSearchEntries(locale).filter((entry) => entry.category === category);
  return <main id="main-content" className="shell category-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript([webPageJsonLd(locale, `/${category}`, m.category[category], "CollectionPage")]) }} />
    <section className="page-intro"><div><div className="eyebrow">{m.nav.tools}</div><h1>{m.category[category]}</h1></div><div className="page-intro-copy"><p>{getCategoryDescription(locale, category)}</p><p className="page-count mono">{entries.length.toString().padStart(2, "0")} tools</p></div></section>
    <CategoryBrowser entries={entries} locale={locale} />
  </main>;
}
