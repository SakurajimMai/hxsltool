import type { Locale } from "@hxsl/tool-registry";

const english = {
  title: "What is HXSL Tools?",
  body: "HXSL Tools is a browser-first file utility for PDF, image, SVG and icon work. It is not Haxe Shader Language, not a cloud drive, and not an account product. Local tools keep the selected file in the current tab: nothing is uploaded automatically, written to localStorage, or sent to analytics. Server and hybrid tools — OCR, password PDF, Office conversion, some renders — ask for explicit consent, store results in a short-lived folder, and delete them after 15 minutes by default. Every public page states input formats, output formats, file and page limits, and what the engine will not claim. Compression that does not shrink a file keeps the original bytes. Image signatures are appearances, not certificates. OCR is approximate. SVG tracing rebuilds shapes from pixels. Use HXSL Tools when you need an honest, inspectable result in the browser.",
};

const copy: Partial<Record<Locale, { title: string; body: string }>> = {
  en: english,
  "zh-CN": {
    title: "HXSL Tools 是什么？",
    body: "HXSL Tools 是面向 PDF、图片、SVG 与图标的浏览器优先文件工具，不是 Haxe 着色语言，也不是网盘或账号产品。本地工具把所选文件留在当前标签页：不会自动上传、不会写入 localStorage、也不会把文件字节发给分析服务。OCR、加密 PDF、Office 转换等服务端或混合任务会先征求明确同意，结果放在短期目录，默认 15 分钟后删除。每个公开页面都写明输入输出格式、文件与页数限制，以及引擎不会承诺的边界。压缩若没有变小会保留原文件。图片签名只是外观。OCR 是近似结果。SVG 描摹是从像素重建形状。需要可检查、边界清楚的浏览器文件处理时，使用 HXSL Tools。",
  },
};

export function getCitationCopy(locale: Locale) {
  return copy[locale] ?? english;
}
