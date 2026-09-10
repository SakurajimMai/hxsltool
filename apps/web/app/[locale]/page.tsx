import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@hxsl/tool-registry";
import { getHomeCopy, getFooterCopy, getLocalePath, getMessages, isLocale } from "../../lib/i18n";
import { getPublicTools } from "../../lib/public-config";
import { getToolSearchEntries } from "../../lib/search";
import { getDirectoryCopy } from "../../lib/directory-copy";
import { localizedMetadata } from "../../lib/metadata";
import { jsonLdScript, webPageJsonLd } from "../../lib/json-ld";
import { ToolDirectory } from "../../components/ToolDirectory";
import { ToolShortcuts } from "../../components/ToolShortcuts";

const featured = ["pdf.merge-pdf", "image.image-compressor", "svg.png-to-svg", "icons.icon-pack", "pdf.pdf-to-jpg", "svg.svg-optimizer"];
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { title: "Not found" };
  const copy = getDirectoryCopy(locale);
  return localizedMetadata(locale, "", copy.title, getMessages(locale).home.description);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const m = getMessages(locale);
  const h = getHomeCopy(locale);
  const f = getFooterCopy(locale);
  const copy = getDirectoryCopy(locale);
  const registry = getPublicTools(locale);
  const entries = getToolSearchEntries(locale);
  const configured = registry.filter(tool => tool.publicOperational.featured).sort((a, b) => a.publicOperational.displayOrder - b.publicOperational.displayOrder);
  const featuredIds = (configured.length ? configured.map(tool => tool.id) : featured.filter(id => registry.some(tool => tool.id === id))).slice(0, 8);
  return <main id="main-content" className="directory-home">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript([webPageJsonLd(locale, "", copy.title)]) }} />
    <section className="shell directory-intro">
      <h1>{copy.title}<span>{copy.subtitle}</span></h1>
      <ul className="directory-trust">{h.trust.slice(0, 3).map(item => <li key={item}><Check size={16} strokeWidth={1.6} aria-hidden="true" />{item}</li>)}</ul>
    </section>
    <ToolDirectory entries={entries} featuredIds={featuredIds} locale={locale} />
    <ToolShortcuts entries={entries} locale={locale} />
    <section className="shell directory-help">
      <h2>{copy.help}</h2>
      <div className="directory-steps">{h.workflowItems.map(([, title, body], index) => <article key={title}><span className="step-number" aria-hidden="true">{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
    <section className="shell directory-bottom">
      <div><h2>{m.home.privacyTitle}</h2><p>{m.workspace.serverConsent} {h.workflowItems[1][2]}</p><Link className="text-link" href={getLocalePath(locale, "/privacy")}>{m.nav.privacy}<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <div className="directory-guides"><h2>{m.nav.guides}</h2><Link href={getLocalePath(locale, "/guides/prepare-images-for-web")}>{f.guideOne}<ArrowUpRight size={16} aria-hidden="true" /></Link><Link href={getLocalePath(locale, "/guides/pdf-privacy-basics")}>{f.guideTwo}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </section>
  </main>;
}
