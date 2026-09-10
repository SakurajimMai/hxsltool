import type { Locale } from "@hxsl/tool-registry";
import { getPublicTools, getPublicToolDescription, getPublicToolName } from "./public-config";

export type ToolSearchEntry = { id: string; href: string; category: string; name: string; englishName: string; description: string; inputFormats: string[]; outputFormats: string[]; keywords: string[]; processingMode: "local" | "server" | "hybrid" };
const aliases: Record<string, string[]> = {
  "pdf.compress-pdf": ["compress pdf", "compresspdf", "压缩pdf", "pdf kleiner", "comprimir pdf"],
  "image.image-compressor": ["compress image", "images smaller", "图片压缩", "comprimir imagen", "bilder komprimieren"],
  "svg.png-to-svg": ["png to svg", "png转svg", "raster vector", "vectorize png", "画像をsvg"],
  "pdf.png-to-pdf": ["png to pdf", "图片转pdf", "image to pdf", "jpg to pdf"],
  "svg.svg-to-favicon": ["favicon", "website icon", "网站图标", "favicon generator"],
  "icons.icon-pack": ["icon pack", "ico", "android icon", "pwa icon", "favicon"],
  "pdf.merge-pdf": ["merge pdf", "combine pdf", "合并pdf", "pdf zusammenfügen"],
  "image.png-to-webp": ["png to webp", "png转webp", "convert png"],
};

export function getToolSearchEntries(locale: Locale): ToolSearchEntry[] {
  const english = new Map(getPublicTools("en").map((tool) => [tool.id, tool]));
  const tools = getPublicTools(locale).map((tool) => {
    const source = english.get(tool.id) ?? tool;
    return {
      id: tool.id,
      href: `/${locale}/${tool.category}/${tool.slug}`,
      category: tool.category,
      processingMode: tool.processingMode,
      name: getPublicToolName(locale, tool),
      englishName: source.name,
      description: getPublicToolDescription(locale, tool),
      inputFormats: tool.inputFormats,
      outputFormats: tool.outputFormats,
      keywords: [...(aliases[tool.id] ?? []), ...tool.publicOperational.aliases],
    };
  });
  return tools;
}
