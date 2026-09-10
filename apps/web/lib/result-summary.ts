import type { Locale } from "@hxsl/tool-registry";

export type ResultInput = { readonly inputCount: number; readonly inputBytes: number; readonly outputName: string };
export function resultInput(files: readonly { size: number }[], outputName: string): ResultInput {
  return { inputCount: files.length, inputBytes: files.reduce((sum, file) => sum + file.size, 0), outputName };
}
export function resultChange(inputBytes: number, outputBytes: number) {
  if (inputBytes <= 0) return undefined;
  return { ratio: Math.abs(outputBytes / inputBytes - 1), direction: outputBytes > inputBytes ? "larger" : outputBytes < inputBytes ? "smaller" : "unchanged" } as const;
}
const included: Record<Locale, string> = {
  en: "Combined into {name}", "zh-CN": "已合入 {name}", "zh-TW": "已合入 {name}",
  es: "Incluido en {name}", "pt-BR": "Incluído em {name}", de: "Zusammengeführt in {name}",
  fr: "Regroupé dans {name}", ja: "{name} に統合済み", ko: "{name}에 통합됨", it: "Incluso in {name}",
  tr: "{name} içinde birleştirildi", vi: "Đã gộp vào {name}", nl: "Samengevoegd in {name}",
  pl: "Połączono w {name}", th: "รวมไว้ใน {name} แล้ว",
};
export function includedInResult(locale: Locale, name: string) { return included[locale].replace("{name}", () => name); }
const sameSize: Record<Locale, string> = {
  en: "File size unchanged", "zh-CN": "文件体积未变化", "zh-TW": "檔案大小未變更", es: "Tamaño del archivo sin cambios",
  "pt-BR": "Tamanho do arquivo inalterado", de: "Dateigröße unverändert", fr: "Taille du fichier inchangée", ja: "ファイルサイズは変わりません",
  ko: "파일 크기 변경 없음", it: "Dimensione del file invariata", tr: "Dosya boyutu değişmedi", vi: "Kích thước tệp không thay đổi",
  nl: "Bestandsgrootte ongewijzigd", pl: "Rozmiar pliku bez zmian", th: "ขนาดไฟล์ไม่เปลี่ยนแปลง",
};
export function unchangedSize(locale: Locale) { return sameSize[locale]; }
