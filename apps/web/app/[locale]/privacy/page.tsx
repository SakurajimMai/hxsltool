import type { Metadata } from "next";
import type { Locale } from "@hxsl/tool-registry";
import { notFound } from "next/navigation";
import { getMessages, getPageCopy, isLocale } from "../../../lib/i18n";
import { localizedMetadata } from "../../../lib/metadata";
import { adsConfig, getAdsNotice } from "../../../lib/ads";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) return { title: "Not found" }; const locale = rawLocale as Locale; const copy = getPageCopy(locale); return localizedMetadata(locale, "/privacy", copy.privacy.title, copy.privacy.intro); }
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound(); const locale = rawLocale as Locale; const m = getMessages(locale); const copy = getPageCopy(locale); return <main className="shell content-page"><div className="eyebrow">{m.nav.privacy}</div><h1>{copy.privacy.title}</h1><p>{copy.privacy.intro}</p><h2>{copy.privacy.serverTitle}</h2><p>{copy.privacy.serverBody}</p><h2>{copy.privacy.retainedTitle}</h2><p>{copy.privacy.retainedBody}</p><p>{localePrivacy[locale]}</p>{adsConfig.enabled ? <p>{getAdsNotice(locale)}</p> : null}<h2>{copy.privacy.limitsTitle}</h2><p>{copy.privacy.limitsBody}</p></main>; }
import { localePrivacy } from "../../../lib/locale-privacy";
