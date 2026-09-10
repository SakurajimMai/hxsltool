import { additionalLocales } from "./additional-locales";
import type { Locale } from "@hxsl/tool-registry";

type DirectoryCopy = { title: string; subtitle: string; featured: string; all: string; browse: string; local: string; server: string; consent: string; help: string; announcement: string };

const copy: Record<Locale, DirectoryCopy> = {
  ...packMap(c => c.directory),
  ko: additionalLocales.ko.directory, it: additionalLocales.it.directory,

  en: { title: "PDF, image, SVG and icon tools.", subtitle: "Everyday file tasks. Right in your browser.", featured: "Featured", all: "All tools", browse: "Find the right tool", local: "On your device", server: "Server processing", consent: "Upload with consent", help: "A few simple steps", announcement: "Announcement" },
  "zh-CN": { title: "PDF、图片、SVG 与图标工具。", subtitle: "日常文件处理，打开浏览器就能用。", featured: "精选", all: "全部工具", browse: "找到你需要的工具", local: "设备本地处理", server: "服务器处理", consent: "同意后上传", help: "简单几步，完成处理", announcement: "公告" },
  "zh-TW": { title: "PDF、圖片、SVG 與圖示工具。", subtitle: "日常檔案處理，打開瀏覽器就能用。", featured: "精選", all: "全部工具", browse: "找到你需要的工具", local: "裝置本機處理", server: "伺服器處理", consent: "同意後上傳", help: "簡單幾步，完成處理", announcement: "公告" },
  es: { title: "Herramientas de PDF, imagen, SVG e iconos.", subtitle: "Tus archivos del día a día, en el navegador.", featured: "Destacadas", all: "Todas", browse: "Encuentra tu herramienta", local: "En tu dispositivo", server: "En el servidor", consent: "Subida con permiso", help: "Unos pasos sencillos", announcement: "Aviso" },
  "pt-BR": { title: "Ferramentas de PDF, imagem, SVG e ícones.", subtitle: "Seus arquivos do dia a dia, no navegador.", featured: "Destaques", all: "Todas", browse: "Encontre a ferramenta certa", local: "No seu dispositivo", server: "No servidor", consent: "Envio com permissão", help: "Alguns passos simples", announcement: "Aviso" },
  de: { title: "Werkzeuge für PDF, Bilder, SVG und Icons.", subtitle: "Dateien bearbeiten. Direkt im Browser.", featured: "Ausgewählt", all: "Alle", browse: "Das passende Werkzeug finden", local: "Auf deinem Gerät", server: "Auf dem Server", consent: "Upload mit Zustimmung", help: "In wenigen Schritten", announcement: "Mitteilung" },
  fr: { title: "Des outils PDF, image, SVG et icônes.", subtitle: "Vos fichiers du quotidien, dans le navigateur.", featured: "Sélection", all: "Tous", browse: "Trouvez le bon outil", local: "Sur votre appareil", server: "Sur le serveur", consent: "Envoi avec accord", help: "Quelques étapes simples", announcement: "Annonce" },
  ja: { title: "PDF・画像・SVG・アイコンのツール。", subtitle: "いつものファイル作業を、ブラウザで。", featured: "おすすめ", all: "すべて", browse: "必要なツールを見つける", local: "デバイス内で処理", server: "サーバーで処理", consent: "同意後にアップロード", help: "簡単なステップで処理", announcement: "お知らせ" },
};

export function getDirectoryCopy(locale: Locale) { return copy[locale]; }
import { packMap } from "./expanded-locales";
