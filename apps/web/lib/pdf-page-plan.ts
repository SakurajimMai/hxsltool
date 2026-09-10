import { PdfPageError } from "./pdf-page-copy";

/** Zero-based processing plans; thumbnails must never replace the full document plan. */
export function browserPageSelection(value: string, count: number): number[] {
  if (!value.trim() || value.trim().toLowerCase() === "all") return Array.from({ length: count }, (_, index) => index);
  const pages = new Set<number>();
  for (const part of value.split(",")) {
    if (!/^\d+(?:\s*-\s*\d+)?$/.test(part.trim())) throw new PdfPageError("range", count);
    const [firstText, lastText] = part.trim().split("-"); const first = Number(firstText), last = lastText === undefined ? first : Number(lastText);
    if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) || first < 1 || last < first || last > count) throw new PdfPageError("range", count);
    for (let page = first; page <= last; page++) pages.add(page - 1);
  }
  return [...pages].sort((left, right) => left - right);
}
export function reorderPageSelection(value: string, count: number): number[] {
  if (!value.trim()) return Array.from({ length: count }, (_, index) => index);
  const parts = value.split(","), order = parts.map(part => Number(part.trim()) - 1);
  if (parts.some(part => !/^\d+$/.test(part.trim())) || order.length !== count || order.some(page => !Number.isSafeInteger(page) || page < 0 || page >= count) || new Set(order).size !== count) throw new PdfPageError("order", count);
  return order;
}
export function duplicatePageSelection(count: number, selected: number[], times: string, position: string, maxPages: number): number[] {
  const repeats = Number(times), at = Number(position);
  if (!Number.isSafeInteger(repeats) || repeats < 1 || repeats > 10) throw new PdfPageError("repeats");
  if (!Number.isSafeInteger(at) || at < 0 || at > count) throw new PdfPageError("position", count);
  if (count + selected.length * repeats > maxPages) throw new PdfPageError("limit", maxPages);
  const order = Array.from({ length: count }, (_, index) => index);
  order.splice(at, 0, ...selected.flatMap(page => Array.from({ length: repeats }, () => page)));
  return order;
}
