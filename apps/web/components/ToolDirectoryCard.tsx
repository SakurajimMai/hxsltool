import Link from "next/link";
import { ArrowDownToLine, ArrowLeftRight, Crop, FileImage, Files, FileText, Maximize, Minimize, PenLine, ScanLine, Shapes, Sparkles } from "lucide-react";
import type { Locale } from "@hxsl/tool-registry";
import type { ToolSearchEntry } from "../lib/search";
import { getDirectoryCopy } from "../lib/directory-copy";
import { FavoriteButton } from "./FavoriteButton";

function taskIcon(entry: ToolSearchEntry) {
  if (/compress|optim/.test(entry.id)) return ArrowDownToLine;
  if (/merge|pack/.test(entry.id)) return Files;
  if (/resize|upscale/.test(entry.id)) return Maximize;
  if (/crop/.test(entry.id)) return Crop;
  if (/split|extract/.test(entry.id)) return Minimize;
  if (/sign|watermark/.test(entry.id)) return PenLine;
  if (/ocr|scan/.test(entry.id)) return ScanLine;
  if (/to-/.test(entry.id)) return ArrowLeftRight;
  return entry.category === "pdf" ? FileText : entry.category === "image" ? FileImage : entry.category === "svg" ? Shapes : Sparkles;
}

export function ToolDirectoryCard({ entry, locale }: { entry: ToolSearchEntry; locale: Locale }) {
  const Icon = taskIcon(entry);
  const copy = getDirectoryCopy(locale);
  const mode = entry.processingMode === "local" ? copy.local : entry.processingMode === "server" ? copy.server : copy.consent;
  return <article className="directory-card tool-list-card">
    <Link className="directory-card-link" href={entry.href}>
      <Icon size={25} strokeWidth={1.65} aria-hidden="true" />
      <h3>{entry.name}</h3>
      <p>{entry.description}</p>
      <span className="directory-formats">{entry.inputFormats.join(" / ")} <span aria-hidden="true">→</span> {entry.outputFormats.join(" / ")}</span>
      <span className="directory-mode">{mode}</span>
    </Link>
    <FavoriteButton toolId={entry.id} locale={locale} compact />
  </article>;
}
