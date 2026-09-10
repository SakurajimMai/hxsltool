import type { Locale } from "@hxsl/tool-registry";

const copy: Record<Locale, string> = {
  en: "Decoded pixel limit: {count}.",
  "zh-CN": "解码后的像素数上限：{count}。",
  "zh-TW": "解碼後的像素數上限：{count}。",
  es: "Límite de píxeles decodificados: {count}.",
  "pt-BR": "Limite de pixels decodificados: {count}.",
  de: "Maximale Anzahl dekodierter Pixel: {count}.",
  fr: "Nombre maximal de pixels décodés : {count}.",
  ja: "デコード後の画素数の上限：{count}。",
  ko: "디코딩된 픽셀 수 제한: {count}.",
  it: "Limite di pixel decodificati: {count}.",
  tr: "Kodu çözülmüş piksel sınırı: {count}.",
  vi: "Giới hạn số điểm ảnh sau khi giải mã: {count}.",
  nl: "Limiet voor gedecodeerde pixels: {count}.",
  pl: "Limit zdekodowanych pikseli: {count}.",
  th: "ขีดจำกัดจำนวนพิกเซลหลังถอดรหัส: {count}",
};

export function pixelLimitText(locale: Locale, pixels: number | undefined): string {
  return pixels === undefined ? "" : ` ${copy[locale].replace("{count}", pixels.toLocaleString(locale))}`;
}
