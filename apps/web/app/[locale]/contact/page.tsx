import type { Metadata } from "next";
import type { Locale } from "@hxsl/tool-registry";
import { notFound } from "next/navigation";
import { getPageCopy, isLocale } from "../../../lib/i18n";
import { localizedMetadata } from "../../../lib/metadata";
import { jsonLdScript, webPageJsonLd } from "../../../lib/json-ld";
import { getContactExtras } from "../../../lib/visible-extras";
import { siteConfig } from "../../../../../config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return { title: "Not found" };
  const locale = rawLocale as Locale;
  const copy = getPageCopy(locale);
  return localizedMetadata(locale, "/contact", copy.contact.title, copy.contact.intro);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const copy = getPageCopy(locale);
  const extras = getContactExtras(locale);
  const email = siteConfig.contactEmail;
  return <main className="shell content-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript([webPageJsonLd(locale, "/contact", copy.contact.title, "ContactPage")]) }} />
    <div className="eyebrow">{siteConfig.name}</div>
    <h1>{copy.contact.title}</h1>
    <p>{copy.contact.intro}</p>
    <p>{extras.extra}</p>
    {email ? <p><a className="button button-primary" href={`mailto:${email}`}>{email}</a></p> : <div className="callout"><p>{copy.contact.missing}</p></div>}
    <h2>{extras.helpTitle}</h2>
    <ul>{extras.items.map((item) => <li key={item}>{item}</li>)}</ul>
  </main>;
}
