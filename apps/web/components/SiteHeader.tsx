import Link from "next/link";
import type { Locale, ToolCategory } from "@hxsl/tool-registry";
import { getLocalePath, getMessages } from "../lib/i18n";
import { getToolSearchEntries } from "../lib/search";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelect } from "./LanguageSelect";
import { MobileMenu } from "./MobileMenu";
import { ToolSearch } from "./ToolSearch";
import { CategoryNavLink } from "./CategoryNavLink";
import { MoreMenu } from "./MoreMenu";
import { siteConfig } from "../../../config/site";

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const copy = getUpgradeCopy(locale);
  const siteName = siteConfig.name;
  const categories: ToolCategory[] = ["pdf", "image", "svg", "icons"];
  const entries = getToolSearchEntries(locale);
  return <header className="shell topbar">
    <div className="header-left"><Link href={getLocalePath(locale)} className="brand"><span className="brand-mark" aria-hidden="true">HX</span><span>{siteName}</span></Link><nav className="nav-links" aria-label={m.nav.tools}>{categories.map((category) => <CategoryNavLink href={getLocalePath(locale, `/${category}`)} key={category}>{m.category[category]}</CategoryNavLink>)}<MoreMenu label={copy.navigation.more} items={[{ href: getLocalePath(locale, "/guides/prepare-images-for-web"), label: m.nav.guides }, { href: getLocalePath(locale, "/privacy"), label: m.nav.privacy }, { href: getLocalePath(locale, "/about"), label: m.nav.about }]} /></nav></div>
    <div className="top-actions"><ToolSearch entries={entries} locale={locale} /><LanguageSelect locale={locale} /><ThemeToggle locale={locale} /><MobileMenu locale={locale} categories={categories.map((category) => ({ slug: category, label: m.category[category] }))} /></div>
  </header>;
}
