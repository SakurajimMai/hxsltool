import type { Locale } from "@hxsl/tool-registry";
const choiceKeys = ["image", "portrait", "landscape", "contain", "cover", "structural", "lossy", "top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right", "custom", "original", "none", "horizontal", "vertical"];
const choices: Record<Locale, string[]> = {
  ...expandedMap(c => Object.values(c.choices)),
  en: ["Image size", "Portrait", "Landscape", "Fit inside", "Fill and crop", "Structural", "Lossy", "Top left", "Top center", "Top right", "Center", "Bottom left", "Bottom center", "Bottom right", "Custom", "Original", "None", "Horizontal", "Vertical"],
  "zh-CN": ["图片尺寸", "纵向", "横向", "完整适应", "填满并裁切", "结构优化", "有损压缩", "左上", "顶部居中", "右上", "居中", "左下", "底部居中", "右下", "自定义", "原始", "无", "水平", "垂直"],
  "zh-TW": ["圖片尺寸", "直向", "橫向", "完整適應", "填滿並裁切", "結構最佳化", "有損壓縮", "左上", "頂部置中", "右上", "置中", "左下", "底部置中", "右下", "自訂", "原始", "無", "水平", "垂直"],
  es: ["Tamaño de imagen", "Vertical", "Horizontal", "Ajustar dentro", "Rellenar y recortar", "Estructural", "Con pérdida", "Arriba a la izquierda", "Arriba al centro", "Arriba a la derecha", "Centro", "Abajo a la izquierda", "Abajo al centro", "Abajo a la derecha", "Personalizado", "Original", "Ninguno", "Horizontal", "Vertical"],
  "pt-BR": ["Tamanho da imagem", "Retrato", "Paisagem", "Ajustar dentro", "Preencher e recortar", "Estrutural", "Com perdas", "Superior esquerdo", "Superior central", "Superior direito", "Centro", "Inferior esquerdo", "Inferior central", "Inferior direito", "Personalizado", "Original", "Nenhum", "Horizontal", "Vertical"],
  de: ["Bildgröße", "Hochformat", "Querformat", "Einpassen", "Füllen und zuschneiden", "Strukturell", "Verlustbehaftet", "Oben links", "Oben mittig", "Oben rechts", "Mitte", "Unten links", "Unten mittig", "Unten rechts", "Benutzerdefiniert", "Original", "Keine", "Horizontal", "Vertikal"],
  fr: ["Taille de l’image", "Portrait", "Paysage", "Ajuster", "Remplir et recadrer", "Structurelle", "Avec perte", "En haut à gauche", "En haut au centre", "En haut à droite", "Centre", "En bas à gauche", "En bas au centre", "En bas à droite", "Personnalisé", "Original", "Aucun", "Horizontal", "Vertical"],
  ja: ["画像サイズ", "縦向き", "横向き", "全体を収める", "埋めて切り抜く", "構造最適化", "非可逆圧縮", "左上", "上中央", "右上", "中央", "左下", "下中央", "右下", "カスタム", "元の値", "なし", "水平", "垂直"],
  ko: ["이미지 크기", "세로", "가로", "전체 맞춤", "채우고 자르기", "구조 최적화", "손실 압축", "왼쪽 위", "위 가운데", "오른쪽 위", "가운데", "왼쪽 아래", "아래 가운데", "오른쪽 아래", "사용자 지정", "원본", "없음", "가로", "세로"],
  it: ["Dimensioni immagine", "Verticale", "Orizzontale", "Adatta", "Riempi e ritaglia", "Strutturale", "Con perdita", "In alto a sinistra", "In alto al centro", "In alto a destra", "Centro", "In basso a sinistra", "In basso al centro", "In basso a destra", "Personalizzato", "Originale", "Nessuno", "Orizzontale", "Verticale"],
};
type WorkspaceCopy = { unsupported: string; tooLarge: string; empty: string; saved: string; larger: string; preview: string; order: string; error: string };
const copy: Record<Locale, WorkspaceCopy> = {
  ...expandedMap(c => c.checks),
  en: { unsupported: "This format is not supported. Choose one of:", tooLarge: "This file exceeds the size limit:", empty: "This file is empty. Choose a file with content.", saved: "smaller", larger: "larger", preview: "Preview", order: "Page order (for example 2,1,3)", error: "Processing error" },
  "zh-CN": { unsupported: "不支持此格式，请选择以下格式：", tooLarge: "文件超过大小限制：", empty: "文件为空，请选择包含内容的文件。", saved: "减小", larger: "增大", preview: "预览", order: "页面顺序（例如 2,1,3）", error: "处理错误" },
  "zh-TW": { unsupported: "不支援此格式，請選擇以下格式：", tooLarge: "檔案超過大小限制：", empty: "檔案為空，請選擇包含內容的檔案。", saved: "縮小", larger: "增大", preview: "預覽", order: "頁面順序（例如 2,1,3）", error: "處理錯誤" },
  es: { unsupported: "Formato no compatible. Elige uno de:", tooLarge: "El archivo supera el límite:", empty: "El archivo está vacío. Elige uno con contenido.", saved: "menor", larger: "mayor", preview: "Vista previa", order: "Orden de páginas (por ejemplo 2,1,3)", error: "Error de procesamiento" },
  "pt-BR": { unsupported: "Formato não compatível. Escolha um destes:", tooLarge: "O arquivo excede o limite:", empty: "O arquivo está vazio. Escolha um com conteúdo.", saved: "menor", larger: "maior", preview: "Prévia", order: "Ordem das páginas (por exemplo 2,1,3)", error: "Erro de processamento" },
  de: { unsupported: "Nicht unterstütztes Format. Wähle eines von:", tooLarge: "Die Datei überschreitet die Grenze:", empty: "Die Datei ist leer. Wähle eine Datei mit Inhalt.", saved: "kleiner", larger: "größer", preview: "Vorschau", order: "Seitenreihenfolge (zum Beispiel 2,1,3)", error: "Verarbeitungsfehler" },
  fr: { unsupported: "Format non pris en charge. Choisissez parmi :", tooLarge: "Le fichier dépasse la limite :", empty: "Le fichier est vide. Choisissez un fichier avec du contenu.", saved: "plus petit", larger: "plus grand", preview: "Aperçu", order: "Ordre des pages (par exemple 2,1,3)", error: "Erreur de traitement" },
  ja: { unsupported: "非対応の形式です。次の形式を選んでください：", tooLarge: "ファイルが上限を超えています：", empty: "ファイルが空です。内容のあるファイルを選んでください。", saved: "縮小", larger: "増加", preview: "プレビュー", order: "ページの順序（例：2,1,3）", error: "処理エラー" },
  ko: { unsupported: "지원하지 않는 형식입니다. 다음 형식 중 선택하세요:", tooLarge: "파일 크기가 제한을 초과합니다:", empty: "빈 파일입니다. 내용이 있는 파일을 선택하세요.", saved: "감소", larger: "증가", preview: "미리보기", order: "페이지 순서 (예: 2,1,3)", error: "처리 오류" },
  it: { unsupported: "Formato non supportato. Scegli tra:", tooLarge: "Il file supera il limite:", empty: "Il file è vuoto. Scegli un file con contenuto.", saved: "più piccolo", larger: "più grande", preview: "Anteprima", order: "Ordine pagine (ad esempio 2,1,3)", error: "Errore di elaborazione" },
};
export function getWorkspaceCopy(locale: Locale) { return copy[locale]; }
export function getLocalizedChoice(locale: Locale, value: string) { const index = choiceKeys.indexOf(value); return index < 0 ? value : choices[locale][index]; }
import { expandedMap } from "./expanded-locales";
