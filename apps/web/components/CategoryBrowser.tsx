"use client";

import { Filter, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@hxsl/tool-registry";
import type { ToolSearchEntry } from "../lib/search";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { ToolDirectoryCard } from "./ToolDirectoryCard";

export function CategoryBrowser({ entries, locale }: { entries: ToolSearchEntry[]; locale: Locale }) {
  const copy = getUpgradeCopy(locale);
  const [format, setFormat] = useState("all");
  const formats = useMemo(() => [...new Set(entries.flatMap(entry => [...entry.inputFormats, ...entry.outputFormats]))].sort(), [entries]);
  const filtered = format === "all" ? entries : entries.filter(entry => entry.inputFormats.includes(format) || entry.outputFormats.includes(format));
  return <section className="category-browser" aria-label={copy.category.filterLabel}>
    <div className="category-toolbar">
      <label className="filter-control"><Filter size={16} aria-hidden="true" /><span>{copy.category.filterLabel}</span><select value={format} onChange={event => setFormat(event.target.value)} aria-label={copy.category.filterLabel}><option value="all">{copy.category.allFormats}</option>{formats.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
      <span className="result-count" role="status">{copy.category.showing} <strong>{filtered.length}</strong> / {entries.length}</span>
      {format !== "all" && <button type="button" className="text-button" onClick={() => setFormat("all")}><SlidersHorizontal size={14} aria-hidden="true" />{copy.category.clear}</button>}
    </div>
    {filtered.length ? <div className="tool-list">{filtered.map(entry => <ToolDirectoryCard key={entry.id} entry={entry} locale={locale} />)}</div> : <div className="empty-state"><h2>{copy.category.noMatches}</h2><p>{copy.category.noMatchesBody}</p><button type="button" className="button button-secondary" onClick={() => setFormat("all")}>{copy.category.clear}</button></div>}
  </section>;
}
