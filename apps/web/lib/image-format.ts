import type { Locale, Tool } from "@hxsl/tool-registry";
import { SvgInputError, svgErrorMessage } from "./svg-errors";
import { PdfPageError, pdfPageMessage } from "./pdf-page-copy";

const preservesFormat = new Set(["image-compressor", "resize-image", "crop-image", "rotate-image", "image-background", "strip-exif"]);
export function requestedImageFormat(tool: Pick<Tool, "slug" | "outputFormats">, inputFormat: string, override?: string): string {
  const format = (override || (preservesFormat.has(tool.slug) ? inputFormat : tool.outputFormats[0])).toLowerCase();
  return format === "jpeg" ? "jpg" : format;
}
export class ImageEncodingError extends Error {
  constructor(readonly format: string) { super(`${format.toUpperCase()} encoding is not available in this browser. No upload was attempted.`); }
}
const encodingCopy: Record<Locale, string> = {
  en: "This browser cannot encode {format}. No file was uploaded. Use a PNG or WebP conversion tool instead.",
  "zh-CN": "此浏览器不支持 {format} 编码，文件未上传。请改用 PNG 或 WebP 转换工具。",
  "zh-TW": "此瀏覽器不支援 {format} 編碼，檔案未上傳。請改用 PNG 或 WebP 轉換工具。",
  es: "Este navegador no puede codificar {format}. No se subió ningún archivo. Usa una herramienta de conversión a PNG o WebP.",
  "pt-BR": "Este navegador não pode codificar {format}. Nenhum arquivo foi enviado. Use uma ferramenta de conversão para PNG ou WebP.",
  de: "Dieser Browser kann {format} nicht kodieren. Es wurde keine Datei hochgeladen. Nutze ein Konvertierungswerkzeug für PNG oder WebP.",
  fr: "Ce navigateur ne peut pas encoder en {format}. Aucun fichier n’a été envoyé. Utilisez un outil de conversion en PNG ou WebP.",
  ja: "このブラウザーは {format} のエンコードに対応していません。ファイルはアップロードされていません。PNG または WebP 変換ツールをご利用ください。",
  ko: "이 브라우저는 {format} 인코딩을 지원하지 않습니다. 파일은 업로드되지 않았습니다. PNG 또는 WebP 변환 도구를 사용해 주세요.",
  it: "Questo browser non può codificare in {format}. Nessun file è stato caricato. Usa uno strumento di conversione in PNG o WebP.",
  tr: "Bu tarayıcı {format} kodlamasını desteklemiyor. Hiçbir dosya yüklenmedi. PNG veya WebP dönüştürme aracını kullanın.",
  vi: "Trình duyệt này không hỗ trợ mã hóa {format}. Không có tệp nào được tải lên. Hãy dùng công cụ chuyển đổi sang PNG hoặc WebP.",
  nl: "Deze browser kan niet coderen naar {format}. Er is geen bestand geüpload. Gebruik een conversietool voor PNG of WebP.",
  pl: "Ta przeglądarka nie obsługuje kodowania {format}. Nie przesłano żadnego pliku. Użyj narzędzia do konwersji na PNG lub WebP.",
  th: "เบราว์เซอร์นี้ไม่รองรับการเข้ารหัส {format} ไม่มีการอัปโหลดไฟล์ โปรดใช้เครื่องมือแปลงเป็น PNG หรือ WebP แทน",
};
export function imageProcessingError(error: unknown, locale: Locale): string {
  if (error instanceof PdfPageError) return pdfPageMessage(locale, error.code, error.value);
  if (error instanceof SvgInputError) return svgErrorMessage(error, locale);
  if (error instanceof ImageEncodingError) return encodingCopy[locale].replace("{format}", error.format.toUpperCase());
  return error instanceof Error ? error.message : "Unknown processing error";
}
