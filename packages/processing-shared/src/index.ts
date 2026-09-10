import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir } from "node:fs/promises";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
function configuredPixelLimit() { const value = Number(process.env.MAX_DECODED_PIXELS ?? 40_000_000); return Number.isFinite(value) && value > 0 ? value : 40_000_000; }
function configuredPageLimit() { const value = Number(process.env.MAX_PDF_PAGES ?? 300); return Number.isFinite(value) && value > 0 ? value : 300; }

export type OutputFile = { buffer: Buffer; filename: string; mime: string; format: string };
export type ImageOptions = { quality?: number; width?: number; height?: number; background?: string; rotate?: number; format?: string };

function safeBaseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.+/g, ".").slice(0, 100) || "output";
}

function outputName(name: string, format: string): string {
  const base = safeBaseName(name).replace(/\.[^.]+$/, "");
  return `${base}.${format === "jpeg" ? "jpg" : format}`;
}

export async function inspectImage(buffer: Buffer): Promise<{ format: string; width: number; height: number; hasAlpha: boolean; pages?: number }> {
  const meta = await sharp(buffer, { limitInputPixels: configuredPixelLimit() }).metadata();
  if (!meta.format || !meta.width || !meta.height) throw new Error("The file is not a decodable image.");
  const format = meta.format === "heif" && meta.compression === "av1" ? "avif" : meta.format;
  return { format, width: meta.width, height: meta.height, hasAlpha: Boolean(meta.hasAlpha), pages: meta.pages };
}

export async function processImage(buffer: Buffer, name: string, options: ImageOptions = {}): Promise<OutputFile> {
  const input = await inspectImage(buffer);
  if (input.width * input.height > configuredPixelLimit()) throw new Error("Decoded pixel limit exceeded.");
  const requested = (options.format ?? input.format).toLowerCase().replace("jpg", "jpeg");
  const supported = new Set(["png", "jpeg", "webp", "avif"]);
  if (!supported.has(requested)) throw new Error(`Unsupported output format: ${requested}`);
  const quality = Math.max(1, Math.min(100, Math.round(options.quality ?? 82)));
  let pipeline = sharp(buffer, { limitInputPixels: configuredPixelLimit() }).rotate();
  if (options.width || options.height) pipeline = pipeline.resize({ width: options.width, height: options.height, fit: "inside", withoutEnlargement: true });
  if (options.rotate) pipeline = pipeline.rotate(options.rotate);
  if (requested === "jpeg") pipeline = pipeline.flatten({ background: options.background ?? "#ffffff" }).jpeg({ quality, mozjpeg: true });
  if (requested === "png") pipeline = pipeline.png({ compressionLevel: 9, palette: false });
  if (requested === "webp") pipeline = pipeline.webp({ quality, effort: 4 });
  if (requested === "avif") pipeline = pipeline.avif({ quality, effort: 4 });
  const out = await pipeline.toBuffer();
  const outputMeta = await inspectImage(out);
  if (outputMeta.format !== requested) throw new Error("The encoder returned an unexpected format.");
  return { buffer: out, filename: outputName(name, requested), mime: requested === "jpeg" ? "image/jpeg" : `image/${requested}`, format: requested };
}

export async function rasterImageToSvg(input: Buffer, name: string, frame = 1, signal?: AbortSignal): Promise<OutputFile> {
  if (!Number.isInteger(frame) || frame < 1) throw new Error("The raster frame must be a positive integer.");
  if (signal?.aborted) throw new Error("Raster vectorization was cancelled.");
  try {
    const source = sharp(input, { limitInputPixels: configuredPixelLimit(), page: frame - 1 }).rotate().resize({ width: 96, height: 96, fit: "inside", withoutEnlargement: true }).ensureAlpha();
    const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
    const shapes: string[] = [];
    for (let y = 0; y < info.height; y += 1) {
      if (signal?.aborted) throw new Error("Raster vectorization was cancelled.");
      for (let x = 0; x < info.width; x += 1) {
        const offset = (y * info.width + x) * info.channels; const alpha = data[offset + 3]; if (alpha < 8) continue;
        const color = `#${[data[offset], data[offset + 1], data[offset + 2]].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
        shapes.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"${alpha < 255 ? ` fill-opacity="${(alpha / 255).toFixed(3)}"` : ""}/>`);
      }
    }
    if (!shapes.length) throw new Error("The raster contains no visible pixels.");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${info.width} ${info.height}">${shapes.join("")}</svg>`;
    return { buffer: Buffer.from(svg), filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.svg`, mime: "image/svg+xml", format: "svg" };
  } catch (error) { if (signal?.aborted) throw error; const detail = error instanceof Error ? error.message.split("\n")[0] : "raster vectorization failed"; throw new Error(`Raster to SVG conversion failed: ${detail}`); }
}

function pageRange(value: string | undefined, pageCount: number): number[] {
  if (!value || value.trim().toLowerCase() === "all") return Array.from({ length: pageCount }, (_, index) => index);
  const pages = new Set<number>();
  for (const part of value.split(",")) {
    const [first, last] = part.trim().split("-").map((v) => Number(v));
    if (!Number.isInteger(first) || first < 1) throw new Error("Page ranges use positive numbers, for example 1-3,5.");
    const end = Number.isInteger(last) ? last : first;
    if (end < first || end > pageCount) throw new Error("Page range is outside the document.");
    for (let page = first; page <= end; page += 1) pages.add(page - 1);
  }
  return [...pages].sort((a, b) => a - b);
}

async function savePdf(document: PDFDocument, filename: string): Promise<OutputFile> {
  const bytes = await document.save({ useObjectStreams: true });
  const buffer = Buffer.from(bytes);
  const check = await PDFDocument.load(buffer, { ignoreEncryption: false });
  if (check.getPageCount() < 1) throw new Error("A PDF must contain at least one page.");
  return { buffer, filename: `${safeBaseName(filename).replace(/\.[^.]+$/, "")}.pdf`, mime: "application/pdf", format: "pdf" };
}

function svgColor(value: string | undefined) {
  const match = value?.trim().match(/^#([0-9a-f]{6})$/i); if (!match) return undefined;
  const number = Number.parseInt(match[1], 16); return rgb((number >> 16 & 255) / 255, (number >> 8 & 255) / 255, (number & 255) / 255);
}

function textPosition(position: string | undefined, width: number, height: number, textWidth: number, size: number) {
  const margin = 36;
  const x = position?.endsWith("left") ? margin : position?.endsWith("right") ? Math.max(margin, width - margin - textWidth) : (width - textWidth) / 2;
  const y = position?.startsWith("top") ? height - margin - size : position === "center" ? (height - size) / 2 : margin;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

async function svgToPdf(input: Buffer, name: string, signal?: AbortSignal): Promise<OutputFile> {
  const source = input.toString("utf8"); if (signal?.aborted) throw new Error("SVG to PDF conversion was cancelled."); if (!/^\s*<svg\b/i.test(source)) throw new Error("The SVG root element is missing."); if (/<!doctype|<!entity|<script|on[a-z]+\s*=|\b(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|data:)/i.test(source)) throw new Error("Unsafe SVG content was blocked; scripts, events and external references are not accepted.");
  const viewBox = source.match(/\bviewBox\s*=\s*["']\s*(-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)\s*["']/i); const dimensions = viewBox ? { minX: Number(viewBox[1]), minY: Number(viewBox[2]), width: Number(viewBox[3]), height: Number(viewBox[4]) } : { minX: 0, minY: 0, width: Number(source.match(/\bwidth\s*=\s*["']([\d.]+)/i)?.[1] ?? 595), height: Number(source.match(/\bheight\s*=\s*["']([\d.]+)/i)?.[1] ?? 842) }; if (![dimensions.width, dimensions.height].every((value) => Number.isFinite(value) && value > 0)) throw new Error("SVG dimensions are invalid.");
  const paths = [...source.matchAll(/<path\b([^>]*?)\bd\s*=\s*["']([^"']+)["'][^>]*>/gi)]; if (!paths.length) throw new Error("SVG to PDF currently supports SVG path elements; no path geometry was found.");
  const pageWidth = Math.min(1440, Math.max(1, dimensions.width)); const pageHeight = Math.min(1440, Math.max(1, dimensions.height)); const scale = Math.min(pageWidth / dimensions.width, pageHeight / dimensions.height); const document = await PDFDocument.create(); const page = document.addPage([pageWidth, pageHeight]);
  for (const match of paths) { if (signal?.aborted) throw new Error("SVG to PDF conversion was cancelled."); const attributes = match[1]; const fill = svgColor(attributes.match(/\bfill\s*=\s*["']([^"']+)["']/i)?.[1]); const options = fill ? { x: -dimensions.minX * scale, y: -dimensions.minY * scale, scale, color: fill } : { x: -dimensions.minX * scale, y: -dimensions.minY * scale, scale, borderColor: rgb(0.08, 0.25, 0.21), borderWidth: 1 }; page.drawSvgPath(match[2], options); }
  return savePdf(document, `${safeBaseName(name).replace(/\.[^.]+$/, "")}-vector.pdf`);
}

export async function processPdf(buffers: Buffer[], names: string[], adapterId: string, options: Record<string, string | number | boolean> = {}, signal?: AbortSignal): Promise<OutputFile> {
  if (!buffers.length) throw new Error("At least one input file is required.");
  if (["docx-to-pdf", "xlsx-to-pdf", "pptx-to-pdf"].includes(adapterId)) return officeToPdf(buffers[0], names[0], signal);
  if (adapterId === "svg-to-pdf") return svgToPdf(buffers[0], names[0], signal);
  if (["merge-pdf"].includes(adapterId)) {
    const merged = await PDFDocument.create();
    for (const source of buffers) {
      const loaded = await PDFDocument.load(source, { ignoreEncryption: false });
      const copied = await merged.copyPages(loaded, loaded.getPageIndices());
      copied.forEach((page) => merged.addPage(page));
    }
    return savePdf(merged, "merged.pdf");
  }
  const source = await PDFDocument.load(buffers[0], { ignoreEncryption: false });
  const pageCount = source.getPageCount();
  if (pageCount > configuredPageLimit()) throw new Error(`The PDF exceeds the ${configuredPageLimit()}-page limit.`);
  const selected = pageRange(String(options.pages ?? "all"), pageCount);
  if (["extract-pages", "split-pdf"].includes(adapterId)) {
    const result = await PDFDocument.create();
    for (const index of selected) result.addPage((await result.copyPages(source, [index]))[0]);
    if (adapterId === "split-pdf") {
      const zip = new JSZip();
      for (const [position, index] of selected.entries()) {
        const part = await PDFDocument.create();
        part.addPage((await part.copyPages(source, [index]))[0]);
        zip.file(`page-${String(position + 1).padStart(3, "0")}.pdf`, Buffer.from(await part.save()));
      }
      return { buffer: Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })), filename: "split-pages.zip", mime: "application/zip", format: "zip" };
    }
    return savePdf(result, `${adapterId}.pdf`);
  }
  if (adapterId === "delete-pages") {
    if (selected.length >= pageCount) throw new Error("Deleting all pages would create an invalid empty PDF.");
    const result = await PDFDocument.create();
    const kept = source.getPageIndices().filter((index) => !selected.includes(index));
    for (const page of await result.copyPages(source, kept)) result.addPage(page);
    return savePdf(result, "pages-deleted.pdf");
  }
  if (adapterId === "reverse-pdf") {
    const result = await PDFDocument.create();
    for (const page of await result.copyPages(source, [...source.getPageIndices()].reverse())) result.addPage(page);
    return savePdf(result, "reversed.pdf");
  }
  if (adapterId === "duplicate-pages") {
    const result = await PDFDocument.create();
    const repeats = Math.max(1, Math.min(10, Number(options.times ?? 1)));
    const sequence = [...source.getPageIndices()];
    const at = Math.max(0, Math.min(sequence.length, Number(options.position ?? sequence.length)));
    sequence.splice(at, 0, ...selected.flatMap((page) => Array.from({ length: repeats }, () => page)));
    for (const page of await result.copyPages(source, sequence)) result.addPage(page);
    return savePdf(result, "duplicated-pages.pdf");
  }
  if (adapterId === "rotate-pdf") {
    for (const index of selected) {
      const page = source.getPage(index);
      page.setRotation(degrees((page.getRotation().angle + Number(options.angle ?? 90)) % 360));
    }
    return savePdf(source, "rotated.pdf");
  }
  if (adapterId === "watermark-pdf" || adapterId === "sign-pdf" || adapterId === "header-footer-pdf" || adapterId === "page-numbers-pdf") {
    const font = await source.embedFont(StandardFonts.Helvetica);
    const signatureData = typeof options.signatureImage === "string" ? options.signatureImage.match(/^data:image\/png;base64,([a-z0-9+/=]+)$/i)?.[1] : undefined;
    const signatureBuffer = signatureData ? Buffer.from(signatureData, "base64") : undefined;
    if (signatureBuffer && signatureBuffer.byteLength > 4 * 1024 * 1024) throw new Error("The signature image exceeds the 4 MB limit.");
    const signatureImage = signatureBuffer ? await source.embedPng(signatureBuffer) : undefined;
    for (const index of selected) {
      const page = source.getPage(index); const { width, height } = page.getSize();
      if (adapterId === "watermark-pdf") { const text = String(options.text ?? "HXSL Tools"); const size = Number(options.size ?? 24); const placement = textPosition(String(options.position ?? "bottom-right"), width, height, font.widthOfTextAtSize(text, size), size); page.drawText(text, { ...placement, size, font, rotate: degrees(Number(options.rotation ?? 0)), opacity: Math.max(0.05, Math.min(1, Number(options.opacity ?? 0.35))), color: rgb(0.15, 0.37, 0.32) }); }
      if (adapterId === "sign-pdf") {
        if (signatureImage) {
          const targetWidth = Math.min(180, Math.max(40, width - 80), Math.max(40, (height - 80) * signatureImage.height / signatureImage.width));
          page.drawImage(signatureImage, { x: 40, y: 40, width: targetWidth, height: targetWidth * signatureImage.height / signatureImage.width });
        } else page.drawText(String(options.signature ?? "Signed with HXSL Tools (appearance only)"), { x: Number(options.x ?? 40), y: Number(options.y ?? 40), size: Number(options.size ?? 12), font, color: rgb(0.08, 0.25, 0.21) });
      }
      if (adapterId === "header-footer-pdf") { const header = String(options.header ?? ""); const footer = String(options.footer ?? ""); if (header) page.drawText(header.replace("{page}", String(index + 1)), { x: 40, y: height - 32, size: Number(options.size ?? 10), font }); if (footer) page.drawText(footer.replace("{page}", String(index + 1)), { x: 40, y: 24, size: Number(options.size ?? 10), font }); }
      if (adapterId === "page-numbers-pdf") { const size = Number(options.size ?? 10); const number = String(options.format ?? "{page}").replaceAll("{page}", String(Number(options.start ?? 1) + index)); const placement = textPosition(String(options.position ?? "bottom-right"), width, height, font.widthOfTextAtSize(number, size), size); page.drawText(number, { ...placement, size, font }); }
    }
    return savePdf(source, `${adapterId}.pdf`);
  }
  if (adapterId === "metadata-pdf") {
    if (typeof options.title === "string") source.setTitle(options.title);
    if (typeof options.author === "string") source.setAuthor(options.author);
    if (typeof options.subject === "string") source.setSubject(options.subject);
    if (typeof options.keywords === "string") source.setKeywords(String(options.keywords).split(",").map((item) => item.trim()).filter(Boolean));
    return savePdf(source, "metadata-edited.pdf");
  }
  if (adapterId === "crop-pdf") {
    for (const index of selected) { const page = source.getPage(index); const { width, height } = page.getSize(); const inset = Math.max(0, Math.min(Math.min(width, height) / 2, Number(options.inset ?? 18))); page.setCropBox(inset, inset, width - inset * 2, height - inset * 2); }
    return savePdf(source, "cropped.pdf");
  }
  if (adapterId === "resize-pdf") {
    const preset = String(options.paper ?? "a4"); const width = preset === "letter" ? 612 : preset === "a4" ? 595.28 : Math.max(1, Number(options.width ?? 595.28)); const height = preset === "letter" ? 792 : preset === "a4" ? 841.89 : Math.max(1, Number(options.height ?? 841.89)); if (![width, height].every((value) => Number.isFinite(value) && value > 0)) throw new Error("The requested PDF page size is invalid."); for (const page of source.getPages()) page.setSize(width, height); return savePdf(source, "resized.pdf");
  }
  if (adapterId === "flatten-pdf") {
    try { source.getForm().flatten({ updateFieldAppearances: true }); } catch { /* no supported AcroForm fields; the original page objects remain */ }
    return savePdf(source, "flattened.pdf");
  }
  if (adapterId === "sanitize-pdf") {
    const clean = await PDFDocument.create(); for (const page of await clean.copyPages(source, source.getPageIndices())) clean.addPage(page); clean.setTitle(""); clean.setAuthor(""); clean.setSubject(""); clean.setKeywords([]); clean.setCreator("HXSL Tools"); clean.setProducer("HXSL Tools"); clean.setCreationDate(new Date(0)); clean.setModificationDate(new Date(0)); return savePdf(clean, "sanitized.pdf");
  }
  if (adapterId === "verify-pdf") {
    return verifyPdf(buffers[0], names[0], signal);
  }
  if (adapterId === "compare-pdf") {
    if (buffers.length < 2) throw new Error("Compare PDF requires two input files.");
    const left = await extractPdfText(buffers[0], names[0], signal); const right = await extractPdfText(buffers[1], names[1] ?? "second.pdf", signal);
    const leftLines = left.buffer.toString("utf8").split(/\r?\n/); const rightLines = right.buffer.toString("utf8").split(/\r?\n/); const max = Math.max(leftLines.length, rightLines.length); const differences: string[] = [];
    for (let index = 0; index < max; index += 1) if (leftLines[index] !== rightLines[index]) differences.push(`-${leftLines[index] ?? ""}\n+${rightLines[index] ?? ""}`);
    const visual = String(options.visual ?? "false") === "true" || options.visual === true; const visualLines = visual ? await compareRenderedPages(buffers[0], names[0], buffers[1], names[1] ?? "second.pdf", signal) : ["visualComparison: not run (enable the visual page diff option)"]; const report = [`pagesA: ${pageCount}`, `pagesB: ${(await PDFDocument.load(buffers[1], { ignoreEncryption: false })).getPageCount()}`, ...visualLines, `textDifferences: ${differences.length}`, differences.join("\n")].filter(Boolean).join("\n");
    return { buffer: Buffer.from(`${report}\n`), filename: "compare-report.txt", mime: "text/plain", format: "txt" };
  }
  if (adapterId === "reorder-pages") {
    const order = String(options.order ?? "").split(",").filter(Boolean).map(Number).map((page) => page - 1);
    if (order.length !== pageCount || order.some((page) => page < 0 || page >= pageCount) || new Set(order).size !== pageCount) throw new Error("Reorder must contain every page number once.");
    const result = await PDFDocument.create();
    for (const page of await result.copyPages(source, order)) result.addPage(page);
    return savePdf(result, "reordered.pdf");
  }
  if (adapterId === "png-to-pdf" || adapterId === "jpg-to-pdf" || adapterId === "webp-to-pdf" || adapterId === "bmp-to-pdf" || adapterId === "gif-to-pdf") {
    const result = await PDFDocument.create();
    for (const buffer of buffers) {
      const requestedFrame = Number(options.frame ?? 1); if (!Number.isInteger(requestedFrame) || requestedFrame < 1) throw new Error("GIF frame must be a positive integer.");
      const frame = adapterId === "gif-to-pdf" ? requestedFrame : 1;
      const png = await sharp(buffer, { page: frame - 1 }).rotate().png().toBuffer();
      const meta = await sharp(png).metadata();
      const image = await result.embedPng(png);
      const width = meta.width ?? 1;
      const height = meta.height ?? 1;
      const selectedPaper = String(options.paper ?? "image"); const landscape = String(options.orientation ?? "portrait") === "landscape"; const paperSize: [number, number] = selectedPaper === "letter" ? [612, 792] : [595.28, 841.89]; const rawPageSize: [number, number] = selectedPaper === "image" ? [width, height] : paperSize; const pageSize: [number, number] = landscape ? [rawPageSize[1], rawPageSize[0]] : rawPageSize; const page = result.addPage(pageSize); const background = svgColor(String(options.background ?? "#ffffff")); if (background) page.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: background }); const margin = Math.max(0, Math.min(Math.min(pageSize[0], pageSize[1]) / 2, Number(options.margin ?? 24))); const availableWidth = Math.max(1, pageSize[0] - margin * 2); const availableHeight = Math.max(1, pageSize[1] - margin * 2); const scale = String(options.fit ?? "contain") === "cover" ? Math.max(availableWidth / width, availableHeight / height) : Math.min(availableWidth / width, availableHeight / height); const drawWidth = width * scale; const drawHeight = height * scale;
      page.drawImage(image, { x: (pageSize[0] - drawWidth) / 2, y: (pageSize[1] - drawHeight) / 2, width: drawWidth, height: drawHeight });
    }
    return savePdf(result, "images.pdf");
  }
  if (adapterId === "compress-pdf") return optimizePdf(buffers[0], names[0] ?? "input.pdf", String(options.mode ?? "structural"), signal);
  if (adapterId === "pdf-ocr") return ocrPdf(buffers[0], names[0], String(options.language ?? "eng"), signal);
  if (adapterId === "redact-pdf") return redactPdf(buffers[0], names[0], String(options.terms ?? ""), signal);
  if (["pdf-to-docx", "pdf-to-xlsx", "pdf-to-pptx"].includes(adapterId)) return convertPdfToOffice(buffers[0], names[0], adapterId, signal);
  throw new Error(`The ${adapterId} adapter requires a dedicated engine that is not enabled in this core build.`);
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function columnName(index: number): string {
  let value = index + 1; let result = "";
  while (value > 0) { const remainder = (value - 1) % 26; result = String.fromCharCode(65 + remainder) + result; value = Math.floor((value - 1) / 26); }
  return result;
}

async function makeDocx(text: string, name: string): Promise<OutputFile> {
  const zip = new JSZip(); const paragraphs = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`).join("");
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs || "<w:p/>"}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`);
  const buffer = Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })); return { buffer, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.docx`, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", format: "docx" };
}

async function makeXlsx(text: string, name: string): Promise<OutputFile> {
  const zip = new JSZip(); const rows = text.split(/\r?\n/).filter((line) => line.trim()).map((line) => line.split(/\t|\s{2,}|,/).map((cell) => cell.trim()));
  const sheet = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, columnIndex) => `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${xmlEscape(cell)}</t></is></c>`).join("")}</row>`).join("");
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Extracted text" sheetId="1" r:id="rId1"/></sheets></workbook>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
  zip.file("xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet || "<row r=\"1\"><c r=\"A1\" t=\"inlineStr\"><is><t>No selectable text was found.</t></is></c></row>"}</sheetData></worksheet>`);
  const buffer = Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })); return { buffer, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.xlsx`, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", format: "xlsx" };
}

async function makeBasicPptx(text: string, name: string): Promise<OutputFile> {
  const zip = new JSZip(); const lines = text.split(/\r?\n/).filter((line) => line.trim()).slice(0, 80); const runs = (lines.length ? lines : ["No selectable text was found."]).map((line) => `<a:p><a:r><a:rPr lang="en-US"/><a:t>${xmlEscape(line)}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>`).join("");
  const ns = `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"`;
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/><Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/><Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`);
  zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8"?><p:presentation ${ns}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`);
  zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>`);
  zip.file("ppt/slides/slide1.xml", `<?xml version="1.0" encoding="UTF-8"?><p:sld ${ns}><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Extracted text"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="914400" y="914400"/><a:ext cx="10668000" cy="5029200"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/>${runs}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`);
  zip.file("ppt/slides/_rels/slide1.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`);
  zip.file("ppt/slideLayouts/slideLayout1.xml", `<?xml version="1.0" encoding="UTF-8"?><p:sldLayout ${ns} type="title" preserve="1"><p:cSld name="Title Slide"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`);
  zip.file("ppt/slideLayouts/_rels/slideLayout1.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`);
  zip.file("ppt/slideMasters/slideMaster1.xml", `<?xml version="1.0" encoding="UTF-8"?><p:sldMaster ${ns}><p:cSld name=""><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles/><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldMaster>`);
  zip.file("ppt/slideMasters/_rels/slideMaster1.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`);
  zip.file("ppt/theme/theme1.xml", `<?xml version="1.0" encoding="UTF-8"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="HXSL"><a:themeElements><a:clrScheme name="HXSL"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="155E52"/></a:accent1><a:accent2><a:srgbClr val="D9EBE4"/></a:accent2><a:accent3><a:srgbClr val="64748B"/></a:accent3><a:accent4><a:srgbClr val="F59E0B"/></a:accent4><a:accent5><a:srgbClr val="EF4444"/></a:accent5><a:accent6><a:srgbClr val="2563EB"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="HXSL"><a:majorFont><a:latin typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="HXSL"><a:fillStyleLst/><a:lnStyleLst/><a:effectStyleLst/><a:bgFillStyleLst/></a:fmtScheme></a:themeElements></a:theme>`);
  zip.file("ppt/presProps.xml", `<?xml version="1.0" encoding="UTF-8"?><p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>`); zip.file("ppt/viewProps.xml", `<?xml version="1.0" encoding="UTF-8"?><p:viewPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:normalViewPr><p:restoredLeft sz="15620" autoAdjust="0"/><p:restoredTop sz="94660" autoAdjust="0"/></p:normalViewPr></p:viewPr>`); zip.file("ppt/tableStyles.xml", `<?xml version="1.0" encoding="UTF-8"?><a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def=""/>`);
  const buffer = Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })); return { buffer, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.pptx`, mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", format: "pptx" };
}

async function convertPdfToOffice(input: Buffer, name: string, adapterId: string, signal?: AbortSignal): Promise<OutputFile> {
  const text = (await extractPdfText(input, name, signal)).buffer.toString("utf8");
  if (adapterId === "pdf-to-docx") return makeDocx(text, name);
  if (adapterId === "pdf-to-xlsx") { if (!text.trim()) throw new Error("No selectable table text was found; XLSX output was not created."); return makeXlsx(text, name); }
  return makeBasicPptx(text, name);
}

async function officeToPdf(input: Buffer, name: string, signal?: AbortSignal): Promise<OutputFile> {
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const path = await import("node:path"); const directory = await fs.mkdtemp(`${os.tmpdir()}/hxsl-office-`); const extension = path.extname(name).toLowerCase() || ".docx"; const source = path.join(directory, `input${extension}`); const profile = path.join(directory, "profile"); await fs.writeFile(source, input, { mode: 0o600 });
  try { await execFileAsync("libreoffice", ["--headless", "--nologo", "--nodefault", "--nofirststartwizard", "--nolockcheck", `-env:UserInstallation=file://${profile}`, "--convert-to", "pdf", "--outdir", directory, source], { timeout: 120_000, maxBuffer: 2 * 1024 * 1024, signal }); const files = (await readdir(directory)).filter((file) => file.endsWith(".pdf")); if (!files.length) throw new Error("LibreOffice returned no PDF output."); const buffer = await fs.readFile(path.join(directory, files[0])); return { buffer, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.pdf`, mime: "application/pdf", format: "pdf" }; } catch (error) { const detail = error instanceof Error ? error.message.split("\n")[0] : "LibreOffice conversion failed"; throw new Error(`Office to PDF conversion failed: ${detail}`); } finally { await fs.rm(directory, { recursive: true, force: true }); }
}

async function optimizePdf(input: Buffer, name: string, mode = "structural", signal?: AbortSignal): Promise<OutputFile> {
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const directory = await fs.mkdtemp(`${os.tmpdir()}/hxsl-qpdf-opt-`); const source = `${directory}/input.pdf`; const output = `${directory}/output.pdf`; await fs.writeFile(source, input, { mode: 0o600 });
  const lossy = mode === "lossy";
  if (!lossy && mode !== "structural") throw new Error("Unknown PDF compression mode.");
  try {
    const command = lossy ? "gs" : "qpdf";
    const args = lossy
      ? ["-q", "-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.7", "-dPDFSETTINGS=/ebook", "-dDetectDuplicateImages=true", "-dCompressFonts=true", "-dSubsetFonts=true", `-sOutputFile=${output}`, source]
      : ["--object-streams=generate", "--stream-data=compress", source, output];
    await execFileAsync(command, args, { timeout: lossy ? 120_000 : 60_000, maxBuffer: 2 * 1024 * 1024, signal });
    const optimized = await fs.readFile(output);
    const check = await PDFDocument.load(optimized, { ignoreEncryption: false });
    if (check.getPageCount() < 1) throw new Error("The compression engine returned an empty PDF.");
    if (optimized.byteLength < input.byteLength) return { buffer: optimized, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}-compressed.pdf`, mime: "application/pdf", format: "pdf" };
    return { buffer: input, filename: safeBaseName(name).replace(/\.[^.]+$/, "") + ".pdf", mime: "application/pdf", format: "pdf" };
  } catch (error) {
    if (signal?.aborted || lossy) throw error;
    const document = await PDFDocument.load(input, { ignoreEncryption: false });
    const fallback = Buffer.from(await document.save({ useObjectStreams: true }));
    return fallback.byteLength < input.byteLength
      ? { buffer: fallback, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}-compressed.pdf`, mime: "application/pdf", format: "pdf" }
      : { buffer: input, filename: safeBaseName(name).replace(/\.[^.]+$/, "") + ".pdf", mime: "application/pdf", format: "pdf" };
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}

async function verifyPdf(input: Buffer, name: string, signal?: AbortSignal): Promise<OutputFile> {
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const directory = await fs.mkdtemp(`${os.tmpdir()}/hxsl-verify-`); const source = `${directory}/input.pdf`; await fs.writeFile(source, input, { mode: 0o600 }); const raw = input.toString("latin1"); let structure = "unknown";
  try { await execFileAsync("qpdf", ["--check", source], { timeout: 30_000, maxBuffer: 1024 * 1024, signal }); structure = "valid"; } catch (error) { if (signal?.aborted) throw error; structure = raw.startsWith("%PDF-") ? "qpdf check failed or password is required" : "invalid header"; }
  const report = [`structure: ${structure}`, `encryption: ${raw.includes("/Encrypt") ? "present" : "not detected"}`, `signature: ${raw.includes("/Sig") ? "present; trust and revocation are unknown" : "not detected"}`, "certificateTrust: unknown", "timestamp: unknown", "revocation: unknown", `source: ${name}`].join("\n"); await fs.rm(directory, { recursive: true, force: true }); return { buffer: Buffer.from(`${report}\n`), filename: "verify-report.txt", mime: "text/plain", format: "txt" };
}

async function ocrPdf(input: Buffer, name: string, language: string, signal?: AbortSignal): Promise<OutputFile> {
  if (!/^[a-zA-Z0-9_+.-]+$/.test(language)) throw new Error("OCR language contains unsupported characters.");
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const directory = await fs.mkdtemp(`${os.tmpdir()}/hxsl-ocr-`); const source = `${directory}/input.pdf`; await fs.writeFile(source, input, { mode: 0o600 });
  try {
    await execFileAsync("pdftoppm", ["-png", "-r", "180", source, `${directory}/page`], { timeout: 120_000, maxBuffer: 1024 * 1024, signal });
    const pages = (await readdir(directory)).filter((file) => /^page-\d+\.png$/.test(file)).sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0));
    if (!pages.length) throw new Error("PDF renderer returned no pages.");
    const result = await PDFDocument.create(); const textPages: string[] = [];
    for (const page of pages) {
      const prefix = `${directory}/${page.replace(/\.png$/, "")}`;
      await execFileAsync("tesseract", [`${directory}/${page}`, prefix, "-l", language, "pdf"], { timeout: 120_000, maxBuffer: 1024 * 1024, signal });
      const recognizedText = await execFileAsync("tesseract", [`${directory}/${page}`, "stdout", "-l", language], { timeout: 120_000, maxBuffer: 4 * 1024 * 1024, signal });
      textPages.push(String(recognizedText.stdout ?? "").trim());
      const recognized = await PDFDocument.load(await fs.readFile(`${prefix}.pdf`), { ignoreEncryption: false });
      for (const copied of await result.copyPages(recognized, recognized.getPageIndices())) result.addPage(copied);
    }
    const searchablePdf = await savePdf(result, `${safeBaseName(name).replace(/\.[^.]+$/, "")}-searchable.pdf`);
    const zip = new JSZip(); const base = safeBaseName(name).replace(/\.[^.]+$/, "");
    zip.file(searchablePdf.filename, searchablePdf.buffer); zip.file(`${base}-ocr.txt`, `${textPages.join("\n\n").trim()}\n`);
    return { buffer: Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })), filename: `${base}-ocr.zip`, mime: "application/zip", format: "zip" };
  } catch (error) { const detail = error instanceof Error ? error.message.split("\n")[0] : "OCR failed"; throw new Error(`PDF OCR is unavailable or failed: ${detail}`); } finally { await fs.rm(directory, { recursive: true, force: true }); }
}

async function redactPdf(input: Buffer, name: string, terms: string, signal?: AbortSignal): Promise<OutputFile> {
  const needles = terms.split(",").map((term) => term.trim().toLowerCase()).filter(Boolean); if (!needles.length) throw new Error("Redaction requires one or more comma-separated text terms.");
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const directory = await fs.mkdtemp(`${os.tmpdir()}/hxsl-redact-`); const source = `${directory}/input.pdf`; const bboxFile = `${directory}/bbox.html`; await fs.writeFile(source, input, { mode: 0o600 });
  try { await execFileAsync("pdftotext", ["-bbox", "-enc", "UTF-8", source, bboxFile], { timeout: 60_000, maxBuffer: 2 * 1024 * 1024, signal }); const bbox = await fs.readFile(bboxFile, "utf8"); const pages = [...bbox.matchAll(/<page\s+width="([\d.]+)"\s+height="([\d.]+)">([\s\S]*?)<\/page>/g)].map((match) => ({ width: Number(match[1]), height: Number(match[2]), words: [...match[3].matchAll(/<word\s+xMin="([\d.]+)"\s+yMin="([\d.]+)"\s+xMax="([\d.]+)"\s+yMax="([\d.]+)">([^<]*)<\/word>/g)].map((word) => ({ xMin: Number(word[1]), yMin: Number(word[2]), xMax: Number(word[3]), yMax: Number(word[4]), text: word[5].toLowerCase() })) })); await execFileAsync("pdftoppm", ["-png", "-r", "144", source, `${directory}/page`], { timeout: 120_000, maxBuffer: 1024 * 1024, signal }); const rendered = (await readdir(directory)).filter((file) => /^page-\d+\.png$/.test(file)).sort((a, b) => Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0)); const redactions = pages.map((page) => page.words.filter((word) => needles.some((needle) => word.text === needle || word.text.includes(needle)))); if (!redactions.some((items) => items.length)) throw new Error("No matching text was found; no redacted PDF was created."); const result = await PDFDocument.create(); for (let index = 0; index < rendered.length; index += 1) { if (signal?.aborted) throw new Error("Secure text redaction was cancelled."); const pageInfo = pages[index] ?? { width: 612, height: 792, words: [] }; const image = await sharp(await fs.readFile(`${directory}/${rendered[index]}`)).metadata(); const scaleX = (image.width ?? 1) / pageInfo.width; const scaleY = (image.height ?? 1) / pageInfo.height; const overlay = `<svg width="${image.width ?? 1}" height="${image.height ?? 1}">${redactions[index].map((word) => `<rect x="${word.xMin * scaleX}" y="${word.yMin * scaleY}" width="${(word.xMax - word.xMin) * scaleX}" height="${(word.yMax - word.yMin) * scaleY}" fill="white"/>`).join("")}</svg>`; const redacted = await sharp(await fs.readFile(`${directory}/${rendered[index]}`)).composite([{ input: Buffer.from(overlay) }]).png().toBuffer(); const embedded = await result.embedPng(redacted); const page = result.addPage([pageInfo.width, pageInfo.height]); page.drawImage(embedded, { x: 0, y: 0, width: pageInfo.width, height: pageInfo.height }); } return savePdf(result, `${safeBaseName(name).replace(/\.[^.]+$/, "")}-redacted.pdf`); } catch (error) { const detail = error instanceof Error ? error.message.split("\n")[0] : "redaction failed"; throw new Error(`Secure text redaction failed: ${detail}`); } finally { await fs.rm(directory, { recursive: true, force: true }); }
}

export async function runQpdf(input: Buffer, name: string, mode: "decrypt" | "encrypt", password: string, signal?: AbortSignal): Promise<OutputFile> {
  if (!password) throw new Error("A password is required and is never logged.");
  const fs = await import("node:fs/promises");
  const os = await import("node:os");
  const path = await fs.mkdtemp(`${os.tmpdir()}/hxsl-qpdf-`);
  const inputPath = `${path}/input.pdf`;
  const outputPath = `${path}/output.pdf`;
  await fs.writeFile(inputPath, input, { mode: 0o600 });
  try {
    const args = mode === "decrypt" ? [`--password=${password}`, "--decrypt", inputPath, outputPath] : ["--encrypt", password, password, "256", "--", inputPath, outputPath];
    await execFileAsync("qpdf", args, { timeout: 30_000, maxBuffer: 1024 * 1024, signal });
    const buffer = await fs.readFile(outputPath);
    return { buffer, filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}-${mode === "decrypt" ? "unlocked" : "protected"}.pdf`, mime: "application/pdf", format: "pdf" };
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : "qpdf failed";
    throw new Error(`PDF password operation failed: ${detail}`);
  } finally {
    await fs.rm(path, { recursive: true, force: true });
  }
}

export async function renderPdf(input: Buffer, name: string, format: "png" | "jpg" | "webp", quality = 82, signal?: AbortSignal, options: Record<string, string | number | boolean> = {}): Promise<OutputFile> {
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const path = await fs.mkdtemp(`${os.tmpdir()}/hxsl-render-`); const inputPath = `${path}/input.pdf`; const prefix = `${path}/page`; await fs.writeFile(inputPath, input, { mode: 0o600 });
  try {
    const pdf = await PDFDocument.load(input, { ignoreEncryption: false }); if (pdf.getPageCount() > configuredPageLimit()) throw new Error(`The PDF exceeds the ${configuredPageLimit()}-page limit.`); const selected = pageRange(String(options.pages ?? "all"), pdf.getPageCount()); if (!selected.length) throw new Error("The selected page range is empty."); const dpi = Math.max(36, Math.min(300, Number(options.dpi ?? 144))); const first = Math.min(...selected) + 1; const last = Math.max(...selected) + 1; const args = format === "jpg" ? ["-jpeg", "-r", String(dpi), "-f", String(first), "-l", String(last), "-jpegopt", `quality=${Math.max(1, Math.min(100, quality))}`, inputPath, prefix] : ["-png", "-r", String(dpi), "-f", String(first), "-l", String(last), inputPath, prefix];
    await execFileAsync("pdftoppm", args, { timeout: 60_000, maxBuffer: 1024 * 1024, signal }); const selectedSet = new Set(selected); const pageEntries = (await readdir(path)).map((file) => ({ file, page: Number(file.match(/^page-(\d+)\.(?:png|jpg)$/)?.[1] ?? 0) - 1 })).filter(({ file, page }) => page >= 0 && selectedSet.has(page) && (file.endsWith(".png") || file.endsWith(".jpg"))).sort((left, right) => selected.indexOf(left.page) - selected.indexOf(right.page)); if (!pageEntries.length) throw new Error("PDF renderer returned no pages.");
    const outputs = await Promise.all(pageEntries.map(async ({ file }) => { const source = await fs.readFile(`${path}/${file}`); return format === "webp" ? sharp(source).webp({ quality }).toBuffer() : source; })); const extension = format === "jpg" ? "jpg" : format; const mime = format === "jpg" ? "image/jpeg" : `image/${format}`; const base = safeBaseName(name).replace(/\.[^.]+$/, "");
    if (String(options.longImage ?? "false") === "true") { const metadata = await Promise.all(outputs.map((output) => sharp(output).metadata())); const width = Math.max(...metadata.map((item) => item.width ?? 0)); const height = metadata.reduce((total, item) => total + (item.height ?? 0), 0); if (!width || !height || width * height > configuredPixelLimit()) throw new Error("The long image exceeds the decoded pixel limit; choose a smaller DPI or page range."); let canvas = sharp({ create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } }); let top = 0; const layers = metadata.map((item, index) => { const layer = { input: outputs[index], left: 0, top }; top += item.height ?? 0; return layer; }); canvas = canvas.composite(layers); if (format === "jpg") canvas = canvas.jpeg({ quality: Math.max(1, Math.min(100, quality)), mozjpeg: true }); else if (format === "webp") canvas = canvas.webp({ quality }); else canvas = canvas.png({ compressionLevel: 9 }); return { buffer: await canvas.toBuffer(), filename: `${base}-long.${extension}`, mime, format }; }
    if (outputs.length === 1) return { buffer: outputs[0], filename: `${base}.${extension}`, mime, format };
    const zip = new JSZip(); outputs.forEach((output, index) => zip.file(`page-${String(index + 1).padStart(3, "0")}.${extension}`, output)); return { buffer: Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })), filename: `${base}-${format}.zip`, mime: "application/zip", format: "zip" };
  } catch (error) { const detail = error instanceof Error ? error.message.split("\n")[0] : "PDF renderer failed"; throw new Error(`PDF rendering is unavailable or failed: ${detail}`); } finally { await fs.rm(path, { recursive: true, force: true }); }
}

async function compareRenderedPages(leftInput: Buffer, leftName: string, rightInput: Buffer, rightName: string, signal?: AbortSignal): Promise<string[]> {
  const [leftOutput, rightOutput] = await Promise.all([renderPdf(leftInput, leftName, "png", 82, signal, { dpi: 72 }), renderPdf(rightInput, rightName, "png", 82, signal, { dpi: 72 })]);
  async function pages(output: OutputFile): Promise<Buffer[]> {
    if (output.format !== "zip") return [output.buffer];
    const archive = await JSZip.loadAsync(output.buffer); const entries = Object.values(archive.files).filter((entry) => !entry.dir).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return Promise.all(entries.map(async (entry) => Buffer.from(await entry.async("uint8array"))));
  }
  const leftPages = await pages(leftOutput); const rightPages = await pages(rightOutput); const compared = Math.min(leftPages.length, rightPages.length); let changedPixels = 0; let totalPixels = 0; let dimensionMismatches = 0;
  for (let index = 0; index < compared; index += 1) {
    if (signal?.aborted) throw new Error("PDF visual comparison was cancelled.");
    const [leftRaw, rightRaw] = await Promise.all([sharp(leftPages[index]).ensureAlpha().raw().toBuffer({ resolveWithObject: true }), sharp(rightPages[index]).ensureAlpha().raw().toBuffer({ resolveWithObject: true })]);
    if (leftRaw.info.width !== rightRaw.info.width || leftRaw.info.height !== rightRaw.info.height) { dimensionMismatches += 1; continue; }
    const pixels = leftRaw.info.width * leftRaw.info.height; totalPixels += pixels; for (let offset = 0; offset < pixels * 4; offset += 4) if (Math.abs(leftRaw.data[offset] - rightRaw.data[offset]) > 12 || Math.abs(leftRaw.data[offset + 1] - rightRaw.data[offset + 1]) > 12 || Math.abs(leftRaw.data[offset + 2] - rightRaw.data[offset + 2]) > 12) changedPixels += 1;
  }
  return [`visualComparison: run at 72 DPI`, `visualPagesCompared: ${compared}`, `visualPageCountMismatch: ${leftPages.length === rightPages.length ? "no" : `A=${leftPages.length},B=${rightPages.length}`}`, `visualDimensionMismatches: ${dimensionMismatches}`, `visualChangedPixels: ${changedPixels}/${totalPixels}${totalPixels ? ` (${(changedPixels / totalPixels * 100).toFixed(2)}%)` : ""}`];
}

export async function extractPdfText(input: Buffer, name: string, signal?: AbortSignal): Promise<OutputFile> {
  const fs = await import("node:fs/promises"); const os = await import("node:os"); const path = await fs.mkdtemp(`${os.tmpdir()}/hxsl-text-`); const inputPath = `${path}/input.pdf`; const outputPath = `${path}/output.txt`; await fs.writeFile(inputPath, input, { mode: 0o600 }); try { await execFileAsync("pdftotext", ["-enc", "UTF-8", inputPath, outputPath], { timeout: 30_000, maxBuffer: 1024 * 1024, signal }); return { buffer: await fs.readFile(outputPath), filename: `${safeBaseName(name).replace(/\.[^.]+$/, "")}.txt`, mime: "text/plain; charset=utf-8", format: "txt" }; } catch (error) { const detail = error instanceof Error ? error.message.split("\n")[0] : "text extraction failed"; throw new Error(`PDF text extraction is unavailable or failed: ${detail}`); } finally { await fs.rm(path, { recursive: true, force: true }); }
}
