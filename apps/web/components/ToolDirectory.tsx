"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale, ToolCategory } from "@hxsl/tool-registry";
import { getMessages } from "../lib/i18n";
import { getDirectoryCopy } from "../lib/directory-copy";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import type { ToolSearchEntry } from "../lib/search";
import { ToolSearch } from "./ToolSearch";
import { ToolDirectoryCard } from "./ToolDirectoryCard";

const categories: ToolCategory[] = ["image", "pdf", "svg", "icons"];

export function ToolDirectory({ entries, featuredIds, locale }: { entries: ToolSearchEntry[]; featuredIds: string[]; locale: Locale }) {
  const [category, setCategory] = useState("featured");
  const [query, setQuery] = useState("");
  const m = getMessages(locale);
  const copy = getDirectoryCopy(locale);
  const searchCopy = getUpgradeCopy(locale).search;
  const normalized = query.trim().toLocaleLowerCase();
  const base = category === "featured" && !normalized ? featuredIds.flatMap(id => entries.find(entry => entry.id === id) ?? []) : entries;
  const filtered = base.filter(entry => (category === "featured" || category === "all" || entry.category === category) && (!normalized || [entry.name, entry.englishName, entry.description, ...entry.keywords, ...entry.inputFormats, ...entry.outputFormats].join(" ").toLocaleLowerCase().includes(normalized)));
  return <section className="shell directory" id="tools" aria-labelledby="directory-title">
    <h2 id="directory-title" className="sr-only">{copy.browse}</h2>
    <div className="directory-toolbar">
      <div className="directory-tabs" role="group" aria-label={m.nav.tools}>
        <button type="button" aria-pressed={category === "featured"} onClick={() => setCategory("featured")}>{copy.featured}</button>
        {categories.map(item => <a href={`/${locale}/${item}`} key={item} aria-current={category === item ? "true" : undefined} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); setCategory(item); }}>{m.category[item]}</a>)}
        <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>{copy.all}</button>
      </div>
      <ToolSearch entries={category === "featured" || category === "all" ? entries : entries.filter(entry => entry.category === category)} locale={locale} variant="hero" onQueryChange={setQuery} value={query} />
    </div>
    <div className="directory-status" role="status">{normalized ? `${searchCopy.inputLabel}: ${query} · ${filtered.length}` : category === "featured" ? copy.featured : category === "all" ? `${copy.all} · ${filtered.length}` : `${m.category[category as ToolCategory]} · ${filtered.length}`}</div>
    {filtered.length ? <div className="directory-grid">{filtered.map(entry => <ToolDirectoryCard key={entry.id} entry={entry} locale={locale} />)}</div> : <div className="empty-state"><h2>{searchCopy.noResults}</h2><p>{searchCopy.noResultsBody}</p><button type="button" className="button button-secondary" onClick={() => { setCategory("all"); setQuery(""); document.querySelector<HTMLInputElement>("#hero-tool-search")?.focus(); }}>{searchCopy.browse}</button></div>}
    <nav className="directory-category-links" aria-label={searchCopy.browse}>{categories.map(item => <Link key={item} href={`/${locale}/${item}`}>{m.category[item]}</Link>)}</nav>
  </section>;
}
