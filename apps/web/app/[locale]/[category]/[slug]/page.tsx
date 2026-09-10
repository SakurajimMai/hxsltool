import { LOCALES } from "@hxsl/tool-registry";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import type { Locale } from "@hxsl/tool-registry";
import { getPublishedTools, getTool, tools } from "@hxsl/tool-registry";
import { getLocalePath, getLocalizedOptionLabel, getLocalizedToolLimits, getMessages, isLocale } from "../../../../lib/i18n";
import { getPublicToolByRoute, getPublicToolName, getPublicToolDescription } from "../../../../lib/public-config";
import { localizedMetadata } from "../../../../lib/metadata";
import { breadcrumbJsonLd, jsonLdScript, webApplicationJsonLd } from "../../../../lib/json-ld";
import { relatedPublicTools } from "../../../../lib/related-tools";
import { getUpgradeCopy } from "../../../../lib/upgrade-copy";
import { maintenanceCopy } from "../../../../lib/visible-extras";
import { siteConfig } from "../../../../../../config/site";
import { FavoriteButton } from "../../../../components/FavoriteButton";
import { ToolShell } from "../../../../components/ToolShell";
import { ToolWorkspace } from "../../../../components/ToolWorkspace";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return getPublishedTools("en").flatMap((tool) => LOCALES.map((locale) => ({ locale, category: tool.category, slug: tool.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, category, slug } = await params;
  if (!isLocale(rawLocale)) return { title: "Not found", robots: { index: false, follow: false } };
  const tool = getPublicToolByRoute(category, slug, rawLocale);
  if (!tool) return { title: "Not found", robots: { index: false, follow: false } };
  const content = tool.publicContent?.payload;
  return localizedMetadata(rawLocale, `/${category}/${slug}`, content?.title ?? getPublicToolName(rawLocale, tool), content?.metaDescription ?? getPublicToolDescription(rawLocale, tool));
}

export default async function ToolPage({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale: rawLocale, category, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const tool = getPublicToolByRoute(category, slug, locale);
  if (!tool) notFound();
  const m = getMessages(locale);
  const content = tool.publicContent?.payload;
  const localizedName = content?.h1 ?? getPublicToolName(locale, tool);
  const localizedDescription = content?.description ?? getPublicToolDescription(locale, tool);
  const workspaceTool = { ...tool, name: localizedName, shortDescription: localizedDescription, optionSchema: tool.optionSchema.map((option) => ({ ...option, label: getLocalizedOptionLabel(locale, option.label) })) };
  const related = relatedPublicTools(locale, tool);
  const localizedBoundary = tool.processingMode === "local" ? m.workspace.local : tool.processingMode === "server" ? m.workspace.server : m.workspace.hybrid;
  const faq = content?.faq?.length ? content.faq : [];
  const pageUrl = `${siteConfig.url}${getLocalePath(locale, `/${category}/${slug}`)}`;
  const jsonLd = [
    breadcrumbJsonLd([{ name: m.category[tool.category], url: `${siteConfig.url}${getLocalePath(locale, `/${tool.category}`)}` }, { name: localizedName, url: pageUrl }]),
    webApplicationJsonLd(localizedName, localizedDescription, pageUrl),
  ];
  return <main id="main-content"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} /><ToolShell locale={locale} tool={tool} localizedName={localizedName} localizedDescription={localizedDescription} localizedBoundary={localizedBoundary} workspace={<>{!tool.publicOperational.acceptingNewTasks || tool.publicOperational.maintenance.state !== "active" ? <div className="tool-maintenance shell" role="status"><strong>{tool.publicOperational.maintenance.message || maintenanceCopy[locale].title}</strong><span>{maintenanceCopy[locale].body}</span></div> : null}<ToolWorkspace tool={workspaceTool} locale={locale} relatedTools={related.flatMap((item) => item ? [{ id: item.id, inputFormats: item.inputFormats, name: getPublicToolName(locale, item), path: `/${item.category}/${item.slug}` }] : [])} acceptingNewTasks={tool.publicOperational.acceptingNewTasks && tool.publicOperational.maintenance.state === "active"} maintenanceMessage={tool.publicOperational.maintenance.message || maintenanceCopy[locale].title} /></>}><div className="tool-copy"><div><h2>{m.common.steps}</h2><p className="tool-card-copy">{content?.statusText ?? m.home.workflowDescription}</p></div><ol className="copy-stack content-steps">{(content?.steps ?? []).map((step, index) => <li key={`${index}-${step}`}><strong>{String(index + 1).padStart(2, "0")}</strong><span>{step}</span></li>)}</ol><div className="copy-stack"><div><h3>{m.common.limits}</h3><p>{getLocalizedToolLimits(locale, workspaceTool)}</p></div><div><h3>{m.common.privacy}</h3><p>{content?.privacyText ?? (tool.processingMode === "local" ? m.home.privacyDescription : m.workspace.serverConsent)}</p></div><div><h3>{m.common.output}</h3><p>{content?.resultText ?? m.common.honest}</p></div><div><h3>{getUpgradeCopy(locale).tool.options}</h3><p>{content?.parameterHelp}</p></div></div><section className="faq-block" aria-labelledby="tool-faq-title"><h2 id="tool-faq-title">{m.common.faq}</h2><div className="faq-list">{faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section></div></ToolShell><section className="shell section-block related-tools"><div className="section-heading"><div><div className="eyebrow">{m.common.related}</div><h2>{m.common.related}</h2></div></div><div className="tool-grid">{related.map((item) => item && <article className="tool-card" key={item.id}><Link className="tool-card-link" href={getLocalePath(locale, `/${item.category}/${item.slug}`)}><div className="tool-meta"><span>{item.inputFormats.join(" / ")} <span aria-hidden="true">→</span> {item.outputFormats.join(" / ")}</span><ArrowUpRight size={15} aria-hidden="true" /></div><h3>{getPublicToolName(locale, item)}</h3><p className="tool-card-copy">{getPublicToolDescription(locale, item)}</p></Link><FavoriteButton toolId={item.id} locale={locale} compact /></article>)}</div></section></main>;
}
