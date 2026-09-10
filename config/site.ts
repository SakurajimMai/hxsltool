import { LOCALES } from "../packages/tool-registry/src/index";
const locales = LOCALES;
const configuredDefaultLocale = process.env.DEFAULT_LOCALE ?? "en";
function positiveNumber(value: string | undefined, fallback: number) { const parsed = Number(value ?? fallback); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }

export const siteConfig = {
  name: process.env.SITE_NAME ?? "HXSL Tools",
  url: process.env.SITE_URL ?? "https://hxsl.org",
  defaultLocale: locales.includes(configuredDefaultLocale as (typeof locales)[number]) ? configuredDefaultLocale as (typeof locales)[number] : "en",
  locales,
  allowIndexing: process.env.ALLOW_INDEXING !== "false",
  contactEmail: process.env.CONTACT_EMAIL || "hello@hxsl.org",
  maxFilesPerBatch: positiveNumber(process.env.MAX_FILES_PER_BATCH, 100),
  maxImageMb: positiveNumber(process.env.MAX_IMAGE_MB, 8),
  maxPdfMb: positiveNumber(process.env.MAX_PDF_MB, 50),
  maxDecodedPixels: positiveNumber(process.env.MAX_DECODED_PIXELS, 40_000_000),
  maxPdfPages: positiveNumber(process.env.MAX_PDF_PAGES, 300),
  maxJobSeconds: positiveNumber(process.env.MAX_JOB_SECONDS, 120),
  maxOutputBytes: positiveNumber(process.env.MAX_OUTPUT_BYTES, 200 * 1024 * 1024),
  resultTtlSeconds: positiveNumber(process.env.RESULT_TTL_SECONDS, 900),
} as const;

export type Locale = (typeof siteConfig.locales)[number];

type ToolLimitSource = { category: string; limits: { maxFiles?: number; maxMb?: number; maxPages?: number; maxPixels?: number } };
export function getConfiguredToolLimits(tool: ToolLimitSource) {
  const configuredFiles = tool.category === "image" ? siteConfig.maxFilesPerBatch : tool.limits.maxFiles ?? 1;
  const configuredMb = tool.category === "image" ? siteConfig.maxImageMb : tool.category === "pdf" ? siteConfig.maxPdfMb : tool.limits.maxMb ?? 8;
  const configuredPages = tool.category === "pdf" ? Math.min(tool.limits.maxPages ?? siteConfig.maxPdfPages, siteConfig.maxPdfPages) : tool.limits.maxPages;
  const configuredPixels = tool.limits.maxPixels === undefined ? undefined : Math.min(tool.limits.maxPixels, siteConfig.maxDecodedPixels);
  return { ...tool.limits, maxFiles: Math.max(1, Math.min(tool.limits.maxFiles ?? configuredFiles, configuredFiles)), maxMb: Math.max(1, configuredMb), maxPages: configuredPages, maxPixels: configuredPixels };
}
