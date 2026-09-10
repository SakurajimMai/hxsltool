import type { Metadata } from "next";
import type { Locale } from "@hxsl/tool-registry";
import { notFound } from "next/navigation";
import { getPageCopy, isLocale } from "../../../lib/i18n";
import { localizedMetadata } from "../../../lib/metadata";
import { siteConfig } from "../../../../../config/site";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) return { title: "Not found" }; const locale = rawLocale as Locale; const copy = getPageCopy(locale); return localizedMetadata(locale, "/terms", copy.terms.title, copy.terms.intro); }
export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound(); const locale = rawLocale as Locale; const copy = getPageCopy(locale); return <main className="shell content-page"><div className="eyebrow">{siteConfig.name}</div><h1>{copy.terms.title}</h1><p>{copy.terms.intro}</p><h2>{copy.terms.boundaryTitle}</h2><p>{copy.terms.boundaryBody}</p><h2>{copy.terms.fairTitle}</h2><p>{copy.terms.fairBody}</p></main>; }
