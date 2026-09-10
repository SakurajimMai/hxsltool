import type { Locale, Tool } from "@hxsl/tool-registry";
import { getPublicTools, type PublicTool } from "./public-config";

const extraRelated: Record<string, string[]> = {
  "pdf.unlock-pdf": ["pdf.protect-pdf", "pdf.verify-pdf"],
  "pdf.protect-pdf": ["pdf.unlock-pdf", "pdf.verify-pdf"],
  "pdf.pdf-ocr": ["pdf.pdf-to-text", "pdf.pdf-to-jpg"],
  "pdf.pdf-to-text": ["pdf.pdf-ocr", "pdf.merge-pdf"],
  "pdf.redact-pdf": ["pdf.sanitize-pdf", "pdf.crop-pdf", "pdf.flatten-pdf"],
  "pdf.crop-pdf": ["pdf.redact-pdf", "pdf.flatten-pdf"],
  "pdf.flatten-pdf": ["pdf.redact-pdf", "pdf.sanitize-pdf"],
  "pdf.compress-pdf": ["pdf.merge-pdf", "pdf.pdf-to-jpg"],
  "pdf.merge-pdf": ["pdf.split-pdf", "pdf.compress-pdf"],
  "pdf.split-pdf": ["pdf.merge-pdf", "pdf.extract-pages"],
  "image.compress-png": ["image.image-compressor", "image.png-to-webp"],
  "image.compress-jpeg": ["image.image-compressor", "image.jpg-to-webp"],
  "image.image-compressor": ["image.compress-png", "image.compress-jpeg", "image.png-to-webp"],
  "svg.png-to-svg": ["svg.svg-to-png", "svg.svg-optimizer"],
  "svg.svg-to-png": ["svg.png-to-svg", "svg.svg-to-webp"],
  "svg.svg-to-favicon": ["icons.icon-pack", "svg.svg-optimizer"],
  "icons.icon-pack": ["svg.svg-to-favicon", "image.image-compressor"],
};

export function relatedPublicTools(locale: Locale, tool: Tool): PublicTool[] {
  const all = getPublicTools(locale);
  const ids = [...(extraRelated[tool.id] ?? []), ...tool.relatedTools].filter((id) => id !== tool.id);
  const picked: PublicTool[] = [];
  for (const id of ids) {
    const item = all.find((candidate) => candidate.id === id);
    if (item && !picked.some((existing) => existing.id === item.id)) picked.push(item);
    if (picked.length >= 3) return picked;
  }
  for (const item of all) {
    if (item.category !== tool.category || item.id === tool.id) continue;
    if (!picked.some((existing) => existing.id === item.id)) picked.push(item);
    if (picked.length >= 3) break;
  }
  return picked;
}
