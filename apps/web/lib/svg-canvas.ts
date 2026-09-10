import { SvgInputError } from "./svg-errors";
import { svgIntrinsicSize } from "./svg-dimensions";

/** Caller supplies cleanSvg output. The SVG is an isolated image, never inline DOM. */
export async function decodeSvgImage(clean: string, maxPixels = 40_000_000) {
  const doc = new DOMParser().parseFromString(clean, "image/svg+xml"), root = doc.documentElement;
  if (doc.querySelector("parsererror") || root.localName !== "svg" || root.namespaceURI !== "http://www.w3.org/2000/svg") throw new SvgInputError("invalid");
  const size = svgIntrinsicSize(root.getAttribute("width"), root.getAttribute("height"), root.getAttribute("viewBox"), maxPixels);
  root.setAttribute("width", String(size.width)); root.setAttribute("height", String(size.height));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)], { type: "image/svg+xml" }));
  const image = new Image(); let timer: ReturnType<typeof setTimeout> | undefined, closed = false;
  const close = () => { if (closed) return; closed = true; image.removeAttribute("src"); URL.revokeObjectURL(url); };
  try {
    image.src = url;
    await Promise.race([image.decode(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new SvgInputError("timeout")), 10000); })]);
    if (!image.naturalWidth || !image.naturalHeight) throw new SvgInputError("invalid");
    return { source: image, ...size, close };
  } catch (error) { close(); throw error instanceof SvgInputError ? error : new SvgInputError("invalid"); } finally { if (timer) clearTimeout(timer); }
}
