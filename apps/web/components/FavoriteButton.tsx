"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@hxsl/tool-registry";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { isFavorite, toggleFavorite } from "../lib/preferences";

export function FavoriteButton({ toolId, locale, compact = false }: { toolId: string; locale: Locale; compact?: boolean }) {
  const [active, setActive] = useState(false);
  const copy = getUpgradeCopy(locale);
  useEffect(() => { setActive(isFavorite(toolId)); }, [toolId]);
  function update(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setActive(toggleFavorite(toolId));
  }
  const label = active ? copy.tool.unfavorite : copy.tool.favorite;
  return <button type="button" className={`favorite-button${active ? " is-active" : ""}${compact ? " is-compact" : ""}`} onClick={update} aria-label={label} aria-pressed={active} title={label}><Star size={compact ? 15 : 17} fill={active ? "currentColor" : "none"} aria-hidden="true" /><span className={compact ? "sr-only" : ""}>{label}</span></button>;
}
