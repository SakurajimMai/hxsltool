export const LOCALES = ["en", "zh-CN", "zh-TW", "es", "pt-BR", "de", "fr", "ja", "ko", "it", "tr", "vi", "nl", "pl", "th"] as const;
export type Locale = (typeof LOCALES)[number];
function imageFormatName(format: string) { return format === "jpeg" || format === "jpg" ? "JPG" : format === "webp" ? "WebP" : format.toUpperCase(); }
export type ToolCategory = "pdf" | "image" | "svg" | "icons";
export type ProcessingMode = "local" | "server" | "hybrid";
export type ImplementationStatus = "planned" | "implemented" | "verified" | "blocked";

export type ToolOption = {
  key: string;
  label: string;
  type: "select" | "number" | "text" | "boolean";
  defaultValue?: string | number | boolean;
  choices?: string[];
  sensitive?: boolean;
};

export type Tool = {
  id: string;
  category: ToolCategory;
  slug: string;
  adapterId: string;
  name: string;
  shortDescription: string;
  inputFormats: string[];
  outputFormats: string[];
  processingMode: ProcessingMode;
  limits: { maxFiles?: number; maxMb?: number; maxPages?: number; maxPixels?: number };
  optionSchema: ToolOption[];
  relatedTools: string[];
  enabled: boolean;
  implementationStatus: ImplementationStatus;
  supportedLocales: Locale[];
  contentStatus: Record<Locale, "complete" | "draft" | "missing">;
  qualityNotes: string;
  sourceReferences: string[];
};

const allLocales = Object.fromEntries(LOCALES.map((locale) => [locale, "complete"])) as Tool["contentStatus"];
const pdfOptions: ToolOption[] = [{ key: "pages", label: "Page range", type: "text", defaultValue: "all" }];
const pdfRenderOptions: ToolOption[] = [{ key: "pages", label: "Page range", type: "text", defaultValue: "all" }, { key: "quality", label: "Quality", type: "number", defaultValue: 82 }, { key: "dpi", label: "Resolution (DPI)", type: "number", defaultValue: 144 }, { key: "longImage", label: "Create one long image", type: "boolean", defaultValue: false }];
const imagePdfOptions: ToolOption[] = [{ key: "paper", label: "Paper", type: "select", defaultValue: "a4", choices: ["a4", "letter", "image"] }, { key: "orientation", label: "Orientation", type: "select", defaultValue: "portrait", choices: ["portrait", "landscape"] }, { key: "margin", label: "Margin (pt)", type: "number", defaultValue: 24 }, { key: "fit", label: "Fit", type: "select", defaultValue: "contain", choices: ["contain", "cover"] }, { key: "background", label: "Background color", type: "text", defaultValue: "#ffffff" }];
const frameOption: ToolOption = { key: "frame", label: "Frame (1 = first)", type: "number", defaultValue: 1 };
const positionOption: ToolOption = { key: "position", label: "Position", type: "select", defaultValue: "bottom-right", choices: ["top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right"] };
const pdfSecurityOptions: Record<string, ToolOption[]> = {
  "sign-pdf": [{ key: "signature", label: "Signature text", type: "text", defaultValue: "" }, pdfOptions[0]],
  "compare-pdf": [{ key: "visual", label: "Visual page diff", type: "boolean", defaultValue: false }],
  "unlock-pdf": [{ key: "password", label: "PDF password", type: "text", sensitive: true }],
  "protect-pdf": [{ key: "password", label: "New PDF password", type: "text", sensitive: true }],
  "pdf-ocr": [{ key: "language", label: "OCR language(s)", type: "text", defaultValue: "eng" }],
  "redact-pdf": [{ key: "terms", label: "Terms to remove (comma separated)", type: "text" }],
};
const pdfEditOptions: Record<string, ToolOption[]> = {
  "watermark-pdf": [pdfOptions[0], { key: "text", label: "Watermark text", type: "text", defaultValue: "HXSL Tools" }, { key: "size", label: "Text size", type: "number", defaultValue: 24 }, positionOption, { key: "rotation", label: "Rotation", type: "number", defaultValue: 0 }, { key: "opacity", label: "Opacity", type: "number", defaultValue: 0.35 }],
  "page-numbers-pdf": [pdfOptions[0], { key: "start", label: "Start number", type: "number", defaultValue: 1 }, { key: "format", label: "Page number format ({page} supported)", type: "text", defaultValue: "{page}" }, { key: "size", label: "Text size", type: "number", defaultValue: 10 }, positionOption],
  "metadata-pdf": [{ key: "title", label: "Title", type: "text" }, { key: "author", label: "Author", type: "text" }, { key: "subject", label: "Subject", type: "text" }, { key: "keywords", label: "Keywords", type: "text" }],
  "crop-pdf": [pdfOptions[0], { key: "inset", label: "Crop inset (pt)", type: "number", defaultValue: 18 }],
  "resize-pdf": [{ key: "paper", label: "Page preset", type: "select", defaultValue: "a4", choices: ["a4", "letter", "custom"] }, { key: "width", label: "Page width (pt)", type: "number", defaultValue: 595.28 }, { key: "height", label: "Page height (pt)", type: "number", defaultValue: 841.89 }],
  "header-footer-pdf": [pdfOptions[0], { key: "header", label: "Header ({page} supported)", type: "text" }, { key: "footer", label: "Footer ({page} supported)", type: "text" }, { key: "size", label: "Text size", type: "number", defaultValue: 10 }],
};
const imageOptions: ToolOption[] = [
  { key: "quality", label: "Quality", type: "number", defaultValue: 82 },
  { key: "width", label: "Width", type: "number" },
  { key: "height", label: "Height", type: "number" },
];
const backgroundOption: ToolOption = { key: "background", label: "Background color", type: "text", defaultValue: "#ffffff" };
const imageToolOptions: Record<string, ToolOption[]> = {
  "crop-image": imageOptions,
  "rotate-image": [...imageOptions, { key: "rotate", label: "Rotation", type: "select", defaultValue: "90", choices: ["90", "180", "270"] }, { key: "flip", label: "Flip", type: "select", defaultValue: "none", choices: ["none", "horizontal", "vertical"] }],
  "image-background": [...imageOptions, backgroundOption],
  "png-to-jpg": [...imageOptions, backgroundOption],
  "webp-to-jpg": [...imageOptions, backgroundOption],
  "avif-to-jpg": [...imageOptions, backgroundOption],
};
const svgToolOptions: Record<string, ToolOption[]> = {
  "svg-color-editor": [{ key: "color", label: "Replacement color", type: "text", defaultValue: "#155e52" }],
  "svg-palette-swapper": [{ key: "palette", label: "Palette", type: "select", defaultValue: "original", choices: ["original", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] }],
  "svg-to-png": [{ key: "width", label: "Width", type: "number" }, { key: "height", label: "Height", type: "number" }, { key: "scale", label: "Scale", type: "select", defaultValue: "1", choices: ["1", "2", "3", "4"] }],
  "svg-to-webp": [{ key: "width", label: "Width", type: "number" }, { key: "height", label: "Height", type: "number" }, { key: "scale", label: "Scale", type: "select", defaultValue: "1", choices: ["1", "2", "3", "4"] }],
  "svg-qr-code": [{ key: "text", label: "QR content", type: "text", defaultValue: "https://hxsl.org" }, { key: "errorCorrection", label: "Error correction", type: "select", defaultValue: "M", choices: ["L", "M", "Q", "H"] }],
};
const iconToolOptions: ToolOption[] = [
  { key: "fit", label: "Fit", type: "select", defaultValue: "contain", choices: ["contain", "cover"] },
  { key: "padding", label: "Padding", type: "number", defaultValue: 10 },
  { key: "background", label: "Background color", type: "text", defaultValue: "#ffffff" },
];

function makeTool(input: Omit<Tool, "contentStatus" | "supportedLocales" | "enabled" | "implementationStatus" | "optionSchema" | "qualityNotes"> & Partial<Pick<Tool, "qualityNotes" | "optionSchema">>): Tool {
  return {
    ...input,
    enabled: true,
    implementationStatus: "implemented",
    supportedLocales: [...LOCALES],
    contentStatus: allLocales,
    optionSchema: input.optionSchema ?? [],
    qualityNotes: input.qualityNotes ?? "Runs in the browser where the codec is available; the output is checked before download.",
  };
}

const pdfPages: Array<[string, string, string, string]> = [
  ["merge-pdf", "Merge PDF", "Combine PDFs in a chosen order.", "PDF"],
  ["split-pdf", "Split PDF", "Split a document by pages, ranges, or groups.", "PDF"],
  ["rotate-pdf", "Rotate PDF", "Rotate selected pages by 90, 180, or 270 degrees.", "PDF"],
  ["reorder-pages", "Reorder Pages", "Move selected pages into a new order.", "PDF"],
  ["extract-pages", "Extract Pages", "Create a PDF from selected pages and ranges.", "PDF"],
  ["delete-pages", "Delete Pages", "Remove selected pages without producing an empty PDF.", "PDF"],
  ["reverse-pdf", "Reverse PDF", "Turn the page order around in one step.", "PDF"],
  ["duplicate-pages", "Duplicate Pages", "Repeat selected pages at a chosen position.", "PDF"],
];
const pdfConversions: Array<[string, string, string, string, string[]]> = [
  ["pdf-to-png", "PDF to PNG", "Render pages as PNG files with ZIP and long-image output.", "PDF", ["PNG", "ZIP"]],
  ["pdf-to-jpg", "PDF to JPG", "Render pages as JPG files with quality and ZIP controls.", "PDF", ["JPG", "ZIP"]],
  ["pdf-to-webp", "PDF to WebP", "Render pages as WebP files with quality and ZIP controls.", "PDF", ["WebP", "ZIP"]],
  ["png-to-pdf", "PNG to PDF", "Place one or more PNG images on configurable pages.", "PNG", ["PDF"]],
  ["jpg-to-pdf", "JPG to PDF", "Place one or more JPG images on configurable pages.", "JPG", ["PDF"]],
  ["webp-to-pdf", "WebP to PDF", "Place WebP images on configurable PDF pages.", "WebP", ["PDF"]],
  ["pdf-to-text", "PDF to Text", "Extract a text file from selectable PDF text.", "PDF", ["TXT"]],
  ["bmp-to-pdf", "BMP to PDF", "Place BMP images into a PDF.", "BMP", ["PDF"]],
  ["gif-to-pdf", "GIF to PDF", "Use the first GIF frame or an explicitly selected frame.", "GIF", ["PDF"]],
  ["svg-to-pdf", "SVG to PDF", "Convert supported SVG paths into a PDF.", "SVG", ["PDF"]],
  ["pdf-to-docx", "PDF to Word", "Rebuild basic selectable text and paragraphs as DOCX.", "PDF", ["DOCX"]],
  ["pdf-to-xlsx", "PDF to Excel", "Rebuild selectable lines and delimiters as real XLSX cells; table detection is limited.", "PDF", ["XLSX"]],
  ["pdf-to-pptx", "PDF to PowerPoint", "Rebuild selectable PDF text into a basic editable PPTX text slide.", "PDF", ["PPTX"]],
  ["docx-to-pdf", "Word to PDF", "Convert DOC, DOCX and Word documents with LibreOffice.", "DOCX", ["PDF"]],
  ["xlsx-to-pdf", "Excel to PDF", "Convert spreadsheets with a headless office engine.", "XLSX", ["PDF"]],
  ["pptx-to-pdf", "PowerPoint to PDF", "Convert presentations with a headless office engine.", "PPTX", ["PDF"]],
];
const pdfEditing: Array<[string, string, string]> = [
  ["compress-pdf", "Compress PDF", "Choose structural optimization or server-side lossy image recompression."],
  ["watermark-pdf", "Add Watermark", "Add positioned, rotated text watermarks to chosen pages."],
  ["page-numbers-pdf", "Add Page Numbers", "Add formatted page numbers with a start value and page range."],
  ["metadata-pdf", "Edit Metadata", "Edit title, author, subject and keyword metadata."],
  ["crop-pdf", "Crop PDF", "Change the visible page box without claiming content removal."],
  ["flatten-pdf", "Flatten PDF", "Flatten supported form fields and annotations with limits stated."],
  ["header-footer-pdf", "Header & Footer", "Add a header or footer with page-aware placeholders."],
  ["resize-pdf", "Resize PDF", "Change the page canvas to a preset or custom size; content is not scaled."],
];
const pdfSecurity: Array<[string, string, string]> = [
  ["sign-pdf", "Sign PDF", "Place a drawn, typed, or image appearance signature."],
  ["unlock-pdf", "Unlock PDF", "Decrypt a PDF with a password supplied by an authorized user."],
  ["protect-pdf", "Protect PDF", "Encrypt a PDF with a password and explicit permissions."],
  ["compare-pdf", "Compare PDF", "Compare selectable text and optionally rendered pages."],
  ["redact-pdf", "Redact PDF", "Permanently rebuild pixels in marked regions so source text is not retained."],
  ["pdf-ocr", "PDF OCR", "Recognize scans and export a ZIP containing TXT plus a searchable PDF text layer."],
  ["sanitize-pdf", "Sanitize PDF", "Create a clean PDF copy with metadata reset; unsupported active content is not claimed to be fully removed."],
  ["verify-pdf", "Verify PDF", "Report structure, encryption, signature, trust and revocation as separate states."],
];
const compressionOptions: ToolOption[] = [{ key: "mode", label: "Compression mode", type: "select", defaultValue: "structural", choices: ["structural", "lossy"] }];

export const tools: Tool[] = [
  ...pdfPages.map(([slug, name, description, input]) => makeTool({ id: `pdf.${slug}`, category: "pdf", slug, adapterId: slug, name, shortDescription: description, inputFormats: [input], outputFormats: [slug === "split-pdf" ? "ZIP" : "PDF"], processingMode: "local", limits: { maxFiles: slug === "merge-pdf" ? 20 : 1, maxMb: 50, maxPages: 300 }, relatedTools: ["pdf.merge-pdf", "pdf.compress-pdf"], sourceReferences: ["https://pdfuck.com/"], optionSchema: slug === "reorder-pages" ? [{ key: "order", label: "Page order (for example 2,1,3)", type: "text" }] : slug === "duplicate-pages" ? [{ key: "pages", label: "Pages to duplicate", type: "text", defaultValue: "all" }, { key: "times", label: "Repeats", type: "number", defaultValue: 1 }, { key: "position", label: "Insert position", type: "number", defaultValue: 0 }] : pdfOptions })),
  ...pdfConversions.map(([slug, name, description, input, outputs]) => makeTool({ id: `pdf.${slug}`, category: "pdf", slug, adapterId: slug, name, shortDescription: description, inputFormats: [input], outputFormats: outputs, processingMode: ["docx-to-pdf", "xlsx-to-pdf", "pptx-to-pdf"].includes(slug) ? "server" : "hybrid", limits: { maxFiles: ["png-to-pdf", "jpg-to-pdf", "webp-to-pdf", "bmp-to-pdf", "gif-to-pdf"].includes(slug) ? 20 : 1, maxMb: 50, maxPages: 300, maxPixels: ["png-to-pdf", "jpg-to-pdf", "webp-to-pdf", "bmp-to-pdf", "gif-to-pdf"].includes(slug) ? 40_000_000 : undefined }, relatedTools: ["pdf.merge-pdf", "pdf.compress-pdf"], sourceReferences: ["https://pdfuck.com/"], optionSchema: ["pdf-to-png", "pdf-to-jpg", "pdf-to-webp"].includes(slug) ? pdfRenderOptions : ["png-to-pdf", "jpg-to-pdf", "webp-to-pdf", "bmp-to-pdf", "gif-to-pdf"].includes(slug) ? slug === "gif-to-pdf" ? [...imagePdfOptions, frameOption] : imagePdfOptions : pdfOptions })),
  ...pdfEditing.map(([slug, name, description]) => makeTool({ id: `pdf.${slug}`, category: "pdf", slug, adapterId: slug, name, shortDescription: description, inputFormats: ["PDF"], outputFormats: ["PDF"], processingMode: slug === "compress-pdf" ? "hybrid" : "local", limits: { maxFiles: 1, maxMb: 50, maxPages: 300 }, relatedTools: ["pdf.merge-pdf", "pdf.verify-pdf"], sourceReferences: ["https://pdfuck.com/"], optionSchema: slug === "compress-pdf" ? compressionOptions : pdfEditOptions[slug] ?? pdfOptions })),
  ...pdfSecurity.map(([slug, name, description]) => makeTool({ id: `pdf.${slug}`, category: "pdf", slug, adapterId: slug, name, shortDescription: description, inputFormats: ["PDF"], outputFormats: slug === "pdf-ocr" ? ["ZIP"] : ["compare-pdf", "verify-pdf"].includes(slug) ? ["TXT"] : ["PDF"], processingMode: ["pdf-ocr", "unlock-pdf", "protect-pdf", "verify-pdf"].includes(slug) ? "server" : "hybrid", limits: { maxFiles: slug === "compare-pdf" ? 2 : 1, maxMb: 50, maxPages: 300 }, relatedTools: ["pdf.sanitize-pdf", "pdf.verify-pdf"], sourceReferences: ["https://pdfuck.com/"], optionSchema: pdfSecurityOptions[slug] ?? pdfOptions })),
  ...[
    ["png-to-svg", "PNG to SVG", "Rebuild raster color regions as real SVG paths."],
    ["jpg-to-svg", "JPG to SVG", "Rebuild JPG color regions as real SVG paths."],
    ["webp-to-svg", "WebP to SVG", "Rebuild WebP color regions as real SVG paths."],
    ["gif-to-svg", "GIF to SVG", "Vectorize a selected GIF frame explicitly."],
    ["avif-to-svg", "AVIF to SVG", "Vectorize AVIF color regions as real SVG paths."],
    ["tiff-to-svg", "TIFF to SVG", "Vectorize a selected TIFF page explicitly."],
    ["bmp-to-svg", "BMP to SVG", "Rebuild BMP color regions as real SVG paths."],
    ["svg-color-editor", "SVG Color Editor", "Inspect supported fill and stroke colors and edit them."],
    ["svg-palette-swapper", "SVG Palette Swapper", "Preview and undo swaps across ten original palettes."],
    ["svg-optimizer", "SVG Optimizer", "Optimize SVG while preserving required references and viewBox."],
    ["svg-to-png", "SVG to PNG", "Rasterize SVG at a custom size or 1x to 4x scale."],
    ["svg-to-webp", "SVG to WebP", "Rasterize SVG into a WebP image."],
    ["svg-to-dxf", "SVG to DXF", "Export supported paths as a parseable DXF with stated units."],
    ["png-to-dxf", "PNG to DXF", "Vectorize then export supported paths as DXF."],
    ["jpg-to-dxf", "JPG to DXF", "Vectorize then export supported paths as DXF."],
    ["svg-to-react", "SVG to React", "Convert safe SVG XML into compilable JSX or TSX."],
    ["svg-to-base64", "SVG to Base64", "Create a data URI and copy it safely."],
    ["svg-to-favicon", "SVG to Favicon", "Create favicon assets from source SVG geometry."],
    ["svg-to-dst", "SVG to DST", "Export a limited outline running-stitch design with preview."],
    ["svg-pattern-maker", "SVG Pattern Maker", "Create original repeated geometric SVG patterns."],
    ["svg-qr-code", "SVG QR Code", "Generate a scannable QR code with basic error correction."],
  ].map(([slug, name, description]) => makeTool({ id: `svg.${slug}`, category: "svg", slug, adapterId: slug, name, shortDescription: description, inputFormats: slug === "svg-qr-code" || slug === "svg-pattern-maker" ? ["Text"] : [slug.split("-")[0].toUpperCase() === "JPG" ? "JPG" : slug.split("-")[0].toUpperCase()], outputFormats: slug === "svg-to-favicon" ? ["ZIP"] : slug === "svg-to-png" ? ["PNG"] : slug === "svg-to-webp" ? ["WebP"] : slug === "svg-to-dxf" || slug.endsWith("-to-dxf") ? ["DXF"] : slug === "svg-to-react" ? ["TSX"] : slug === "svg-to-base64" ? ["TXT"] : slug === "svg-to-dst" ? ["DST"] : ["SVG"], processingMode: slug === "tiff-to-svg" ? "server" : ["svg-to-png", "svg-to-webp"].includes(slug) ? "local" : "hybrid", limits: { maxFiles: 10, maxMb: 8, maxPixels: 40_000_000 }, relatedTools: slug === "svg-to-favicon" ? ["svg.svg-optimizer", "icons.icon-pack"] : ["svg.svg-optimizer", "svg.svg-to-favicon"], optionSchema: ["gif-to-svg", "tiff-to-svg"].includes(slug) ? [frameOption] : svgToolOptions[slug] ?? [], sourceReferences: ["https://svgcreator.com/"] })),
  ...[
    ["compress-png", "Compress PNG", "Compress PNG losslessly and report the real size change."],
    ["compress-jpeg", "Compress JPEG", "Compress JPEG and report the real size change."],
    ["compress-webp", "Compress WebP", "Compress WebP with format-specific quality."],
    ["compress-avif", "Compress AVIF", "Compress AVIF where the browser codec supports encoding."],
    ["image-compressor", "Image Compressor", "Process a bounded batch with independent file statuses."],
    ["png-to-jpg", "PNG to JPG", "Convert PNG transparency using a chosen background."],
    ["jpg-to-png", "JPG to PNG", "Convert JPG to PNG without changing pixels silently."],
    ["png-to-webp", "PNG to WebP", "Convert PNG to WebP with alpha support."],
    ["jpg-to-webp", "JPG to WebP", "Convert JPG to WebP with quality control."],
    ["webp-to-png", "WebP to PNG", "Convert WebP to PNG."],
    ["webp-to-jpg", "WebP to JPG", "Convert WebP to JPG with a background option."],
    ["png-to-avif", "PNG to AVIF", "Convert PNG to AVIF when encoding is supported."],
    ["jpg-to-avif", "JPG to AVIF", "Convert JPG to AVIF when encoding is supported."],
    ["avif-to-png", "AVIF to PNG", "Decode AVIF and export PNG."],
    ["avif-to-jpg", "AVIF to JPG", "Decode AVIF and export JPG."],
    ["resize-image", "Resize Image", "Resize with pixel limits and no unexpected upscaling."],
    ["crop-image", "Crop Image", "Crop to a chosen region and preserve orientation."],
    ["rotate-image", "Rotate Image", "Rotate and apply the image orientation correctly."],
    ["image-background", "Image Background", "Place transparent pixels on a chosen background."],
    ["strip-exif", "Remove EXIF", "Remove location and other metadata before export."],
  ].map(([slug, name, description]) => makeTool({ id: `image.${slug}`, category: "image", slug, adapterId: slug, name, shortDescription: description, inputFormats: slug.includes("-to-") ? [imageFormatName(slug.split("-to-")[0])] : slug.startsWith("compress-") ? [imageFormatName(slug.slice(9))] : ["PNG", "JPG", "WebP", "AVIF"], outputFormats: slug.includes("-to-") ? [imageFormatName(slug.split("-to-")[1])] : slug.startsWith("compress-") ? [imageFormatName(slug.slice(9))] : ["PNG", "JPG", "WebP", "AVIF"], processingMode: "local", limits: { maxFiles: 100, maxMb: 8, maxPixels: 40_000_000 }, relatedTools: ["image.image-compressor", "image.png-to-webp", "svg.png-to-svg"], optionSchema: imageToolOptions[slug] ?? imageOptions, sourceReferences: ["https://pipic.cc/"] })),
  makeTool({ id: "icons.icon-pack", category: "icons", slug: "icon-pack", adapterId: "icon-pack", name: "Icon Resource Pack", shortDescription: "Build ICO, favicon, PWA and Android launcher resources from PNG, JPG or SVG with visible fit, padding and background controls.", inputFormats: ["PNG", "JPG", "SVG"], outputFormats: ["ICO", "PNG", "ZIP"], processingMode: "local", limits: { maxFiles: 1, maxMb: 8, maxPixels: 40_000_000 }, relatedTools: ["svg.svg-to-favicon", "image.resize-image"], optionSchema: iconToolOptions, sourceReferences: ["https://developer.android.com/develop/ui/compose/system/icon_design_adaptive"] }),
];

const verifiedToolIds = new Set(["pdf.merge-pdf", "pdf.split-pdf", "pdf.reverse-pdf", "pdf.reorder-pages", "pdf.extract-pages", "pdf.crop-pdf", "pdf.sign-pdf", "svg.png-to-dxf", "pdf.svg-to-pdf", "svg.tiff-to-svg", "icons.icon-pack"]);
for (const tool of tools) if (verifiedToolIds.has(tool.id)) tool.implementationStatus = "verified";

export const toolsById = new Map(tools.map((tool) => [tool.id, tool]));
export const toolsBySlug = new Map(tools.map((tool) => [`${tool.category}/${tool.slug}`, tool]));
export const categoryNames: Record<ToolCategory, string> = { pdf: "PDF Tools", image: "Image Tools", svg: "SVG Tools", icons: "Icon Tools" };
export const categoryDescriptions: Record<ToolCategory, string> = {
  pdf: "Make precise PDF changes in your browser or with an explicit server task.",
  image: "Compress and convert images with honest sizes, format checks, and batch controls.",
  svg: "Create, clean, vectorize, and export SVG with safe parsing and real geometry.",
  icons: "Export web and Android icon resources with dimensions, previews, and packaging.",
};

export function getPublishedTools(locale: Locale): Tool[] {
  return tools.filter((tool) => tool.enabled && tool.contentStatus[locale] === "complete");
}

export function getTool(category: string, slug: string): Tool | undefined {
  return toolsBySlug.get(`${category}/${slug}`);
}
