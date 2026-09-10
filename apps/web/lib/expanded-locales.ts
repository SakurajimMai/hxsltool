import tr from "./locales/tr";
import vi from "./locales/vi";
import nl from "./locales/nl";
import pl from "./locales/pl";
import th from "./locales/th";
import { expandLocale, formatLocale } from "./expanded-locale-schema";
export const expanded = { tr: expandLocale(tr), vi: expandLocale(vi), nl: expandLocale(nl), pl: expandLocale(pl), th: expandLocale(th) };
export type ExpandedLocale = keyof typeof expanded;
export function isExpandedLocale(locale: string): locale is ExpandedLocale { return Object.hasOwn(expanded, locale); }
export function expandedMap<T>(select: (copy: (typeof expanded)[ExpandedLocale]) => T): Record<ExpandedLocale, T> {
  return Object.fromEntries(Object.entries(expanded).map(([locale, copy]) => [locale, select(copy)])) as Record<ExpandedLocale, T>;
}
export const expandedPacks = expandedMap(c => ({
  name: c.name,
  messages: { nav: c.nav, home: c.home, workspace: c.workspace, category: c.categories, common: c.common },
  page: { about: c.about, privacy: c.privacy, terms: c.terms, contact: c.contact, tool: c.toolPage },
  category: c.categoryDescriptions, directory: c.directory,
  home: {
    trust: [c.trust.account, c.trust.browser, c.trust.formats, c.trust.retention] as [string, string, string, string],
    browseTitle: c.home.featuredDescription, browseDescription: c.directory.browse,
    workflowItems: [["01", c.toolPage.addTitle, c.toolPage.addBody], ["02", c.toolPage.optionsTitle, c.toolPage.optionsBody], ["03", c.toolPage.checkTitle, c.toolPage.checkBody], ["04", c.tool.continue, c.toolPage.relatedIntro]] as Array<[string, string, string]>,
  },
  footer: c.footer, faq: c.faq,
  upgrade: { navigation: c.navigation, search: c.search, shortcuts: c.shortcuts, category: c.filter, tool: c.tool },
}));
export function packMap<T>(select: (copy: (typeof expandedPacks)[ExpandedLocale]) => T): Record<ExpandedLocale, T> {
  return Object.fromEntries(Object.entries(expandedPacks).map(([locale, copy]) => [locale, select(copy)])) as Record<ExpandedLocale, T>;
}
export const expandedTools = expandedMap(c => ({
  names: c.names, options: c.options, signature: c.signature,
  thumbnails: { ...c.thumbnails, limited: (count: number) => formatLocale(c.thumbnails.limited, { count }) },
  guides: {
    "prepare-images-for-web": { title: c.guideImage.title, intro: c.guideImage.intro, sections: [[c.guideImage.formatTitle, c.guideImage.formatBody], [c.guideImage.resizeTitle, c.guideImage.resizeBody], [c.guideImage.checkTitle, c.guideImage.checkBody]] as Array<[string, string]> },
    "pdf-privacy-basics": { title: c.guidePdf.title, intro: c.guidePdf.intro, sections: [[c.guidePdf.taskTitle, c.guidePdf.taskBody], [c.guidePdf.checkTitle, c.guidePdf.checkBody], [c.guidePdf.modeTitle, c.guidePdf.modeBody]] as Array<[string, string]> },
  },
}));
export function expandedToolName(locale: ExpandedLocale, name: string) {
  const copy = expanded[locale];
  const names: Record<string, string> = copy.names;
  if (names[name]) return names[name];
  if (name.startsWith("Compress ")) return formatLocale(copy.dynamic.compress, { format: name.slice(9) });
  const [from, to] = name.split(" to ");
  if (to) return formatLocale(copy.dynamic.convert, { from, to: to === "Text" ? copy.dynamic.text : to === "Favicon" ? copy.dynamic.favicon : to });
  throw new Error(`Missing ${locale} tool name: ${name}`);
}
