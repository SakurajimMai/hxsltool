import Link from "next/link";
import type { Locale } from "@hxsl/tool-registry";
import { getFooterCopy, getLocalePath, getMessages } from "../lib/i18n";
import { adsConfig, getAdsLegal } from "../lib/ads";
import { siteConfig } from "../../../config/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const f = getFooterCopy(locale);
  const siteName = siteConfig.name;
  return <footer className="footer"><div className="shell"><div className="footer-grid">
    <div><Link href={getLocalePath(locale)} className="brand"><span className="brand-mark">HX</span><span>{siteName}</span></Link><p>{f.tagline}</p></div>
    <div className="footer-links"><strong>{m.nav.tools}</strong><Link href={getLocalePath(locale, "/pdf")}>{m.category.pdf}</Link><Link href={getLocalePath(locale, "/image")}>{m.category.image}</Link><Link href={getLocalePath(locale, "/svg")}>{m.category.svg}</Link><Link href={getLocalePath(locale, "/icons")}>{m.category.icons}</Link></div>
    <div className="footer-links"><strong>{m.nav.guides}</strong><Link href={getLocalePath(locale, "/guides/prepare-images-for-web")}>{f.guideOne}</Link><Link href={getLocalePath(locale, "/guides/pdf-privacy-basics")}>{f.guideTwo}</Link></div>
    <div className="footer-links"><strong>HXSL</strong><Link href={getLocalePath(locale, "/about")}>{m.nav.about}</Link><Link href={getLocalePath(locale, "/privacy")}>{m.nav.privacy}</Link><Link href={getLocalePath(locale, "/terms")}>{f.terms}</Link><Link href={getLocalePath(locale, "/contact")}>{f.contact}</Link></div>
  </div><div className="legal"><span>© {new Date().getFullYear()} HXSL Tools</span><span>{adsConfig.enabled ? getAdsLegal(locale) : f.legal}</span></div></div></footer>;
}
