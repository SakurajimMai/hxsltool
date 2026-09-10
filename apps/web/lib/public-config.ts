import { getPublishedTools, getTool, type Locale, type Tool } from "@hxsl/tool-registry";
import { getLocalizedToolDescription, getLocalizedToolName } from "./i18n";
import { getConfiguredToolLimits } from "../../../config/site";
import { getToolSeoCopy } from "./tool-seo-copy";

export type MaintenanceState = "active" | "maintenance" | "retired";
export type ToolContent = {
  name: string;
  h1: string;
  description: string;
  steps: string[];
  parameterHelp: string;
  faq: Array<{ question: string; answer: string }>;
  errorText: string;
  statusText: string;
  privacyText: string;
  resultText: string;
  title: string;
  metaDescription: string;
  shareText: string;
  humanReviewed: boolean;
};

export type PublicTool = Tool & {
  publicOperational: { featured: boolean; displayOrder: number; aliases: string[]; defaultOptions: Record<string, string | number | boolean>; acceptingNewTasks: boolean; maintenance: { state: MaintenanceState; reason: string; message: string } };
  publicContent: { payload: ToolContent };
};

const featuredIds = new Set(["pdf.merge-pdf", "image.image-compressor", "svg.png-to-svg", "icons.icon-pack", "pdf.pdf-to-jpg", "svg.svg-optimizer"]);

function publicContent(tool: Tool, locale: Locale): ToolContent {
  const name = getLocalizedToolName(locale, tool);
  const description = getLocalizedToolDescription(locale, tool);
  const seo = getToolSeoCopy(locale, tool);
  return {
    name,
    h1: name,
    description,
    steps: seo.steps,
    parameterHelp: seo.parameterHelp,
    faq: seo.faq,
    errorText: seo.resultText,
    statusText: seo.resultText,
    privacyText: seo.privacyText,
    resultText: seo.resultText,
    title: name,
    metaDescription: seo.metaDescription,
    shareText: description,
    humanReviewed: true,
  };
}

export function getEffectiveToolLimits(tool: Pick<Tool, "id" | "category" | "limits">) {
  return getConfiguredToolLimits(tool);
}

export function getPublicTool(toolId: string, locale: Locale): PublicTool | undefined {
  const tool = getPublishedTools(locale).find((item) => item.id === toolId);
  if (!tool) return undefined;
  const publicOperational: PublicTool["publicOperational"] = {
    featured: featuredIds.has(tool.id),
    displayOrder: getPublishedTools(locale).findIndex((item) => item.id === tool.id),
    aliases: [],
    defaultOptions: Object.fromEntries(tool.optionSchema.filter((option) => option.defaultValue !== undefined && !option.sensitive).map((option) => [option.key, option.defaultValue!])),
    acceptingNewTasks: true,
    maintenance: { state: "active", reason: "", message: "" },
  };
  return { ...tool, limits: getEffectiveToolLimits(tool), publicOperational, publicContent: { payload: publicContent(tool, locale) } };
}

export function getPublicToolByRoute(category: string, slug: string, locale: Locale) { const tool = getTool(category, slug); return tool ? getPublicTool(tool.id, locale) : undefined; }
export function getPublicTools(locale: Locale) { return getPublishedTools(locale).map((tool) => getPublicTool(tool.id, locale)).filter((tool): tool is PublicTool => Boolean(tool)); }
export function getPublicToolName(locale: Locale, tool: Tool) { const publicTool = (tool as Partial<PublicTool>).publicContent; return publicTool?.payload.name ?? getLocalizedToolName(locale, tool); }
export function getPublicToolDescription(locale: Locale, tool: Tool) { const publicTool = (tool as Partial<PublicTool>).publicContent; return publicTool?.payload.description ?? getLocalizedToolDescription(locale, tool); }
export function getPublicToolContent(tool: Tool, locale: Locale) { return (tool as Partial<PublicTool>).publicContent?.payload ?? publicContent(tool, locale); }
