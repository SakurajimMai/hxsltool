"use client";

import Link from "next/link";
import { Command, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@hxsl/tool-registry";
import type { ToolSearchEntry } from "../lib/search";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { FavoriteButton } from "./FavoriteButton";

function filterEntries(entries: ToolSearchEntry[], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return entries.slice(0, 6);
  return entries.filter((entry) => [entry.name, entry.englishName, entry.description, entry.category, ...entry.inputFormats, ...entry.outputFormats, ...entry.keywords].join(" ").toLocaleLowerCase().includes(normalized)).slice(0, 8);
}

function ResultList({ entries, locale, activeIndex, onPick, prefix = "search-result" }: { entries: ToolSearchEntry[]; locale: Locale; activeIndex?: number; onPick?: () => void; prefix?: string }) {
  return <div className="search-results" role="list" aria-label={getUpgradeCopy(locale).search.inputLabel}>{entries.map((entry, index) => <div className={`search-result${activeIndex === index ? " is-active" : ""}`} id={`${prefix}-${entry.id}`} role="listitem" key={entry.id}><Link href={entry.href} onClick={onPick}><span className="search-result-icon"><Search size={15} aria-hidden="true" /></span><span className="search-result-copy"><strong>{entry.name}</strong><small>{entry.inputFormats.join(" / ")} <span aria-hidden="true">→</span> {entry.outputFormats.join(" / ")}</small></span></Link><FavoriteButton toolId={entry.id} locale={locale} compact /></div>)}</div>;
}

export function ToolSearch({ entries, locale, variant = "compact", onQueryChange, value }: { entries: ToolSearchEntry[]; locale: Locale; variant?: "compact" | "hero"; onQueryChange?: (query: string) => void; value?: string }) {
  const copy = getUpgradeCopy(locale);
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState("");
  const query = value ?? internalQuery;
  function setQuery(next: string) { setInternalQuery(next); onQueryChange?.(next); }
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const matches = useMemo(() => filterEntries(entries, query), [entries, query]);

  function openSearch() {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function closeSearch() {
    setOpen(false);
    restoreRef.current?.focus();
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const target = matches[activeIndex] ?? matches[0];
    if (target) {
      if (variant === "compact") closeSearch();
      else setFocused(false);
      router.push(target.href);
    }
  }
  function handleKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) { if (event.key === "Enter") event.preventDefault(); return; }
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => Math.min(value + 1, Math.max(0, matches.length - 1))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => Math.max(0, value - 1)); }
    if (event.key === "Escape" && variant === "compact") { event.preventDefault(); closeSearch(); }
  }
  useEffect(() => {
    if (variant !== "compact") return;
    function onShortcut(event: KeyboardEvent) { if (!event.isComposing && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); } }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });
  useEffect(() => { setActiveIndex(0); }, [query]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function trapFocus(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.key === "Escape") { event.preventDefault(); closeSearch(); return; }
      if (event.key !== "Tab") return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>(".command-panel button, .command-panel input, .command-panel a[href]")).filter(node => node.offsetParent !== null);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", trapFocus);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", trapFocus); };
  }, [open]);

  if (variant === "hero") return <form className="hero-search" role="search" onSubmit={submit}><label className="sr-only" htmlFor="hero-tool-search">{copy.search.inputLabel}</label><div className="search-input-wrap"><Search size={18} aria-hidden="true" /><input id="hero-tool-search" ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} onKeyDown={handleKeys} placeholder={copy.search.placeholder} autoComplete="off" />{query && <button type="button" className="icon-button search-clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label={copy.search.clear}><X size={16} aria-hidden="true" /></button>}<button type="submit" className="search-submit" aria-label={copy.navigation.search}><span aria-hidden="true">↵</span></button></div><small>{copy.search.hint} <kbd>Ctrl K</kbd></small>{focused && query && (!onQueryChange || matches.length > 0) && <div className="search-popover">{matches.length ? <ResultList entries={matches} locale={locale} prefix="hero-search-result" onPick={() => setFocused(false)} /> : <div className="search-empty"><strong>{copy.search.noResults}</strong><span>{copy.search.noResultsBody}</span></div>}</div>}</form>;

  return <><button type="button" className="search-trigger" onClick={openSearch} aria-label={copy.navigation.search}><Search size={16} aria-hidden="true" /><span>{copy.navigation.search}</span><kbd><Command size={11} aria-hidden="true" />K</kbd></button>{open && <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSearch(); }}><section className="command-panel" role="dialog" aria-modal="true" aria-labelledby="command-title"><div className="command-heading"><div><span className="eyebrow">{copy.search.command}</span><h2 id="command-title">{copy.search.placeholder}</h2></div><button type="button" className="icon-button" onClick={closeSearch} aria-label={copy.navigation.close}><X size={17} aria-hidden="true" /></button></div><form role="search" onSubmit={submit}><label className="sr-only" htmlFor="command-search">{copy.search.inputLabel}</label><div className="search-input-wrap command-input"><Search size={18} aria-hidden="true" /><input id="command-search" ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeys} placeholder={copy.search.placeholder} autoComplete="off" aria-controls="command-results" aria-describedby={matches[activeIndex] ? `search-result-${matches[activeIndex].id}` : undefined} /><button type="button" className="icon-button" onClick={() => setQuery("")} aria-label={copy.search.clear}><X size={15} aria-hidden="true" /></button></div></form><div id="command-results">{matches.length ? <ResultList entries={matches} locale={locale} activeIndex={activeIndex} onPick={closeSearch} /> : <div className="search-empty"><strong>{copy.search.noResults}</strong><span>{copy.search.noResultsBody}</span><Link className="text-link" href={`/${locale}/pdf`} onClick={closeSearch}>{copy.search.browse}</Link></div>}</div><p className="command-help"><kbd>↑</kbd><kbd>↓</kbd> {copy.search.hint} <kbd>Esc</kbd> {copy.navigation.close}</p></section></div>}</>;
}
