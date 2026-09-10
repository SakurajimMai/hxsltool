import { siteConfig } from "../../../config/site";
import { getPublicTools } from "./public-config";

export function llmsTxt(): string {
  const origin = siteConfig.url;
  const tools = getPublicTools("en");
  const byCategory = {
    pdf: tools.filter((tool) => tool.category === "pdf"),
    image: tools.filter((tool) => tool.category === "image"),
    svg: tools.filter((tool) => tool.category === "svg"),
    icons: tools.filter((tool) => tool.category === "icons"),
  };
  const lines = [
    `# ${siteConfig.name}`,
    "> Browser-first PDF, image, SVG and icon utilities. Local tasks stay in the current tab; server/hybrid tasks require explicit upload consent and keep results for 15 minutes. Not Haxe Shader Language.",
    "",
    `${siteConfig.name} is a file-utility product at ${origin}. It is not the Haxe shader language (also abbreviated HXSL).`,
    "",
    "## Key facts",
    `- ${tools.length} published tools in four categories: PDF (${byCategory.pdf.length}), image (${byCategory.image.length}), SVG (${byCategory.svg.length}), icons (${byCategory.icons.length})`,
    `- 15 locales: ${siteConfig.locales.join(", ")}`,
    "- English is x-default. Locale prefix is the first path segment.",
    "- No account required. Price is 0 USD.",
    "- Local processing does not upload automatically. Server/hybrid tools ask for consent first. Server results expire after 15 minutes.",
    "- Honest limits: image signatures are appearances; OCR is approximate; SVG tracing is reconstruction; Office layout depends on LibreOffice.",
    siteConfig.contactEmail ? `- Contact: ${siteConfig.contactEmail}` : "- Contact: operator email is configured per deployment.",
    "",
    "## Primary pages",
    `- [Home (en)](${origin}/en): Directory of ${tools.length} tools`,
    `- [About](${origin}/en/about): What HXSL Tools is and is not`,
    `- [Privacy](${origin}/en/privacy): Local vs server processing`,
    `- [Contact](${origin}/en/contact): Operator contact`,
    `- [PDF tools](${origin}/en/pdf)`,
    `- [Image tools](${origin}/en/image)`,
    `- [SVG tools](${origin}/en/svg)`,
    `- [Icon tools](${origin}/en/icons)`,
    `- [Prepare images for the web](${origin}/en/guides/prepare-images-for-web)`,
    `- [PDF privacy basics](${origin}/en/guides/pdf-privacy-basics)`,
    "",
    "## Locales",
    ...siteConfig.locales.map((locale) => `- ${origin}/${locale}/pdf/merge-pdf`),
    "",
    ...(["pdf", "image", "svg", "icons"] as const).flatMap((category) => [
      `## ${category} tools (${byCategory[category].length})`,
      ...byCategory[category].map((tool) => `- [${tool.publicContent.payload.name}](${origin}/en/${tool.category}/${tool.slug}): ${tool.shortDescription}`),
      "",
    ]),
  ];
  return lines.join("\n");
}
