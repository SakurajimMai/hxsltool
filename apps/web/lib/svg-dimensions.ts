import { SvgInputError } from "./svg-errors";
export type ImageSize = { width: number; height: number };
export function checkImageSize(width: number, height: number, maxPixels = 40_000_000): ImageSize {
  if (![width, height].every(n => Number.isFinite(n) && n > 0 && n <= 16384) || width * height > maxPixels) throw new SvgInputError("dimensions", maxPixels);
  return { width, height };
}
function length(value: string | null): number | undefined {
  if (!value || value === "auto" || /^\d+(?:\.\d+)?%$/.test(value)) return undefined;
  const match = value.trim().match(/^(\d*\.?\d+)(px|pt|pc|in|cm|mm|q)?$/i);
  if (!match) throw new SvgInputError("invalid");
  const factor: Record<string, number> = { px: 1, pt: 96 / 72, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6 };
  return Number(match[1]) * factor[(match[2] || "px").toLowerCase()];
}
export function svgIntrinsicSize(width: string | null, height: string | null, viewBox: string | null, maxPixels = 40_000_000): ImageSize {
  const box = viewBox?.trim().split(/[\s,]+/).map(Number);
  if (box && (box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0)) throw new SvgInputError("invalid");
  let w = length(width), h = length(height);
  if (w === undefined) w = box ? h === undefined ? box[2] : h * box[2] / box[3] : 300;
  if (h === undefined) h = box ? w * box[3] / box[2] : 150;
  return checkImageSize(w, h, maxPixels);
}
export function svgOutputSize(source: ImageSize, width?: number, height?: number, scale = 1, maxPixels = 40_000_000): ImageSize {
  checkImageSize(source.width, source.height, maxPixels);
  if (!Number.isInteger(scale) || scale < 1 || scale > 4) throw new SvgInputError("invalid");
  if (width !== undefined && (!Number.isInteger(width) || width <= 0) || height !== undefined && (!Number.isInteger(height) || height <= 0)) throw new SvgInputError("invalid");
  const w = width ?? (height === undefined ? source.width : height * source.width / source.height);
  const h = height ?? (width === undefined ? source.height : width * source.height / source.width);
  return checkImageSize(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), maxPixels);
}
export function vectorSampleSize(source: ImageSize): ImageSize {
  checkImageSize(source.width, source.height);
  const factor = Math.min(1, 96 / Math.max(source.width, source.height));
  return { width: Math.max(1, Math.round(source.width * factor)), height: Math.max(1, Math.round(source.height * factor)) };
}

/** Pixel-region vector approximation; alpha and original aspect ratio are retained. */
export function pixelRegionsSvg(pixels: Uint8ClampedArray, sample: ImageSize, original: ImageSize): string {
  checkImageSize(original.width, original.height); checkImageSize(sample.width, sample.height, 96 * 96);
  if (![sample.width, sample.height].every(n => Number.isInteger(n) && n <= 96) || pixels.length !== sample.width * sample.height * 4) throw new Error("Invalid vector sample.");
  const shapes: string[] = [];
  // Merge identical horizontal pixels into one region. No bitmap embedding.
  for (let y = 0; y < sample.height; y++) for (let x = 0; x < sample.width;) {
    const i = (y * sample.width + x) * 4; let end = x + 1;
    while (end < sample.width) { const next = (y * sample.width + end) * 4; if (![0, 1, 2, 3].every(c => pixels[next + c] === pixels[i + c])) break; end++; }
    if (pixels[i + 3] > 0) shapes.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="rgb(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]})"${pixels[i + 3] < 255 ? ` fill-opacity="${pixels[i + 3] / 255}"` : ""}/>`);
    x = end;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${original.width}" height="${original.height}" viewBox="0 0 ${original.width} ${original.height}"><g shape-rendering="crispEdges" transform="scale(${original.width / sample.width} ${original.height / sample.height})">${shapes.join("")}</g></svg>`;
}
