const favoritesKey = "hxsl-favorites";
const recentKey = "hxsl-recent-tools";
const maxRecent = 8;

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(ids)); window.dispatchEvent(new CustomEvent("hxsl:preferences-updated")); } catch { /* private mode can reject storage */ }
}

export function getFavoriteIds(): string[] { return readIds(favoritesKey); }
export function getRecentIds(): string[] { return readIds(recentKey).slice(0, maxRecent); }
export function isFavorite(id: string): boolean { return getFavoriteIds().includes(id); }
export function toggleFavorite(id: string): boolean { const next = getFavoriteIds().filter((value) => value !== id); const active = next.length === getFavoriteIds().length; writeIds(favoritesKey, active ? [...next, id] : next); return active; }
export function removeFavorite(id: string) { writeIds(favoritesKey, getFavoriteIds().filter((value) => value !== id)); }
export function recordRecent(id: string) { writeIds(recentKey, [id, ...getRecentIds().filter((value) => value !== id)].slice(0, maxRecent)); }
export function clearRecent() { writeIds(recentKey, []); }
export function presetStorageKey(toolId: string) { return `hxsl-preset:${toolId}`; }
