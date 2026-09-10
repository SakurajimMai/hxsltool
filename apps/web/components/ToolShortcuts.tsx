"use client";

import Link from "next/link";
import { Clock3, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@hxsl/tool-registry";
import type { ToolSearchEntry } from "../lib/search";
import { clearRecent, getFavoriteIds, getRecentIds } from "../lib/preferences";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { FavoriteButton } from "./FavoriteButton";

function ShortcutCard({ entry, locale }: { entry: ToolSearchEntry; locale: Locale }) {
  return <article className="shortcut-card"><Link href={entry.href}><span className="shortcut-card-meta">{entry.category}</span><strong>{entry.name}</strong><small>{entry.inputFormats.join(" / ")} <span aria-hidden="true">→</span> {entry.outputFormats.join(" / ")}</small></Link><FavoriteButton toolId={entry.id} locale={locale} compact /></article>;
}

export function ToolShortcuts({ entries, locale }: { entries: ToolSearchEntry[]; locale: Locale }) {
  const copy = getUpgradeCopy(locale);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const byId = useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries]);
  useEffect(() => {
    function sync() { setRecentIds(getRecentIds()); setFavoriteIds(getFavoriteIds()); }
    sync();
    window.addEventListener("hxsl:preferences-updated", sync);
    return () => window.removeEventListener("hxsl:preferences-updated", sync);
  }, []);
  const recent = recentIds.map((id) => byId.get(id)).filter((entry): entry is ToolSearchEntry => Boolean(entry));
  const favorites = favoriteIds.map((id) => byId.get(id)).filter((entry): entry is ToolSearchEntry => Boolean(entry));
  if (!recent.length && !favorites.length) return null;
  return <section className="shell shortcuts-section" aria-labelledby="shortcuts-title"><div className="shortcuts-heading"><div><span className="eyebrow">{copy.shortcuts.title}</span><h2 id="shortcuts-title">{copy.shortcuts.description}</h2></div>{recent.length > 0 && <button type="button" className="text-button" onClick={() => { clearRecent(); setRecentIds([]); }}><X size={14} aria-hidden="true" />{copy.shortcuts.clear}</button>}</div><div className="shortcuts-groups">{recent.length > 0 && <div className="shortcut-group"><h3><Clock3 size={15} aria-hidden="true" />{copy.shortcuts.recent}</h3><div className="shortcut-grid">{recent.slice(0, 4).map((entry) => <ShortcutCard key={entry.id} entry={entry} locale={locale} />)}</div></div>}{favorites.length > 0 && <div className="shortcut-group"><h3><Star size={15} aria-hidden="true" />{copy.shortcuts.favorites}</h3><div className="shortcut-grid">{favorites.slice(0, 4).map((entry) => <ShortcutCard key={entry.id} entry={entry} locale={locale} />)}</div></div>}</div></section>;
}
