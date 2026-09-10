import type { Locale } from "@hxsl/tool-registry";
type LanguageCopy = { title: string; search: string; empty: string; warning: string; skip: string };
const copy: Record<Locale, LanguageCopy> = {
  ...expandedMap(c => c.language),
  ko: { title: "언어 선택", search: "언어 검색", empty: "일치하는 언어가 없습니다.", warning: "언어를 바꾸면 현재 파일과 처리 상태가 초기화됩니다. 계속할까요?", skip: "본문으로 이동" }, it: { title: "Scegli la lingua", search: "Cerca una lingua", empty: "Nessuna lingua trovata.", warning: "Cambiare lingua reimposterà i file e l’elaborazione correnti. Continuare?", skip: "Vai al contenuto" },

  en: { title: "Choose language", search: "Find a language", empty: "No matching language.", warning: "Changing language will reset the current files and processing. Continue?", skip: "Skip to content" },
  "zh-CN": { title: "选择语言", search: "查找语言", empty: "未找到匹配的语言。", warning: "切换语言会重置当前文件和处理状态，是否继续？", skip: "跳到主要内容" },
  "zh-TW": { title: "選擇語言", search: "尋找語言", empty: "找不到符合的語言。", warning: "切換語言會重設目前的檔案與處理狀態，是否繼續？", skip: "跳至主要內容" },
  es: { title: "Elegir idioma", search: "Buscar un idioma", empty: "No se encontró el idioma.", warning: "Cambiar el idioma restablecerá los archivos y el procesamiento actuales. ¿Continuar?", skip: "Saltar al contenido" },
  "pt-BR": { title: "Escolher idioma", search: "Buscar um idioma", empty: "Nenhum idioma encontrado.", warning: "Mudar o idioma reiniciará os arquivos e o processamento atuais. Continuar?", skip: "Ir para o conteúdo" },
  de: { title: "Sprache wählen", search: "Sprache suchen", empty: "Keine passende Sprache gefunden.", warning: "Ein Sprachwechsel setzt die aktuellen Dateien und die Verarbeitung zurück. Fortfahren?", skip: "Zum Inhalt springen" },
  fr: { title: "Choisir la langue", search: "Rechercher une langue", empty: "Aucune langue trouvée.", warning: "Changer de langue réinitialisera les fichiers et le traitement en cours. Continuer ?", skip: "Aller au contenu" },
  ja: { title: "言語を選択", search: "言語を検索", empty: "該当する言語がありません。", warning: "言語を切り替えると現在のファイルと処理状態がリセットされます。続行しますか？", skip: "本文へ移動" },
};
export function getLanguageCopy(locale: Locale) { return copy[locale]; }
import { expandedMap } from "./expanded-locales";
