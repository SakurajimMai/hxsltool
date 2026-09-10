import type { Locale } from "@hxsl/tool-registry";

export class SvgInputError extends Error {
  constructor(readonly kind: "invalid" | "dimensions" | "timeout", readonly maxPixels = 40_000_000) { super(`SVG_${kind.toUpperCase()}`); }
}
const copy: Record<Locale, { invalid: string; dimensions: string; timeout: string }> = {
  en: { invalid: "The SVG or its dimensions are invalid. Check the SVG, use positive numeric dimensions and a scale from 1 to 4.", dimensions: "Image dimensions exceed the limit: {limit} pixels, 16384 per side. Reduce the image or output size.", timeout: "SVG decoding timed out. Try a simpler SVG." },
  "zh-CN": { invalid: "SVG 或尺寸无效。请检查文件，使用正数尺寸，缩放倍数为 1–4。", dimensions: "图片尺寸超过限制：{limit} 像素，单边最多 16384。请缩小原图或输出尺寸。", timeout: "SVG 解码超时，请尝试更简单的 SVG。" },
  "zh-TW": { invalid: "SVG 或尺寸無效。請檢查檔案，使用正數尺寸，縮放倍數為 1–4。", dimensions: "圖片尺寸超過限制：{limit} 像素，單邊最多 16384。請縮小原圖或輸出尺寸。", timeout: "SVG 解碼逾時，請嘗試較簡單的 SVG。" },
  es: { invalid: "El SVG o sus dimensiones no son válidos. Usa dimensiones positivas y una escala de 1 a 4.", dimensions: "La imagen supera el límite: {limit} píxeles, 16384 por lado. Reduce la imagen o el tamaño de salida.", timeout: "La decodificación del SVG tardó demasiado. Prueba un SVG más sencillo." },
  "pt-BR": { invalid: "O SVG ou suas dimensões são inválidos. Use dimensões positivas e escala de 1 a 4.", dimensions: "A imagem excede o limite: {limit} pixels, 16384 por lado. Reduza a imagem ou o tamanho de saída.", timeout: "A decodificação do SVG demorou demais. Tente um SVG mais simples." },
  de: { invalid: "SVG oder Abmessungen sind ungültig. Verwende positive Größen und einen Maßstab von 1 bis 4.", dimensions: "Das Bild überschreitet das Limit: {limit} Pixel, 16384 je Seite. Verkleinere das Bild oder die Ausgabe.", timeout: "Die SVG-Decodierung dauerte zu lange. Verwende eine einfachere SVG-Datei." },
  fr: { invalid: "Le SVG ou ses dimensions sont invalides. Utilisez des dimensions positives et une échelle de 1 à 4.", dimensions: "L’image dépasse la limite : {limit} pixels, 16384 par côté. Réduisez l’image ou la taille de sortie.", timeout: "Le décodage SVG a expiré. Essayez un SVG plus simple." },
  ja: { invalid: "SVG または寸法が無効です。正の寸法と 1～4 倍の倍率を指定してください。", dimensions: "画像が上限を超えています：{limit} ピクセル、各辺 16384 以下。画像または出力サイズを小さくしてください。", timeout: "SVG のデコードがタイムアウトしました。より単純な SVG をお試しください。" },
  ko: { invalid: "SVG 또는 크기가 올바르지 않습니다. 양수 크기와 1~4배 배율을 사용하세요.", dimensions: "이미지 제한 초과: {limit}픽셀, 한 변당 16384 이하. 원본 또는 출력 크기를 줄이세요.", timeout: "SVG 디코딩 시간이 초과되었습니다. 더 단순한 SVG를 사용하세요." },
  it: { invalid: "SVG o dimensioni non validi. Usa dimensioni positive e una scala da 1 a 4.", dimensions: "L’immagine supera il limite: {limit} pixel, 16384 per lato. Riduci l’immagine o le dimensioni di uscita.", timeout: "Decodifica SVG scaduta. Prova un SVG più semplice." },
  tr: { invalid: "SVG veya boyutları geçersiz. Pozitif boyutlar ve 1–4 arasında ölçek kullanın.", dimensions: "Görüntü sınırı aşıyor: {limit} piksel, kenar başına 16384. Görüntüyü veya çıktı boyutunu küçültün.", timeout: "SVG çözümleme zaman aşımına uğradı. Daha basit bir SVG deneyin." },
  vi: { invalid: "SVG hoặc kích thước không hợp lệ. Hãy dùng kích thước dương và tỷ lệ từ 1 đến 4.", dimensions: "Ảnh vượt giới hạn: {limit} pixel, mỗi cạnh tối đa 16384. Hãy giảm ảnh hoặc kích thước đầu ra.", timeout: "Giải mã SVG hết thời gian. Hãy thử SVG đơn giản hơn." },
  nl: { invalid: "De SVG of afmetingen zijn ongeldig. Gebruik positieve afmetingen en een schaal van 1 tot 4.", dimensions: "De afbeelding overschrijdt de limiet: {limit} pixels, 16384 per zijde. Verklein de afbeelding of uitvoer.", timeout: "Het decoderen van de SVG duurde te lang. Probeer een eenvoudigere SVG." },
  pl: { invalid: "SVG lub wymiary są nieprawidłowe. Użyj dodatnich wymiarów i skali od 1 do 4.", dimensions: "Obraz przekracza limit: {limit} pikseli, 16384 na bok. Zmniejsz obraz lub rozmiar wyniku.", timeout: "Przekroczono czas dekodowania SVG. Spróbuj prostszego pliku SVG." },
  th: { invalid: "SVG หรือขนาดไม่ถูกต้อง โปรดใช้ขนาดเป็นบวกและสเกลตั้งแต่ 1 ถึง 4", dimensions: "ภาพเกินขีดจำกัด: {limit} พิกเซล และด้านละไม่เกิน 16384 โปรดลดขนาดภาพหรือผลลัพธ์", timeout: "การถอดรหัส SVG หมดเวลา โปรดลองใช้ SVG ที่เรียบง่ายขึ้น" },
};
export function svgErrorMessage(error: SvgInputError, locale: Locale) { return copy[locale][error.kind].replace("{limit}", new Intl.NumberFormat(locale).format(error.maxPixels)); }
