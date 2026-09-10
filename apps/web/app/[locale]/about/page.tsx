import type { Metadata } from "next";
import type { Locale } from "@hxsl/tool-registry";
import { notFound } from "next/navigation";
import { getPageCopy, isLocale } from "../../../lib/i18n";
import { localizedMetadata } from "../../../lib/metadata";
import { jsonLdScript, webPageJsonLd } from "../../../lib/json-ld";
import { getAboutExtras } from "../../../lib/visible-extras";
import { siteConfig } from "../../../../../config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return { title: "Not found" };
  const locale = rawLocale as Locale;
  const copy = getPageCopy(locale);
  return localizedMetadata(locale, "/about", copy.about.title, copy.about.intro);
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const copy = getPageCopy(locale);
  const extras = getAboutExtras(locale);
  return <main className="shell content-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript([webPageJsonLd(locale, "/about", copy.about.title, "AboutPage")]) }} />
    <div className="eyebrow">{siteConfig.name}</div>
    <h1>{copy.about.title}</h1>
    <p>{copy.about.intro}</p>
    <h2>{copy.about.whatTitle}</h2>
    <p>{copy.about.whatBody}</p>
    <p>{extras.catalog}</p>
    <h2>{copy.about.limitsTitle}</h2>
    <p>{copy.about.limitsBody}</p>
    <p>{extras.identity}</p>
  </main>;
}
