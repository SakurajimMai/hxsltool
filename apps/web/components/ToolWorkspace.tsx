"use client";
import { getWorkspaceCopy, getLocalizedChoice } from "../lib/workspace-copy";
import { expandedMap, expandedTools } from "../lib/expanded-locales";
import { additionalToolCopy } from "../lib/additional-tool-copy";

import JSZip from "jszip";
import QRCode from "qrcode";
import Link from "next/link";
import { ArrowUp, ArrowDown, FileDown, FileUp, LoaderCircle, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { Tool } from "@hxsl/tool-registry";
import type { Locale } from "@hxsl/tool-registry";
import type { PDFDocumentLoadingTask, PDFWorker } from "pdfjs-dist";
import { limits } from "../../../config/limits";
import { getCancelLabel, getLocalePath, getLocalizedOptionLabel, getMessages, getStatusLabel } from "../lib/i18n";
import { canContinueFile, createClientId, storeSessionFile, takeSessionFile } from "../lib/session-files";
import { recordRecent } from "../lib/preferences";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { PresetControl } from "./PresetControl";
import { requestedImageFormat, ImageEncodingError, imageProcessingError } from "../lib/image-format";
import { archiveEntryNames } from "../lib/archive-names";
import { includedInResult, resultInput, type ResultInput } from "../lib/result-summary";
import { FileResultSummary } from "./FileResultSummary";
import { checkImageSize, pixelRegionsSvg, svgOutputSize, vectorSampleSize } from "../lib/svg-dimensions";
import { decodeSvgImage } from "../lib/svg-canvas";
import { browserPageSelection, duplicatePageSelection, reorderPageSelection } from "../lib/pdf-page-plan";
import { PdfPageError, pdfPageMessage } from "../lib/pdf-page-copy";
import { currentOutput, defaultWorkspaceOptions, pendingInputs, requeueGroup, staleResult } from "../lib/workspace-state";

type QueueItem = { id: string; file: File; status: "waiting" | "working" | "ready" | "failed" | "cancelled"; output?: File; resultInput?: ResultInput; error?: string; attemptRevision?: number; resultRevision?: number; preflightFailed?: boolean };

function bytes(size: number) { if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; return `${(size / 1024 / 1024).toFixed(2)} MB`; }
function outputExtension(tool: Tool): string { const output = tool.outputFormats[0].toLowerCase(); return output === "jpeg" ? "jpg" : output; }
function outputMime(format: string): string { return format === "jpg" || format === "jpeg" ? "image/jpeg" : format === "png" ? "image/png" : format === "webp" ? "image/webp" : format === "avif" ? "image/avif" : "application/octet-stream"; }
function nameFor(file: File, extension: string) { return `${file.name.replace(/\.[^.]+$/, "")}.${extension}`; }
function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer; }
function bytesFromDataUrl(value: string): Uint8Array {
  const encoded = value.split(",", 2)[1] ?? ""; const binary = atob(encoded); const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function textPosition(position: string | undefined, width: number, height: number, textWidth: number, size: number) {
  const margin = 36;
  const x = position?.endsWith("left") ? margin : position?.endsWith("right") ? Math.max(margin, width - margin - textWidth) : (width - textWidth) / 2;
  const y = position?.startsWith("top") ? height - margin - size : position === "center" ? (height - size) / 2 : margin;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

function inputImageFormat(file: File): string {
  const type = file.type.split("/")[1]?.toLowerCase();
  if (type === "jpeg") return "jpg";
  if (["png", "jpg", "webp", "avif"].includes(type ?? "")) return type!;
  return file.name.split(".").pop()?.toLowerCase() === "jpeg" ? "jpg" : file.name.split(".").pop()?.toLowerCase() || "png";
}

async function canvasImage(file: File, tool: Pick<Tool, "slug" | "limits" | "outputFormats">, options: Record<string, string>): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const format = requestedImageFormat(tool, inputImageFormat(file), options.outputFormat);
  try {
    const maxPixels = tool.limits.maxPixels ?? 40_000_000; const sourcePixels = bitmap.width * bitmap.height;
    if (sourcePixels > maxPixels) throw new Error(`Decoded pixel limit exceeded (${maxPixels.toLocaleString()} pixels).`);
    const requestedWidth = Number(options.width); const requestedHeight = Number(options.height); const hasWidth = Number.isFinite(requestedWidth) && requestedWidth > 0; const hasHeight = Number.isFinite(requestedHeight) && requestedHeight > 0;
    let width = hasWidth && hasHeight ? requestedWidth : hasWidth ? requestedWidth : hasHeight ? Math.round(bitmap.width * requestedHeight / bitmap.height) : bitmap.width;
    let height = hasWidth && hasHeight ? requestedHeight : hasHeight ? requestedHeight : hasWidth ? Math.round(bitmap.height * requestedWidth / bitmap.width) : bitmap.height;
    if (tool.slug === "resize-image") { width = Math.min(width, bitmap.width); height = Math.min(height, bitmap.height); }
    if (![width, height].every((value) => Number.isInteger(value) && value > 0 && value <= 16_384) || width * height > maxPixels) throw new Error("The requested output dimensions exceed the browser pixel limit.");
    const angle = ((Number(options.rotate || 0) % 360) + 360) % 360; const quarterTurn = angle === 90 || angle === 270; const canvas = document.createElement("canvas"); canvas.width = quarterTurn ? height : width; canvas.height = quarterTurn ? width : height;
    const context = canvas.getContext("2d"); if (!context) throw new Error("This browser cannot create a canvas.");
    const mime = outputMime(format); const quality = Math.max(0.01, Math.min(1, Number(options.quality || 82) / 100)); const background = options.background || (format === "jpg" ? "#ffffff" : ""); if (background) { context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height); }
    context.translate(canvas.width / 2, canvas.height / 2); context.rotate(angle * Math.PI / 180); if (options.flip === "horizontal") context.scale(-1, 1); if (options.flip === "vertical") context.scale(1, -1);
    let drawWidth = width; let drawHeight = height; if (tool.slug === "crop-image" && (hasWidth || hasHeight)) { const scale = Math.max(width / bitmap.width, height / bitmap.height); drawWidth = bitmap.width * scale; drawHeight = bitmap.height * scale; }
    context.drawImage(bitmap, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) throw new ImageEncodingError(format);
    if ((tool.slug === "image-compressor" || tool.slug.startsWith("compress-")) && blob.size >= file.size) return new File([file], file.name, { type: file.type || mime });
    if (blob.type !== mime) throw new ImageEncodingError(format);
    return new File([blob], nameFor(file, format), { type: blob.type || mime });
  } finally { bitmap.close(); }
}

async function rasterizeSvg(source: string, format: "png" | "webp" = "png", width?: number, height?: number, scale = 1, maxPixels = 40_000_000): Promise<File> {
  const decoded = await decodeSvgImage(cleanSvg(source), maxPixels), canvas = document.createElement("canvas");
  try {
    const target = svgOutputSize(decoded, width, height, scale, maxPixels); canvas.width = target.width; canvas.height = target.height;
    const context = canvas.getContext("2d"); if (!context) throw new Error("This browser cannot create a canvas.");
    context.drawImage(decoded.source, 0, 0, target.width, target.height);
    const mime = format === "webp" ? "image/webp" : "image/png";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, format === "webp" ? 0.9 : undefined));
    if (!blob || blob.type !== mime) throw new ImageEncodingError(format);
    return new File([blob], `vector.${format}`, { type: mime });
  } finally { decoded.close(); canvas.width = canvas.height = 0; }
}

async function rasterToSvg(file: File, frame = 1, maxPixels = 40_000_000): Promise<string> {
  const isMultiFrame = /\.(?:gif|tiff?)$/i.test(file.name) || ["image/gif", "image/tiff"].includes(file.type.toLowerCase()); if (isMultiFrame && frame !== 1) throw new Error("Only the first GIF/TIFF frame is supported in this browser; choose frame 1 explicitly.");
  const bitmap = await createImageBitmap(file), canvas = document.createElement("canvas");
  try {
    const original = checkImageSize(bitmap.width, bitmap.height, maxPixels), sample = vectorSampleSize(original); canvas.width = sample.width; canvas.height = sample.height;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(bitmap, 0, 0, sample.width, sample.height);
    return pixelRegionsSvg(context.getImageData(0, 0, sample.width, sample.height).data, sample, original);
  } finally { bitmap.close(); canvas.width = canvas.height = 0; }
}

async function imagesToPdf(files: File[], options: Record<string, string>, tool: Pick<Tool, "limits">): Promise<File> {
  const pdf = await PDFDocument.create(); const selectedPaper = options.paper || "a4"; const landscape = options.orientation === "landscape"; const rawPaper: [number, number] = selectedPaper === "letter" ? [612, 792] : [595.28, 841.89]; const margin = Math.max(0, Number(options.margin || 24));
  for (const file of files) {
    if (/\.(?:gif|tiff?)$/i.test(file.name) || ["image/gif", "image/tiff"].includes(file.type.toLowerCase())) { if (Number(options.frame || 1) !== 1) throw new Error("Only the first GIF/TIFF frame is supported in this browser; choose frame 1 explicitly."); }
    const source = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg") ? await rasterizeSvg(await file.text(), "png") : await canvasImage(file, { slug: "resize-image", outputFormats: ["PNG"], limits: tool.limits }, { outputFormat: "png" });
    const bitmap = await createImageBitmap(source); const rawPage: [number, number] = selectedPaper === "image" ? [bitmap.width, bitmap.height] : rawPaper; const pageSize: [number, number] = landscape ? [rawPage[1], rawPage[0]] : rawPage; const page = pdf.addPage(pageSize); const availableWidth = Math.max(1, page.getWidth() - margin * 2); const availableHeight = Math.max(1, page.getHeight() - margin * 2); const scale = options.fit === "cover" ? Math.max(availableWidth / bitmap.width, availableHeight / bitmap.height) : Math.min(availableWidth / bitmap.width, availableHeight / bitmap.height); const width = bitmap.width * scale; const height = bitmap.height * scale; const background = String(options.background || "#ffffff").match(/^#([0-9a-f]{6})$/i); if (background) { const value = Number.parseInt(background[1], 16); page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: rgb((value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255) }); } const canvas = globalThis.document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height; const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable."); context.drawImage(bitmap, 0, 0); bitmap.close(); const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")); if (!png) throw new Error("Could not prepare image for PDF."); const image = await pdf.embedPng(await png.arrayBuffer()); page.drawImage(image, { x: (page.getWidth() - width) / 2, y: (page.getHeight() - height) / 2, width, height });
  }
  return new File([bytesToArrayBuffer(await pdf.save())], "images.pdf", { type: "application/pdf" });
}

function cleanSvg(source: string): string {
  if (/<!doctype|<!entity|<script|on[a-z]+\s*=|javascript:|url\(\s*(?:https?:|data:|javascript:)/i.test(source)) throw new Error("Unsafe SVG content was blocked: scripts, events, external URLs and entities are not accepted.");
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error("The SVG is not well formed.");
  const root = doc.documentElement; if (root.tagName.toLowerCase() !== "svg") throw new Error("The root element must be svg.");
  root.querySelectorAll("script,foreignObject").forEach((node) => node.remove());
  root.querySelectorAll("*").forEach((node) => { [...node.attributes].forEach((attribute) => { if (/^on/i.test(attribute.name) || /href/i.test(attribute.name) && /^(https?:|javascript:|data:)/i.test(attribute.value)) node.removeAttribute(attribute.name); }); });
  return new XMLSerializer().serializeToString(root);
}

const svgPalettes = [
  ["#155e52", "#d9ebe4", "#f59e0b", "#1f2937"], ["#12355b", "#420039", "#d7263d", "#f5f1ed"], ["#264653", "#2a9d8f", "#e9c46a", "#f4a261"], ["#3d405b", "#81b29a", "#f2cc8f", "#e07a5f"], ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c"], ["#0b132b", "#1c2541", "#3a506b", "#5bc0be"], ["#2f3e46", "#354f52", "#52796f", "#cad2c5"], ["#4a1942", "#893168", "#c8a2c8", "#f6d8ae"], ["#14213d", "#fca311", "#e5e5e5", "#000000"], ["#5f0f40", "#9a031e", "#fb8b24", "#e36414"],
];

function swapSvgPalette(source: string, paletteIndex: string): string {
  const clean = cleanSvg(source); if (paletteIndex === "original") return clean; const palette = svgPalettes[Math.max(0, Math.min(svgPalettes.length - 1, Number(paletteIndex) || 0))]; const colors = [...new Set(clean.match(/#[0-9a-f]{6}/gi) ?? [])]; const replacements = new Map(colors.map((color, index) => [color, palette[index % palette.length]])); return clean.replace(/#[0-9a-f]{6}/gi, (color) => replacements.get(color) ?? color);
}

function svgToReact(source: string): string {
  let clean = cleanSvg(source).replace(/<!--([\s\S]*?)-->/g, "");
  const hash = Array.from(clean).reduce((value, character) => ((value * 31 + character.charCodeAt(0)) | 0), 7); const prefix = `hxsl-${Math.abs(hash).toString(36)}`; const ids = [...clean.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const id of ids) { const replacement = `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`; const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); clean = clean.replace(new RegExp(`(\\bid=["'])${escaped}(["'])`, "g"), `$1${replacement}$2`).replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${replacement})`).replace(new RegExp(`(\\b(?:href|xlink:href)=["'])#${escaped}(["'])`, "g"), `$1#${replacement}$2`); }
  const reserved: Record<string, string> = { class: "className", for: "htmlFor", tabindex: "tabIndex", "fill-rule": "fillRule", "clip-rule": "clipRule", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", viewbox: "viewBox", xmlnsxlink: "xmlnsXlink", xlinkhref: "xlinkHref" };
  clean = clean.replace(/\s([:\w-]+)=/g, (_, key) => ` ${reserved[key.toLowerCase()] ?? key.replace(/-([a-z])/g, (_m: string, character: string) => character.toUpperCase())}=`);
  return `import type { SVGProps } from "react";\n\nexport function AssetIcon(props: SVGProps<SVGSVGElement>) {\n  return (\n    ${clean.replace("<svg", "<svg {...props}")}\n  );\n}`;
}

function makeDxf(source: string): string {
  const clean = cleanSvg(source); const pathShapes = [...clean.matchAll(/<path\b[^>]*\bd=["']([^"']+)["'][^>]*>/gi)].map((match) => { const points = [...match[1].matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s*[ ,]\s*(-?\d+(?:\.\d+)?)/gi)].map((point) => [Number(point[1]), Number(point[2])] as [number, number]); return /z/i.test(match[1]) && points.length > 2 ? [...points, points[0]] : points; }).filter((shape) => shape.length > 1);
  const rectShapes = [...clean.matchAll(/<rect\b([^>]*)>/gi)].map((match) => { const value = (key: string, fallback: number) => Number(match[1].match(new RegExp(`\\b${key}\\s*=\\s*["'](-?\\d+(?:\\.\\d+)?)["']`, "i"))?.[1] ?? fallback); const x = value("x", 0); const y = value("y", 0); const width = value("width", 0); const height = value("height", 0); return [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]] as [number, number][]; }).filter((shape) => shape[1][0] > shape[0][0] && shape[2][1] > shape[1][1]);
  const shapes = [...pathShapes, ...rectShapes]; const safeShapes = shapes.length ? shapes : [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]] as [number, number][]];
  const lines = safeShapes.flatMap((shape) => shape.slice(0, -1).map((point, index) => { const next = shape[index + 1]; return `0\nLINE\n8\nHXSL\n10\n${point[0]}\n20\n${point[1]}\n11\n${next[0]}\n21\n${next[1]}\n`; })).join("");
  return `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${lines}0\nENDSEC\n0\nEOF\n`;
}

function makeDst(source: string): Uint8Array {
  const clean = cleanSvg(source); const paths = [...clean.matchAll(/d=["']([^"']+)["']/gi)].map((match) => match[1]); const points = paths.flatMap((path) => [...path.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s*[ ,]\s*(-?\d+(?:\.\d+)?)/gi)].map((match) => [Number(match[1]), Number(match[2])] as [number, number])); const sourcePoints = points.length > 1 ? points : [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]] as [number, number][]; const minX = Math.min(...sourcePoints.map(([x]) => x)); const minY = Math.min(...sourcePoints.map(([, y]) => y)); const scale = Math.min(1000 / Math.max(1, Math.max(...sourcePoints.map(([x]) => x)) - minX), 1000 / Math.max(1, Math.max(...sourcePoints.map(([, y]) => y)) - minY)); const normalized = sourcePoints.map(([x, y]) => [Math.round((x - minX) * scale), Math.round((y - minY) * scale)] as [number, number]);
  function record(dx: number, dy: number, command = 0x03): number[] { let x = Math.max(-121, Math.min(121, dx)); let y = Math.max(-121, Math.min(121, dy)); let b0 = 0; let b1 = 0; if (x > 41) { b0 |= 0x04; x -= 81; } else if (x < -41) { b0 |= 0x08; x += 81; } if (x > 13) { b0 |= 0x01; x -= 27; } else if (x < -13) { b0 |= 0x02; x += 27; } if (x > 4) { b0 |= 0x10; x -= 9; } else if (x < -4) { b0 |= 0x20; x += 9; } if (x > 1) { b0 |= 0x40; x -= 3; } else if (x < -1) { b0 |= 0x80; x += 3; } if (y > 41) { b1 |= 0x04; y -= 81; } else if (y < -41) { b1 |= 0x08; y += 81; } if (y > 13) { b1 |= 0x01; y -= 27; } else if (y < -13) { b1 |= 0x02; y += 27; } if (y > 4) { b1 |= 0x10; y -= 9; } else if (y < -4) { b1 |= 0x20; y += 9; } if (y > 1) { b1 |= 0x40; y -= 3; } else if (y < -1) { b1 |= 0x80; y += 3; } if (x > 0) b1 |= 0x01; if (x < 0) b1 |= 0x02; if (y > 0) b1 |= 0x04; if (y < 0) b1 |= 0x08; return [b0, b1, command]; }
  const records: number[] = []; let previous: [number, number] = [0, 0]; normalized.forEach((point, index) => { const dx = point[0] - previous[0]; const dy = point[1] - previous[1]; const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 100)); for (let step = 0; step < steps; step += 1) records.push(...record(Math.round(dx / steps), Math.round(dy / steps), index === 0 && step === 0 ? 0x83 : 0x03)); previous = point; }); records.push(0xf3, 0xf3, 0xf3); const headerText = [`LA:HXSL Tools\r`, `ST:${records.length / 3 - 1}\r`, `CO:1\r`, `+X:${Math.max(...normalized.map(([x]) => x))}\r`, `-X:${Math.min(...normalized.map(([x]) => x))}\r`, `+Y:${Math.max(...normalized.map(([, y]) => y))}\r`, `-Y:${Math.min(...normalized.map(([, y]) => y))}\r`].join(""); const header = new Uint8Array(512); header.fill(0x20); header.set(new TextEncoder().encode(headerText).slice(0, 512)); const output = new Uint8Array(512 + records.length); output.set(header); output.set(records, 512); return output;
}

function makeIco(pngs: Uint8Array[]): Uint8Array {
  const count = pngs.length; const header = new Uint8Array(6 + count * 16); const view = new DataView(header.buffer); view.setUint16(0, 0, true); view.setUint16(2, 1, true); view.setUint16(4, count, true);
  let offset = header.length; const chunks: Uint8Array[] = [header];
  pngs.forEach((png, index) => { const position = 6 + index * 16; const size = [16, 24, 32, 48, 64, 128, 256][index] ?? 256; header[position] = size === 256 ? 0 : size; header[position + 1] = header[position]; header[position + 2] = 0; header[position + 3] = 0; view.setUint16(position + 4, 1, true); view.setUint16(position + 6, 32, true); view.setUint32(position + 8, png.byteLength, true); view.setUint32(position + 12, offset, true); chunks.push(png); offset += png.byteLength; });
  const result = new Uint8Array(offset); let cursor = 0; for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; } return result;
}

function FilePreview({ file, label }: { file: File; label: string }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next); }, [file]);
  return url && !failed ? <img className="file-preview" src={url} alt={label} onError={() => setFailed(true)} /> : null;
}

function SvgPreview({ file, toolSlug, options, label, transform = true }: { file: File; toolSlug: string; options: Record<string, string>; label: string; transform?: boolean }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true; let next = "";
    void file.text().then((source) => {
      let clean = cleanSvg(source);
      if (transform && toolSlug === "svg-color-editor") clean = clean.replace(/#[0-9a-f]{6}/gi, options.color || "#155e52");
      if (transform && toolSlug === "svg-palette-swapper") clean = swapSvgPalette(clean, options.palette || "original");
      if (transform && toolSlug === "svg-optimizer") clean = clean.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ");
      next = URL.createObjectURL(new Blob([clean], { type: "image/svg+xml" })); if (active) setUrl(next); else URL.revokeObjectURL(next);
    }).catch(() => undefined);
    return () => { active = false; if (next) URL.revokeObjectURL(next); setUrl(""); };
  }, [file, options.color, options.palette, toolSlug, transform]);
  return url ? <img className="file-preview svg-preview" src={url} alt={label} /> : null;
}

function getDstLabels(locale: Locale): { outline: string; stitches: string } { return ({ ...expandedMap(c => ({ outline: c.accessibility.outline, stitches: c.accessibility.stitches })), ko: { outline: "윤곽 미리보기", stitches: "땀" }, it: { outline: "Anteprima contorno", stitches: "punti" }, en: { outline: "Outline preview", stitches: "stitches" }, "zh-CN": { outline: "轮廓预览", stitches: "针迹" }, "zh-TW": { outline: "輪廓預覽", stitches: "針跡" }, es: { outline: "Vista previa del contorno", stitches: "puntadas" }, "pt-BR": { outline: "Prévia do contorno", stitches: "pontos" }, de: { outline: "Umrissvorschau", stitches: "Stiche" }, fr: { outline: "Aperçu du contour", stitches: "points" }, ja: { outline: "輪郭プレビュー", stitches: "ステッチ" } } as Record<Locale, { outline: string; stitches: string }>)[locale]; }

function DstPreview({ file, locale, label }: { file: File; locale: Locale; label: string }) {
  const labels = getDstLabels(locale); const [preview, setPreview] = useState<{ url: string; width: number; height: number; stitches: number } | null>(null);
  useEffect(() => {
    let active = true; let next = "";
    void file.text().then((source) => {
      const clean = cleanSvg(source); const rawPoints = [...clean.matchAll(/d=["']([^"']+)["']/gi)].flatMap((match) => [...match[1].matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s*[ ,]\s*(-?\d+(?:\.\d+)?)/gi)].map((point) => [Number(point[1]), Number(point[2])] as [number, number])); const points = rawPoints.length > 1 ? rawPoints : [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]] as [number, number][]; const minX = Math.min(...points.map(([x]) => x)); const maxX = Math.max(...points.map(([x]) => x)); const minY = Math.min(...points.map(([, y]) => y)); const maxY = Math.max(...points.map(([, y]) => y)); const width = Math.max(1, maxX - minX); const height = Math.max(1, maxY - minY); const pad = Math.max(width, height) * 0.08; const pointText = points.map(([x, y]) => `${x},${y}`).join(" "); const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - pad} ${minY - pad} ${width + pad * 2} ${height + pad * 2}"><polyline points="${pointText}" fill="none" stroke="#155e52" stroke-width="${Math.max(1, Math.min(width, height) / 40)}" stroke-linecap="round" stroke-linejoin="round"/></svg>`; next = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); if (active) setPreview({ url: next, width, height, stitches: Math.max(0, points.length - 1) }); else URL.revokeObjectURL(next);
    }).catch(() => undefined);
    return () => { active = false; if (next) URL.revokeObjectURL(next); setPreview(null); };
  }, [file]);
  return preview ? <div className="dst-preview"><img className="file-preview svg-preview" src={preview.url} alt={label} /><small>{labels.outline} · {preview.width.toFixed(1)} × {preview.height.toFixed(1)} · {preview.stitches} {labels.stitches}</small></div> : null;
}

function iconBackground(value: string | undefined): string {
  const background = value?.trim() ?? "";
  return background === "transparent" || /^#[0-9a-f]{3,4}$|^#[0-9a-f]{6,8}$/i.test(background) ? background : "#ffffff";
}

async function decodeIconSource(file: File, maxPixels = 40_000_000) {
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) return decodeSvgImage(cleanSvg(await file.text()), maxPixels);
  const bitmap = await createImageBitmap(file);
  try { checkImageSize(bitmap.width, bitmap.height, maxPixels); } catch (error) { bitmap.close(); throw error; }
  return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
}
async function renderIconPng(file: File, size: number, options: Record<string, string>, maxPixels = 40_000_000): Promise<Uint8Array> {
  const decoded = await decodeIconSource(file, maxPixels);
  try { return await renderIconSourcePng(decoded, size, options); } finally { decoded.close(); }
}
async function renderIconSourcePng(bitmap: Awaited<ReturnType<typeof decodeIconSource>>, size: number, options: Record<string, string>): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  try {
    const sourcePixels = bitmap.width * bitmap.height;
    if (!bitmap.width || !bitmap.height || sourcePixels > 40_000_000) throw new Error("Decoded pixel limit exceeded for the icon source.");
    const targetSize = Math.max(16, Math.min(512, Math.round(size)));
    canvas.width = targetSize; canvas.height = targetSize;
    const context = canvas.getContext("2d"); if (!context) throw new Error("This browser cannot create an icon preview.");
    const background = iconBackground(options.background); if (background !== "transparent") { context.fillStyle = background; context.fillRect(0, 0, targetSize, targetSize); }
    const padding = Math.max(0, Math.min(45, Number(options.padding ?? 10) || 0)) / 100;
    const available = targetSize * (1 - padding * 2);
    const scale = options.fit === "cover" ? Math.max(available / bitmap.width, available / bitmap.height) : Math.min(available / bitmap.width, available / bitmap.height);
    const width = bitmap.width * scale; const height = bitmap.height * scale;
    context.drawImage(bitmap.source, (targetSize - width) / 2, (targetSize - height) / 2, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding is not available in this browser.");
    return new Uint8Array(await blob.arrayBuffer());
  } finally { canvas.width = canvas.height = 0; }
}

function getIconMaskLabel(locale: Locale): string { return ({ ...expandedMap(c => c.accessibility.mask), ko: "Android 마스크 미리보기", it: "Anteprime maschere Android", en: "Android mask previews", "zh-CN": "Android 遮罩预览", "zh-TW": "Android 遮罩預覽", es: "Vistas previas de máscaras Android", "pt-BR": "Pré-visualizações de máscara Android", de: "Android-Maskenvorschauen", fr: "Aperçus des masques Android", ja: "Android マスクプレビュー" } as Record<Locale, string>)[locale]; }

function IconPreview({ file, options, label, locale, maxPixels }: { file: File; options: Record<string, string>; label: string; locale: Locale; maxPixels?: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true; let next = "";
    setUrl("");
    void renderIconPng(file, 128, options, maxPixels).then((png) => {
      next = URL.createObjectURL(new Blob([bytesToArrayBuffer(png)], { type: "image/png" }));
      if (active) setUrl(next); else URL.revokeObjectURL(next);
    }).catch(() => undefined);
    return () => { active = false; if (next) URL.revokeObjectURL(next); };
  }, [file, options.background, options.fit, options.padding, maxPixels]);
  return url ? <div className="icon-preview-group"><img className="icon-preview" src={url} alt={label} /><div className="icon-mask-previews" role="group" aria-label={getIconMaskLabel(locale)}><span className="icon-mask icon-mask-circle"><img src={url} alt="" /></span><span className="icon-mask icon-mask-squircle"><img src={url} alt="" /></span><span className="icon-mask icon-mask-rounded"><img src={url} alt="" /></span></div></div> : null;
}

type SignatureLabels = { title: string; hint: string; clear: string; upload: string; uploadError: string };
function getSignatureLabels(locale: Locale): SignatureLabels {
  return ({
    ...Object.fromEntries(Object.entries(expandedTools).map(([locale, copy]) => [locale, copy.signature])),
    ko: additionalToolCopy.ko.signature, it: additionalToolCopy.it.signature,
    en: { title: "Draw or upload an appearance signature", hint: "The result is a visual signature only; it is not a certificate-based digital signature.", clear: "Clear drawing", upload: "Use an image", uploadError: "Signature images must be PNG, JPG or WebP and under 4 MB." },
    "zh-CN": { title: "绘制或上传外观签名", hint: "结果仅是外观签名，不是基于证书的数字签名。", clear: "清除绘制", upload: "使用图片", uploadError: "签名图片必须是 PNG、JPG 或 WebP，且小于 4 MB。" },
    "zh-TW": { title: "繪製或上傳外觀簽名", hint: "結果僅是外觀簽名，不是基於憑證的數位簽名。", clear: "清除繪製", upload: "使用圖片", uploadError: "簽名圖片必須是 PNG、JPG 或 WebP，且小於 4 MB。" },
    es: { title: "Dibuja o sube una firma visual", hint: "El resultado es solo visual; no es una firma digital basada en certificado.", clear: "Borrar dibujo", upload: "Usar una imagen", uploadError: "La imagen debe ser PNG, JPG o WebP y pesar menos de 4 MB." },
    "pt-BR": { title: "Desenhe ou envie uma assinatura visual", hint: "O resultado é apenas visual; não é uma assinatura digital baseada em certificado.", clear: "Limpar desenho", upload: "Usar uma imagem", uploadError: "A imagem deve ser PNG, JPG ou WebP e ter menos de 4 MB." },
    de: { title: "Visuelle Signatur zeichnen oder hochladen", hint: "Das Ergebnis ist nur eine visuelle Signatur, keine zertifikatsbasierte digitale Signatur.", clear: "Zeichnung löschen", upload: "Bild verwenden", uploadError: "Das Bild muss PNG, JPG oder WebP und kleiner als 4 MB sein." },
    fr: { title: "Dessinez ou importez une signature visuelle", hint: "Le résultat est uniquement visuel, pas une signature numérique basée sur un certificat.", clear: "Effacer le dessin", upload: "Utiliser une image", uploadError: "L’image doit être en PNG, JPG ou WebP et faire moins de 4 Mo." },
    ja: { title: "外観署名を描画またはアップロード", hint: "結果は外観署名のみで、証明書ベースの電子署名ではありません。", clear: "描画を消去", upload: "画像を使う", uploadError: "画像は PNG、JPG、WebP 形式で 4 MB 未満にしてください。" },
  } as Record<Locale, SignatureLabels>)[locale];
}

function SignaturePad({ locale, onImageChange }: { locale: Locale; onImageChange: (value: string) => void }) {
  const labels = getSignatureLabels(locale); const canvasRef = useRef<HTMLCanvasElement>(null); const drawing = useRef(false);
  function point(event: ReactPointerEvent<HTMLCanvasElement>): [number, number] { const canvas = event.currentTarget; const rect = canvas.getBoundingClientRect(); return [(event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height]; }
  function start(event: ReactPointerEvent<HTMLCanvasElement>) { const canvas = event.currentTarget; const context = canvas.getContext("2d"); if (!context) return; const [x, y] = point(event); canvas.setPointerCapture(event.pointerId); drawing.current = true; context.beginPath(); context.moveTo(x, y); }
  function move(event: ReactPointerEvent<HTMLCanvasElement>) { if (!drawing.current) return; const context = event.currentTarget.getContext("2d"); if (!context) return; const [x, y] = point(event); context.lineTo(x, y); context.stroke(); }
  function end(event: ReactPointerEvent<HTMLCanvasElement>) { if (!drawing.current) return; drawing.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); onImageChange(event.currentTarget.toDataURL("image/png")); }
  function clear() { const canvas = canvasRef.current; if (!canvas) return; canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); onImageChange(""); }
  function upload(event: ChangeEvent<HTMLInputElement>) { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (!file || file.size > 4 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return; void createImageBitmap(file).then((bitmap) => { if (bitmap.width * bitmap.height > 40_000_000) { bitmap.close(); return; } const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height; canvas.getContext("2d")?.drawImage(bitmap, 0, 0); bitmap.close(); onImageChange(canvas.toDataURL("image/png")); canvas.width = 1; canvas.height = 1; }).catch(() => undefined); }
  useEffect(() => { const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!context) return; context.lineCap = "round"; context.lineJoin = "round"; context.lineWidth = 4; context.strokeStyle = "#155e52"; }, []);
  return <div className="signature-pad"><strong>{labels.title}</strong><canvas ref={canvasRef} width={720} height={220} aria-label={labels.title} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} /><div className="signature-actions"><button type="button" className="button button-secondary" onClick={clear}>{labels.clear}</button><label className="button button-secondary">{labels.upload}<input className="file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} /></label></div><small>{labels.hint}</small></div>;
}

async function iconPack(file: File, options: Record<string, string>, maxPixels = 40_000_000): Promise<File> {
  const decoded = await decodeIconSource(file, maxPixels), cache = new Map<number, Uint8Array>();
  async function render(size: number) { const cached = cache.get(size); if (cached) return cached; const png = await renderIconSourcePng(decoded, size, options); cache.set(size, png); return png; }
  try {
  const pngs: Uint8Array[] = []; for (const size of [16, 24, 32, 48, 64, 128, 256]) pngs.push(await render(size));
  const zip = new JSZip(); zip.file("web/favicon.ico", makeIco(pngs)); zip.file("web/favicon-32.png", await render(32)); zip.file("web/apple-touch-icon.png", await render(180)); zip.file("pwa/icon-192.png", await render(192)); zip.file("pwa/icon-512.png", await render(512)); zip.file("pwa/manifest.webmanifest", JSON.stringify({ name: "HXSL App", icons: [{ src: "icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icon-512.png", sizes: "512x512", type: "image/png" }], display: "standalone" }, null, 2));
  const androidSizes: Array<[string, number]> = [["mdpi", 48], ["hdpi", 72], ["xhdpi", 96], ["xxhdpi", 144], ["xxxhdpi", 192]]; const androidPngs = new Map<number, Uint8Array>(); for (const [, size] of androidSizes) androidPngs.set(size, await render(size));
  for (const [density, size] of androidSizes) zip.file(`android/res/mipmap-${density}/ic_launcher.png`, androidPngs.get(size)!);
  const background = iconBackground(options.background); const androidBackground = background === "transparent" ? "#00000000" : background.length === 4 ? `#${background[1]}${background[1]}${background[2]}${background[2]}${background[3]}${background[3]}` : background.length === 5 ? `#${background[4]}${background[4]}${background[1]}${background[1]}${background[2]}${background[2]}${background[3]}${background[3]}` : background.length === 9 ? `#${background.slice(7)}${background.slice(1, 7)}` : background;
  zip.file("android/res/mipmap-anydpi-v26/ic_launcher.xml", "<adaptive-icon xmlns:android=\"http://schemas.android.com/apk/res/android\"><background android:drawable=\"@color/ic_launcher_background\"/><foreground android:drawable=\"@drawable/ic_launcher_foreground\"/><monochrome android:drawable=\"@drawable/ic_launcher_monochrome\"/></adaptive-icon>\n"); zip.file("android/res/values/colors.xml", `<resources><color name="ic_launcher_background">${androidBackground}</color></resources>\n`); zip.file("android/res/drawable-nodpi/ic_launcher_foreground.png", pngs[6]); zip.file("android/res/drawable-nodpi/ic_launcher_monochrome.png", pngs[6]); zip.file("README.txt", `Fit: ${options.fit === "cover" ? "cover" : "contain"}\nPadding: ${Math.max(0, Math.min(45, Number(options.padding ?? 10) || 0))}%\nBackground: ${background}\nICO entries: 16, 24, 32, 48, 64, 128, 256 px. Android legacy density PNGs and adaptive-icon resource/XML examples use the same rendered artwork. Verify the included circle, squircle and rounded mask previews against your Android build before release.\n\nFavicon HTML:\n<link rel="icon" href="/web/favicon.ico" sizes="any">\n<link rel="icon" href="/web/favicon-32.png" type="image/png" sizes="32x32">\n<link rel="apple-touch-icon" href="/web/apple-touch-icon.png">\n<link rel="manifest" href="/pwa/manifest.webmanifest">\n`); return new File([await zip.generateAsync({ type: "blob" })], "hxsl-icon-resources.zip", { type: "application/zip" });
  } finally { decoded.close(); cache.clear(); }
}

type PdfThumbnail = { number: number; url: string };
type PdfThumbnailLabels = { title: string; loading: string; selection: string; reorder: string; page: string; selected: string; limited: (count: number) => string; failed: string };

function getPdfThumbnailLabels(locale: Locale): PdfThumbnailLabels {
  return ({
    ...Object.fromEntries(Object.entries(expandedTools).map(([locale, copy]) => [locale, copy.thumbnails])),
    ko: additionalToolCopy.ko.thumbnails, it: additionalToolCopy.it.thumbnails,
    en: { title: "Page thumbnails", loading: "Rendering pages locally…", selection: "Select pages for this task.", reorder: "Drag pages to reorder, use the move buttons, or press ← → when focused.", page: "Page", selected: "Selected", limited: (count) => `Showing the first ${count} pages; use the page range field for later pages.`, failed: "Thumbnails could not be rendered in this browser. The page range field is still available." },
    "zh-CN": { title: "页面缩略图", loading: "正在本地渲染页面…", selection: "选择此任务要处理的页面。", reorder: "拖动页面排序，使用前移／后移按钮，或聚焦后使用 ← →。", page: "第", selected: "已选择", limited: (count) => `仅显示前 ${count} 页；后续页面请使用范围输入框。`, failed: "此浏览器无法渲染缩略图，但仍可使用页面范围输入框。" },
    "zh-TW": { title: "頁面縮圖", loading: "正在本機繪製頁面…", selection: "選擇此任務要處理的頁面。", reorder: "拖曳頁面排序，使用前移／後移按鈕，或聚焦後使用 ← →。", page: "第", selected: "已選取", limited: (count) => `只顯示前 ${count} 頁；後續頁面請使用範圍輸入框。`, failed: "此瀏覽器無法繪製縮圖，但仍可使用頁面範圍輸入框。" },
    es: { title: "Miniaturas de página", loading: "Renderizando páginas localmente…", selection: "Selecciona las páginas para esta tarea.", reorder: "Arrastra para ordenar, usa los botones de mover o usa ← → al enfocar.", page: "Página", selected: "Seleccionada", limited: (count) => `Se muestran las primeras ${count} páginas; usa el campo de rango para las demás.`, failed: "No se pudieron renderizar las miniaturas. El campo de rango sigue disponible." },
    "pt-BR": { title: "Miniaturas das páginas", loading: "Renderizando páginas localmente…", selection: "Selecione as páginas desta tarefa.", reorder: "Arraste para ordenar, use os botões de mover ou use ← → ao focar.", page: "Página", selected: "Selecionada", limited: (count) => `Mostrando as primeiras ${count} páginas; use o campo de intervalo para as demais.`, failed: "Não foi possível renderizar as miniaturas. O campo de intervalo continua disponível." },
    de: { title: "Seitenminiaturen", loading: "Seiten werden lokal gerendert…", selection: "Seiten für diese Aufgabe auswählen.", reorder: "Zum Sortieren ziehen, die Verschieben-Tasten nutzen oder fokussiert ← → verwenden.", page: "Seite", selected: "Ausgewählt", limited: (count) => `Die ersten ${count} Seiten werden angezeigt; spätere Seiten über das Bereichsfeld wählen.`, failed: "Miniaturen konnten nicht gerendert werden. Das Seitenbereichsfeld bleibt verfügbar." },
    fr: { title: "Miniatures des pages", loading: "Rendu local des pages…", selection: "Sélectionnez les pages de cette tâche.", reorder: "Faites glisser pour trier, utilisez les boutons de déplacement ou ← → quand l’élément est ciblé.", page: "Page", selected: "Sélectionnée", limited: (count) => `Les ${count} premières pages sont affichées ; utilisez le champ de plage pour les suivantes.`, failed: "Les miniatures n’ont pas pu être rendues. Le champ de plage reste disponible." },
    ja: { title: "ページのサムネイル", loading: "ページをローカルで描画中…", selection: "この作業で扱うページを選択します。", reorder: "ドラッグ、前後ボタン、またはフォーカス中の ← → で並べ替えできます。", page: "ページ", selected: "選択済み", limited: (count) => `最初の ${count} ページを表示しています。後のページは範囲入力を使ってください。`, failed: "このブラウザではサムネイルを描画できません。ページ範囲入力は利用できます。" },
  } as Record<Locale, PdfThumbnailLabels>)[locale];
}

function selectionValue(selected: Set<number>, pageCount: number): string {
  if (selected.size === pageCount) return "all";
  return [...selected].sort((left, right) => left - right).join(",");
}

function PdfThumbnailPanel({ file, locale, toolSlug, pagesValue, orderValue, cropInset, onPagesChange, onOrderChange }: { file: File; locale: Locale; toolSlug: string; pagesValue: string; orderValue: string; cropInset?: string; onPagesChange: (value: string) => void; onOrderChange: (value: string) => void }) {
  const labels = getPdfThumbnailLabels(locale); const reorderable = toolSlug === "reorder-pages"; const [pages, setPages] = useState<PdfThumbnail[]>([]); const [totalPages, setTotalPages] = useState(0); const [state, setState] = useState<"loading" | "ready" | "failed">("loading"); const [draggedPage, setDraggedPage] = useState<number | null>(null);
  const thumbButtons = useRef(new Map<number, HTMLButtonElement>()), pendingFocus = useRef<number | null>(null);
  useEffect(() => { if (pendingFocus.current !== null) { thumbButtons.current.get(pendingFocus.current)?.focus(); pendingFocus.current = null; } }, [orderValue]);
  useEffect(() => {
    let active = true; const urls: string[] = []; let loadingTask: PDFDocumentLoadingTask | undefined; let worker: PDFWorker | undefined; let workerPort: Worker | undefined;
    setState("loading"); setPages([]); setTotalPages(0);
    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        workerPort = new Worker(new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url), { type: "module" });
        worker = new pdfjs.PDFWorker({ port: workerPort as never });
        loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), worker });
        const pdfDocument = await loadingTask.promise; const count = pdfDocument.numPages; const limit = Math.min(count, 60); const next: PdfThumbnail[] = [];
        for (let index = 1; index <= limit; index += 1) {
          if (!active) return;
          const page = await pdfDocument.getPage(index); const base = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(1, 96 / Math.max(1, base.width)) }); const canvas = globalThis.document.createElement("canvas"); canvas.width = Math.max(1, Math.ceil(viewport.width)); canvas.height = Math.max(1, Math.ceil(viewport.height)); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas is unavailable."); await page.render({ canvasContext: context, viewport }).promise; const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not create thumbnail.")), "image/png")); const url = URL.createObjectURL(blob); urls.push(url); next.push({ number: index, url }); page.cleanup(); canvas.width = 1; canvas.height = 1;
        }
        if (!active) return;
        setTotalPages(count); setPages(next); setState("ready");
        // Rendering is read-only: neither a delayed preview nor its 60-page cap edits parameters.
        await pdfDocument.destroy();
      } catch {
        if (active) setState("failed");
      } finally {
        await loadingTask?.destroy().catch(() => undefined); worker?.destroy(); workerPort?.terminate();
      }
    })();
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); void loadingTask?.destroy().catch(() => undefined); worker?.destroy(); workerPort?.terminate(); };
  }, [file]);
  let order: number[], selection: number[];
  try { order = reorderPageSelection(orderValue, totalPages).map(index => index + 1); } catch { order = Array.from({ length: totalPages }, (_, i) => i + 1); }
  try { selection = browserPageSelection(pagesValue, totalPages).map(index => index + 1); } catch { selection = []; }
  const selected = new Set(selection);
  const visiblePages = reorderable ? order.map(number => pages.find(page => page.number === number)).filter((page): page is PdfThumbnail => Boolean(page)) : pages;
  function movePage(pageNumber: number, delta: number) { const index = order.indexOf(pageNumber), target = index + delta; if (index < 0 || target < 0 || target >= order.length) return; const next = [...order]; [next[index], next[target]] = [next[target], next[index]]; pendingFocus.current = pageNumber; onOrderChange(next.join(",")); }
  function togglePage(pageNumber: number) { const next = new Set(selected); if (next.has(pageNumber)) { if (next.size === 1) return; next.delete(pageNumber); } else next.add(pageNumber); onPagesChange(selectionValue(next, totalPages)); }
  const cropPercent = Math.min(32, Math.max(0, Number(cropInset ?? 18) / 6));
  return <section className="pdf-thumbnails" aria-label={labels.title}><div className="pdf-thumbnail-heading"><div><strong>{labels.title}</strong><small>{reorderable ? labels.reorder : labels.selection}</small></div>{state === "loading" && <span className="mono">{labels.loading}</span>}</div>{state === "failed" && <p className="thumbnail-error">{labels.failed}</p>}{state === "ready" && <><div className={`pdf-page-grid ${reorderable ? "reorderable" : ""}`}>{visiblePages.map((page) => <div className="pdf-thumb-item" key={page.number}><button ref={(node) => { if (node) thumbButtons.current.set(page.number, node); else thumbButtons.current.delete(page.number); }} type="button" className={`pdf-thumb ${!reorderable && selected.has(page.number) ? "selected" : ""}`} key={page.number} aria-pressed={!reorderable ? selected.has(page.number) : undefined} aria-label={`${labels.page} ${page.number}`} draggable={reorderable} onClick={() => { if (!reorderable) togglePage(page.number); }} onKeyDown={(event) => { if (reorderable && event.key === "ArrowLeft") { event.preventDefault(); movePage(page.number, -1); } if (reorderable && event.key === "ArrowRight") { event.preventDefault(); movePage(page.number, 1); } }} onDragStart={() => setDraggedPage(page.number)} onDragOver={(event) => { if (reorderable) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); if (!reorderable || draggedPage === null || draggedPage === page.number) return; const from = order.indexOf(draggedPage); const target = order.indexOf(page.number); if (from < 0 || target < 0) return; const next = [...order]; const [moved] = next.splice(from, 1); next.splice(target, 0, moved); onOrderChange(next.join(",")); setDraggedPage(null); }} onDragEnd={() => setDraggedPage(null)}><img src={page.url} alt="" style={toolSlug === "crop-pdf" ? { clipPath: `inset(${cropPercent}%)` } : undefined} /><span>{labels.page} {page.number}</span>{!reorderable && selected.has(page.number) && <em>{labels.selected}</em>}</button>{reorderable && <div className="pdf-move"><button type="button" aria-label={pdfPageMessage(locale, "earlier", page.number)} title={pdfPageMessage(locale, "earlier", page.number)} disabled={order.indexOf(page.number) === 0} onClick={() => movePage(page.number, -1)}><ArrowUp size={16} aria-hidden="true" /></button><button type="button" aria-label={pdfPageMessage(locale, "later", page.number)} title={pdfPageMessage(locale, "later", page.number)} disabled={order.indexOf(page.number) === order.length - 1} onClick={() => movePage(page.number, 1)}><ArrowDown size={16} aria-hidden="true" /></button></div>}</div>)}</div>{totalPages > pages.length && <small className="thumbnail-limit">{labels.limited(pages.length)}</small>}</>}</section>;
}

async function pdfLocal(files: File[], tool: Tool, options: Record<string, string>): Promise<File> {
  if (["pdf-to-png", "pdf-to-jpg", "pdf-to-webp", "pdf-to-text"].includes(tool.slug)) throw new Error("PDF rendering and text extraction use the server engine in this build. Upload consent is required for this task.");
  if (["png-to-pdf", "jpg-to-pdf", "webp-to-pdf", "bmp-to-pdf", "gif-to-pdf", "svg-to-pdf"].includes(tool.slug)) return imagesToPdf(files, options, tool);
  const sources = []; for (const file of files) sources.push(await PDFDocument.load(await file.arrayBuffer()));
  if (tool.slug === "merge-pdf") { const result = await PDFDocument.create(); for (const source of sources) for (const page of await result.copyPages(source, source.getPageIndices())) result.addPage(page); return new File([bytesToArrayBuffer(await result.save())], "merged.pdf", { type: "application/pdf" }); }
  const source = sources[0]; const count = source.getPageCount(); if (count > (tool.limits.maxPages ?? 300)) throw new PdfPageError("limit", tool.limits.maxPages ?? 300); const selected = browserPageSelection(String(options.pages || "all"), count);
  const saveSource = async (filename: string) => new File([bytesToArrayBuffer(await source.save())], filename, { type: "application/pdf" });
  if (tool.slug === "rotate-pdf") {
    const angle = [90, 180, 270].includes(Number(options.angle)) ? Number(options.angle) : 90;
    for (const index of selected) { const page = source.getPage(index); page.setRotation(degrees((page.getRotation().angle + angle) % 360)); }
    return saveSource("rotated.pdf");
  }
  if (tool.slug === "metadata-pdf") {
    source.setTitle(options.title || ""); source.setAuthor(options.author || ""); source.setSubject(options.subject || "");
    source.setKeywords(String(options.keywords || "").split(",").map((value) => value.trim()).filter(Boolean));
    return saveSource("metadata-edited.pdf");
  }
  if (tool.slug === "crop-pdf") {
    for (const index of selected) { const page = source.getPage(index); const { width, height } = page.getSize(); const inset = Math.max(0, Math.min(Math.min(width, height) / 2, Number(options.inset ?? 18))); page.setCropBox(inset, inset, Math.max(1, width - inset * 2), Math.max(1, height - inset * 2)); }
    return saveSource("cropped.pdf");
  }
  if (tool.slug === "resize-pdf") {
    const preset = options.paper || "a4"; const width = preset === "letter" ? 612 : preset === "a4" ? 595.28 : Math.max(1, Number(options.width ?? 595.28)); const height = preset === "letter" ? 792 : preset === "a4" ? 841.89 : Math.max(1, Number(options.height ?? 841.89));
    if (![width, height].every((value) => Number.isFinite(value) && value > 0)) throw new Error("The requested PDF page size is invalid.");
    for (const page of source.getPages()) page.setSize(width, height);
    return saveSource("resized.pdf");
  }
  if (tool.slug === "flatten-pdf") {
    try { source.getForm().flatten({ updateFieldAppearances: true }); } catch { /* unsupported forms remain unchanged */ }
    return saveSource("flattened.pdf");
  }
  if (tool.slug === "compress-pdf") {
    if (options.mode === "lossy") throw new Error("Lossy PDF compression requires the server task and upload consent.");
    const output = await source.save();
    return output.byteLength < files[0].size ? new File([bytesToArrayBuffer(output)], "compressed.pdf", { type: "application/pdf" }) : new File([files[0]], files[0].name, { type: "application/pdf" });
  }
  if (tool.slug === "split-pdf") { const zip = new JSZip(); for (const [position, pageIndex] of selected.entries()) { const part = await PDFDocument.create(); for (const page of await part.copyPages(source, [pageIndex])) part.addPage(page); zip.file(`page-${String(position + 1).padStart(3, "0")}.pdf`, bytesToArrayBuffer(await part.save())); } return new File([await zip.generateAsync({ type: "blob" })], "split-pages.zip", { type: "application/zip" }); }
  if (tool.slug === "delete-pages" && selected.length >= count) throw new PdfPageError("deleteAll");
  const order = tool.slug === "reverse-pdf" ? [...source.getPageIndices()].reverse() : tool.slug === "reorder-pages" ? reorderPageSelection(options.order ?? "", count) : tool.slug === "delete-pages" ? source.getPageIndices().filter((page) => !selected.includes(page)) : tool.slug === "duplicate-pages" ? duplicatePageSelection(count, selected, options.times ?? "1", options.position ?? "0", tool.limits.maxPages ?? 300) : selected;
  const result = await PDFDocument.create(); for (const page of await result.copyPages(source, order)) result.addPage(page);
  if (["watermark-pdf", "sign-pdf", "header-footer-pdf", "page-numbers-pdf"].includes(tool.slug)) { const font = await source.embedFont(StandardFonts.Helvetica); const signature = options.signatureImage?.startsWith("data:image/png") ? await source.embedPng(bytesFromDataUrl(options.signatureImage)) : undefined; for (const index of selected) { const page = source.getPage(index); const size = page.getSize(); if (tool.slug === "watermark-pdf") { const text = options.text || "HXSL Tools"; const textSize = Number(options.size || 24); const placement = textPosition(options.position || "bottom-right", size.width, size.height, font.widthOfTextAtSize(text, textSize), textSize); page.drawText(text, { ...placement, size: textSize, font, rotate: degrees(Number(options.rotation || 0)), opacity: Number(options.opacity || .35), color: rgb(.15, .37, .32) }); } if (tool.slug === "sign-pdf") { if (signature) { const targetWidth = Math.min(180, Math.max(40, size.width - 80), Math.max(40, (size.height - 80) * signature.width / signature.height)); page.drawImage(signature, { x: 40, y: 40, width: targetWidth, height: targetWidth * signature.height / signature.width }); } else page.drawText(options.signature || "Signed with HXSL Tools (appearance only)", { x: 40, y: 40, size: 12, font, color: rgb(.08, .25, .21) }); } if (tool.slug === "header-footer-pdf") { const header = options.header || ""; const footer = options.footer || ""; if (header) page.drawText(header.replace("{page}", String(index + 1)), { x: 40, y: size.height - 32, size: Number(options.size || 10), font }); if (footer) page.drawText(footer.replace("{page}", String(index + 1)), { x: 40, y: 24, size: Number(options.size || 10), font }); } if (tool.slug === "page-numbers-pdf") { const textSize = Number(options.size || 10); const number = String(options.format || "{page}").replaceAll("{page}", String(Number(options.start || 1) + index)); const placement = textPosition(options.position || "bottom-right", size.width, size.height, font.widthOfTextAtSize(number, textSize), textSize); page.drawText(number, { ...placement, size: textSize, font }); } } return saveSource(`${tool.slug}.pdf`); }
  return new File([bytesToArrayBuffer(await result.save())], `${tool.slug}.pdf`, { type: "application/pdf" });
}

async function localProcess(files: File[], tool: Tool, options: Record<string, string>): Promise<File> {
  if (tool.category === "pdf") return pdfLocal(files, tool, options);
  const file = files[0];
  if (tool.category === "image") return canvasImage(file, tool, options);
  if (tool.slug === "icon-pack" || tool.category === "icons") return iconPack(file, options, tool.limits.maxPixels);
  if (tool.slug.endsWith("-to-svg")) return new File([await rasterToSvg(file, Number(options.frame || 1), tool.limits.maxPixels)], nameFor(file, "svg"), { type: "image/svg+xml" });
  const text = await file.text();
  if (tool.slug === "svg-to-react") return new File([svgToReact(text)], nameFor(file, "tsx"), { type: "text/plain" });
  if (tool.slug === "svg-to-base64") return new File([`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(cleanSvg(text))))}`], nameFor(file, "txt"), { type: "text/plain" });
  if (tool.slug === "svg-optimizer") return new File([cleanSvg(text).replace(/>\s+</g, "><").replace(/\s{2,}/g, " ")], nameFor(file, "svg"), { type: "image/svg+xml" });
  if (tool.slug === "svg-color-editor") return new File([cleanSvg(text).replace(/#[0-9a-f]{6}/gi, options.color || "#155e52")], nameFor(file, "svg"), { type: "image/svg+xml" });
  if (tool.slug === "svg-palette-swapper") return new File([swapSvgPalette(text, options.palette || "0")], nameFor(file, "svg"), { type: "image/svg+xml" });
  if (tool.slug.endsWith("-to-dxf")) { const source = file.name.toLowerCase().endsWith(".svg") || file.type === "image/svg+xml" ? text : await rasterToSvg(file); return new File([makeDxf(source)], nameFor(file, "dxf"), { type: "application/dxf" }); }
  if (tool.slug === "svg-qr-code") return new File([await QRCode.toString(options.text || "https://hxsl.org", { type: "svg", errorCorrectionLevel: (options.errorCorrection || "M") as "L" | "M" | "Q" | "H" })], "qr-code.svg", { type: "image/svg+xml" });
  if (tool.slug === "svg-pattern-maker") return new File([`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 80 80"><defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0 10h20M10 0v20" stroke="#155e52" stroke-width="1"/><circle cx="10" cy="10" r="3" fill="#d9ebe4"/></pattern></defs><rect width="80" height="80" fill="url(#p)"/></svg>`], "pattern.svg", { type: "image/svg+xml" });
  if (tool.slug === "svg-to-favicon") return iconPack(new File([new Blob([cleanSvg(text)], { type: "image/svg+xml" })], "source.svg", { type: "image/svg+xml" }), { fit: "contain", padding: "10", background: "#ffffff" }, tool.limits.maxPixels);
  if (tool.slug === "svg-to-dst") return new File([bytesToArrayBuffer(makeDst(text))], nameFor(file, "dst"), { type: "application/octet-stream" });
  if (tool.slug === "svg-to-png" || tool.slug === "svg-to-webp") return rasterizeSvg(text, tool.slug.endsWith("webp") ? "webp" : "png", options.width ? Number(options.width) : undefined, options.height ? Number(options.height) : undefined, options.scale ? Number(options.scale) : 1, tool.limits.maxPixels).then((output) => new File([output], nameFor(file, tool.slug.endsWith("webp") ? "webp" : "png"), { type: output.type }));
  return new File([cleanSvg(text)], nameFor(file, "svg"), { type: "image/svg+xml" });
}

export function ToolWorkspace({ tool, locale, relatedTools = [], acceptingNewTasks = true, maintenanceMessage = "" }: { tool: Tool; locale: Locale; relatedTools?: Array<{ id: string; name: string; path: string; inputFormats: string[] }>; acceptingNewTasks?: boolean; maintenanceMessage?: string }) {
  const m = getMessages(locale); const copy = getUpgradeCopy(locale); const wc = getWorkspaceCopy(locale); const [items, setItems] = useState<QueueItem[]>([]); const [options, setOptions] = useState<Record<string, string>>(() => defaultWorkspaceOptions(tool.optionSchema)); const [dragging, setDragging] = useState(false); const [busy, setBusy] = useState(false); const [consent, setConsent] = useState(false); const [serverJob, setServerJob] = useState<{ id: string; token: string } | null>(null); const [optionsRevision, setOptionsRevision] = useState(0); const revisionRef = useRef(0); const runRef = useRef(false); const inputRef = useRef<HTMLInputElement>(null); const continuationIds = useRef(new Map<string, string>());
  const groupedTask = ["merge-pdf", "compare-pdf", "png-to-pdf", "jpg-to-pdf", "webp-to-pdf", "bmp-to-pdf", "gif-to-pdf", "svg-to-pdf"].includes(tool.slug);
  const invalidateOptions = useCallback(() => { revisionRef.current += 1; setOptionsRevision(revisionRef.current); }, []);
  const setOption = useCallback((key: string, value: string) => { setOptions((current) => ({ ...current, [key]: value })); invalidateOptions(); }, [invalidateOptions]);
  const addFiles = useCallback((files: FileList | File[]) => {
    // FileList is live: the input handler resets its value immediately after this call.
    // Snapshot before React can defer the functional update, including during navigation.
    if (groupedTask && runRef.current) return;
    const selectedFiles = [...files];
    setItems((current) => { const capacity = Math.max(0, (tool.limits.maxFiles ?? 1) - current.length); const acceptedExtensions = new Set(tool.inputFormats.map((format) => format.toLowerCase())); const incoming = selectedFiles.slice(0, capacity); const added: QueueItem[] = incoming.map((file) => { const extension = file.name.split(".").pop()?.toLowerCase() ?? ""; const type = file.type.toLowerCase(); const formatAccepted = tool.inputFormats.includes("Text") || acceptedExtensions.has(extension) || extension === "jpeg" && acceptedExtensions.has("jpg") || type === "image/jpeg" && acceptedExtensions.has("jpg"); const sizeLimit = (tool.limits.maxMb ?? 8) * 1024 * 1024; if (!formatAccepted) return { id: createClientId(), file, status: "failed" as const, preflightFailed: true, error: `${wc.unsupported} ${tool.inputFormats.join(", ")}` }; if (file.size > sizeLimit) return { id: createClientId(), file, status: "failed" as const, preflightFailed: true, error: `${wc.tooLarge} ${tool.limits.maxMb ?? 8} MB (${bytes(file.size)})` }; if (file.size === 0) return { id: createClientId(), file, status: "failed" as const, preflightFailed: true, error: wc.empty }; return { id: createClientId(), file, status: "waiting" as const }; }); const combined = [...current, ...added]; return groupedTask && added.some(item => !item.preflightFailed) ? requeueGroup(combined) : combined; });
  }, [tool, wc, groupedTask]);
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("from"); if (!id) return; const file = takeSessionFile(id); if (file) setItems([{ id: createClientId(), file, status: "waiting" }]); window.history.replaceState(null, "", window.location.pathname); }, []);
  const serverOnly = tool.processingMode === "server" || ["pdf-to-png", "pdf-to-jpg", "pdf-to-webp", "pdf-to-text", "pdf-to-docx", "pdf-to-xlsx", "pdf-to-pptx", "svg-to-pdf", "compare-pdf", "redact-pdf", "pdf-ocr", "unlock-pdf", "protect-pdf", "verify-pdf", "sanitize-pdf", "tiff-to-svg"].includes(tool.slug) || ["gif-to-pdf", "gif-to-svg"].includes(tool.slug) && Number(options.frame || 1) !== 1 || tool.slug === "compress-pdf" && options.mode === "lossy";
  const updatePageRange = useCallback((value: string) => setOption("pages", value), [setOption]);
  const updatePageOrder = useCallback((value: string) => setOption("order", value), [setOption]);
  const showPdfThumbnails = items.length === 1 && tool.category === "pdf" && tool.inputFormats.includes("PDF") && !["merge-pdf", "compare-pdf"].includes(tool.slug);
  function currentOptions(): Record<string, string> { const selected = Object.fromEntries(tool.optionSchema.map((option) => [option.key, options[option.key] ?? String(option.defaultValue ?? option.choices?.[0] ?? "")])); if (tool.slug === "rotate-pdf") selected.angle = options.angle ?? "90"; if (tool.slug === "sign-pdf") selected.signatureImage = options.signatureImage ?? ""; if (tool.slug === "image-compressor") selected.outputFormat = inputImageFormat(items[0]?.file ?? new File([], "input.png")); return selected; }
  function resetOptions() { setOptions(defaultWorkspaceOptions(tool.optionSchema)); invalidateOptions(); }
  async function processServer(files: File[], runOptions: Record<string, string>): Promise<File> { const form = new FormData(); files.forEach((file) => form.append("file", file)); form.set("toolId", tool.id); form.set("consent", String(consent)); for (const [key, value] of Object.entries(runOptions)) form.set(key, value); const response = await fetch("/api/v1/jobs", { method: "POST", body: form }); if (!response.ok) throw new Error((await response.json()).message || "The server task could not be created."); const job = await response.json() as { id: string; token: string }; setServerJob(job); try { for (;;) { await new Promise((resolve) => setTimeout(resolve, 250)); const status = await fetch(`/api/v1/jobs/${job.id}?token=${encodeURIComponent(job.token)}`, { cache: "no-store" }); if (!status.ok) throw new Error("The server task was cancelled or expired."); const data = await status.json() as { status: string; error?: string; downloadUrl?: string; outputName?: string }; if (data.status === "completed" && data.downloadUrl) { const responseFile = await fetch(`${data.downloadUrl}?token=${encodeURIComponent(job.token)}`); if (!responseFile.ok) throw new Error("The server result could not be downloaded."); const file = await responseFile.blob(); return new File([file], data.outputName || nameFor(files[0], outputExtension(tool)), { type: file.type }); } if (data.status === "failed" || data.status === "cancelled" || data.status === "expired") throw new Error(data.error || `The server task ${data.status}.`); } } finally { setServerJob(null); } }
  async function cancelCurrent() { if (!serverJob) return; await fetch(`/api/v1/jobs/${serverJob.id}?token=${encodeURIComponent(serverJob.token)}`, { method: "POST" }).catch(() => undefined); }
  async function processAll() {
    if (runRef.current || !acceptingNewTasks || !items.length || (serverOnly && !consent)) return;
    const pending = pendingInputs(items, optionsRevision, groupedTask);
    if (!pending.length) return;
    const runRevision = revisionRef.current, runOptions = currentOptions(), runServerOnly = serverOnly;
    runRef.current = true; setBusy(true);
    if (groupedTask) {
      const ids = new Set(pending.map((item) => item.id)); setItems((current) => current.map((entry) => ids.has(entry.id) ? { ...entry, status: "working", attemptRevision: runRevision, error: undefined } : entry));
      try { const output = runServerOnly ? await processServer(pending.map((item) => item.file), runOptions) : await localProcess(pending.map((item) => item.file), tool, runOptions); const source = resultInput(pending.map(item => item.file), output.name); setItems((current) => current.map((entry) => ids.has(entry.id) ? { ...entry, status: "ready", resultRevision: runRevision, resultInput: source, output: entry.id === pending[0].id ? output : undefined } : entry)); recordRecent(tool.id); }
      catch (error) { const message = imageProcessingError(error, locale); setItems((current) => current.map((entry) => ids.has(entry.id) ? { ...entry, status: message.toLowerCase().includes("cancel") ? "cancelled" : "failed", error: message } : entry)); }
      runRef.current = false; setBusy(false); return;
    }
    async function processOne(item: QueueItem) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "working", attemptRevision: runRevision, error: undefined } : entry));
      try { const localOptions = { ...runOptions }; if (tool.slug === "image-compressor") localOptions.outputFormat = inputImageFormat(item.file); const output = runServerOnly ? await processServer([item.file], localOptions) : await localProcess([item.file], tool, localOptions); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "ready", resultRevision: runRevision, output, resultInput: resultInput([item.file], output.name) } : entry)); recordRecent(tool.id); }
      catch (error) { const message = imageProcessingError(error, locale); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: message.toLowerCase().includes("cancel") ? "cancelled" : "failed", error: message } : entry)); }
    }
    const concurrency = !runServerOnly && tool.category === "image" && window.matchMedia("(max-width: 640px)").matches ? limits.mobileImageConcurrency : !runServerOnly && tool.category === "image" ? limits.localImageConcurrency : limits.serverJobConcurrency;
    let nextIndex = 0;
    async function worker() { for (;;) { const index = nextIndex++; if (index >= pending.length) return; await processOne(pending[index]); } }
    await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => worker()));
    runRef.current = false; setBusy(false);
  }
  function remove(id: string) { if (runRef.current) return; setItems((current) => { const target = current.find(item => item.id === id); if (target?.status === "working") return current; const remaining = current.filter(item => item.id !== id); return groupedTask && target && !target.preflightFailed ? requeueGroup(remaining) : remaining; }); }
  function retry(id: string) { if (runRef.current) return; setItems((current) => groupedTask ? requeueGroup(current) : current.map((item) => item.id === id && !item.preflightFailed ? { ...item, status: "waiting", error: undefined } : item)); }
  function download(file: File) { const url = URL.createObjectURL(file); const anchor = document.createElement("a"); anchor.href = url; anchor.download = file.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function continuationId(file: File) { const key = `${file.name}:${file.size}:${file.lastModified}`; const current = continuationIds.current.get(key); if (current) return current; const id = storeSessionFile(file); continuationIds.current.set(key, id); return id; }
  async function downloadZip() { const outputs = items.filter((item) => currentOutput(item, optionsRevision)); if (!outputs.length) return; const zip = new JSZip(); const names = archiveEntryNames(outputs.map(item => item.output!.name)); outputs.forEach((item, index) => zip.file(names[index], item.output!)); download(new File([await zip.generateAsync({ type: "blob" })], `${tool.slug}-results.zip`, { type: "application/zip" })); }
  const outputCount = items.filter((item) => currentOutput(item, optionsRevision)).length;
  const hasStaleResults = items.some(item => staleResult(item, optionsRevision));
  const liveState = busy ? copy.tool.process : hasStaleResults ? copy.tool.review : outputCount > 0 ? copy.tool.download : copy.tool.choose;
  return <div className="workspace" data-has-files={items.length > 0} aria-label={`${tool.name} · ${copy.tool.files}`} onPaste={(event) => { if (event.clipboardData.files.length) addFiles(event.clipboardData.files); }}><div className="workspace-head"><div><span className="eyebrow">{copy.tool.files}</span><p>{m.workspace.dropDescription}</p></div><span className="mode-pill"><span className="mode-mark" aria-hidden="true" />{serverOnly ? tool.processingMode === "server" ? m.workspace.server : m.workspace.hybrid : m.workspace.local}</span></div><div className="workspace-steps" aria-label={liveState}><span className="is-current">01 {copy.tool.choose}</span><span>02 {copy.tool.review}</span><span>03 {copy.tool.process}</span><span>04 {copy.tool.download}</span></div><div className={`dropzone ${dragging ? "dragging" : ""}`} aria-disabled={groupedTask && busy} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}><div><FileUp className="workspace-icon" size={31} strokeWidth={1.5} /><h2>{m.workspace.dropTitle}</h2><p>{m.workspace.dropDescription}</p><button type="button" className="button button-primary" disabled={groupedTask && busy} onClick={() => inputRef.current?.click()}><FileUp size={15} />{m.workspace.choose}</button><input className="file-input" ref={inputRef} type="file" disabled={groupedTask && busy} aria-label={m.workspace.choose} multiple={(tool.limits.maxFiles ?? 1) > 1} accept={tool.inputFormats.map((format) => format === "Text" ? ".txt,.csv,.md" : format === "JPG" ? ".jpg,.jpeg" : `.${format.toLowerCase()}`).join(",")} onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ""; }} /></div></div>
    {items.length > 0 && <div className="file-queue" aria-live="polite"><div className="queue-heading"><div><strong>{copy.tool.files}</strong><span>{items.length} / {tool.limits.maxFiles ?? 1}</span></div><span className="queue-state">{liveState}</span></div>{items.map((item) => <div className="file-row" data-status={item.status} data-stale={staleResult(item, optionsRevision)} key={item.id}><div className="file-row-main">{tool.category === "image" && <div className="file-previews"><FilePreview file={item.file} label={`${m.common.input}: ${item.file.name} · ${wc.preview}`} />{item.output && <FilePreview file={item.output} label={`${m.common.output}: ${item.output.name} · ${wc.preview}`} />}</div>}{tool.category === "svg" && <div className="file-previews">{item.file.type === "image/svg+xml" || item.file.name.toLowerCase().endsWith(".svg") ? tool.slug === "svg-to-dst" ? <DstPreview file={item.file} locale={locale} label={`${m.common.input}: ${item.file.name} · ${wc.preview}`} /> : <SvgPreview file={item.file} toolSlug={tool.slug} options={currentOptions()} label={`${m.common.input}: ${item.file.name} · ${wc.preview}`} /> : item.file.type.startsWith("image/") && <FilePreview file={item.file} label={`${m.common.input}: ${item.file.name} · ${wc.preview}`} />}{item.output && (item.output.type === "image/svg+xml" ? <SvgPreview file={item.output} toolSlug={tool.slug} options={currentOptions()} label={`${m.common.output}: ${item.output.name} · ${wc.preview}`} transform={false} /> : item.output.type.startsWith("image/") && <FilePreview file={item.output} label={`${m.common.output}: ${item.output.name} · ${wc.preview}`} />)}</div>}{tool.category === "icons" && <div className="file-previews"><IconPreview file={item.file} maxPixels={tool.limits.maxPixels} locale={locale} options={currentOptions()} label={`${item.file.name} icon preview`} /></div>}<strong>{item.file.name}</strong><small>{staleResult(item, optionsRevision) && item.status !== "working" ? copy.tool.stale : item.status === "waiting" ? m.workspace.waiting : item.status === "working" ? m.workspace.working : item.status === "ready" ? !item.output && item.resultInput ? includedInResult(locale, item.resultInput.outputName) : m.workspace.ready : item.status === "cancelled" ? getStatusLabel(locale, "cancelled") : m.workspace.failed}</small>{item.output && <FileResultSummary input={item.resultInput ?? resultInput([item.file], item.output.name)} output={item.output} locale={locale} formatBytes={bytes} />}{item.output && currentOutput(item, optionsRevision) && relatedTools.some(related => canContinueFile(item.output!, related.inputFormats)) && <div className="continuation-list"><span>{copy.tool.continue}:</span>{relatedTools.filter(related => canContinueFile(item.output!, related.inputFormats)).map((related) => <Link className="continuation-link" key={related.id} href={`${getLocalePath(locale, related.path)}?from=${encodeURIComponent(continuationId(item.output!))}`}>{related.name}</Link>)}</div>}{item.error && <small className="status-error">{item.error}</small>}</div><div className="file-row-actions">{item.status === "failed" && !item.preflightFailed && <button disabled={busy} type="button" className="text-button" onClick={() => retry(item.id)}>{copy.tool.retry}</button>}{item.output && currentOutput(item, optionsRevision) && <button type="button" className="icon-button" onClick={() => download(item.output!)} aria-label={`${m.workspace.download} ${item.output.name}`}><FileDown size={15} aria-hidden="true" /></button>}<button type="button" className="icon-button" disabled={busy} onClick={() => remove(item.id)} aria-label={`${m.workspace.remove} ${item.file.name}`}><X size={16} aria-hidden="true" /></button></div></div>)}</div>}
    {showPdfThumbnails && items[0] && <PdfThumbnailPanel file={items[0].file} locale={locale} toolSlug={tool.slug} pagesValue={options.pages ?? "all"} orderValue={options.order ?? ""} cropInset={options.inset ?? "18"} onPagesChange={updatePageRange} onOrderChange={updatePageOrder} />}
    <div className="options"><div className="options-heading"><span><SlidersHorizontal size={15} aria-hidden="true" />{copy.tool.options}</span><button type="button" className="text-button" onClick={resetOptions}>{copy.tool.reset}</button></div>{tool.optionSchema.length > 0 && <>{tool.optionSchema.map((option) => <div className="field" key={option.key}><label htmlFor={`${tool.id}-${option.key}`}>{option.label}</label>{option.type === "select" ? <select id={`${tool.id}-${option.key}`} value={options[option.key] ?? String(option.defaultValue ?? option.choices?.[0] ?? "")} onChange={(event) => setOption(option.key, event.target.value)}>{option.choices?.map((choice) => <option value={choice} key={choice}>{getLocalizedChoice(locale, choice)}</option>)}</select> : option.type === "boolean" ? <input id={`${tool.id}-${option.key}`} type="checkbox" checked={options[option.key] === undefined ? option.defaultValue === true : options[option.key] === "true"} onChange={(event) => setOption(option.key, String(event.target.checked))} /> : <input id={`${tool.id}-${option.key}`} type={option.type === "number" ? "number" : option.sensitive ? "password" : "text"} value={options[option.key] ?? String(option.defaultValue ?? "")} onChange={(event) => setOption(option.key, event.target.value)} />}</div>)}</>}{tool.slug === "sign-pdf" && <SignaturePad locale={locale} onImageChange={(value) => setOption("signatureImage", value)} />}{tool.slug === "rotate-pdf" && <div className="field"><label htmlFor="angle">{getLocalizedOptionLabel(locale, "Rotation")}</label><select id="angle" value={options.angle ?? "90"} onChange={(event) => setOption("angle", event.target.value)}><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></div>}<PresetControl toolId={tool.id} locale={locale} options={tool.optionSchema} values={currentOptions()} onApply={(values) => { setOptions((current) => ({ ...current, ...values })); invalidateOptions(); }} />{serverOnly && <label className="field consent-field"><span><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> {m.workspace.consent}</span></label>}{hasStaleResults && <p className="status-warning" role="status">{copy.tool.stale}</p>}<div className="status-line"><span className="mono">{liveState}</span><div className="button-row"><button type="button" className="button button-secondary" onClick={() => setItems([])} disabled={!items.length || busy}><Trash2 size={14} aria-hidden="true" />{m.workspace.clear}</button>{serverJob && <button type="button" className="button button-secondary" onClick={() => void cancelCurrent()} disabled={!busy}>{getCancelLabel(locale)}</button>}<button type="button" className="button button-primary" onClick={processAll} disabled={!acceptingNewTasks || !items.length || busy || (serverOnly && !consent)}>{busy && <LoaderCircle size={14} className="spin" />}{m.workspace.process}</button></div></div>{outputCount > 0 && <button type="button" className="button button-secondary download-all" onClick={downloadZip}>{copy.tool.downloadAll} ({outputCount})</button>}</div>
  </div>;
}
