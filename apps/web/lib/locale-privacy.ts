import type { Locale } from "@hxsl/tool-registry";
// Functional preference only. No automatic detection or file data is stored.
export const localePrivacy: Record<Locale, string> = {
  en: "A manual language choice is saved in the hxsl-locale cookie on this browser for up to one year. It stores only a language code, not file data. Clear the site's cookies to restore browser-language detection. Explicit language links keep their language.",
  "zh-CN": "手动选择的语言通过本浏览器的 hxsl-locale Cookie 保存，最长一年，只包含语言代码，不包含文件信息。清除本站 Cookie 可恢复浏览器语言自动匹配。带有明确语言的链接保持其原有语言。",
  "zh-TW": "手動選擇的語言透過本瀏覽器的 hxsl-locale Cookie 儲存，最長一年，僅包含語言代碼，不含檔案資訊。清除本站 Cookie 可恢復瀏覽器語言自動比對。明確指定語言的連結保留原有語言。",
  es: "La elección manual de idioma se guarda en la cookie hxsl-locale de este navegador durante un máximo de un año. Solo contiene el código de idioma, no datos de archivos. Borra las cookies del sitio para volver a detectar el idioma del navegador. Los enlaces con idioma explícito lo conservan.",
  "pt-BR": "A escolha manual de idioma fica no cookie hxsl-locale deste navegador por até um ano. Ele contém apenas o código do idioma, sem dados de arquivos. Apague os cookies do site para voltar à detecção do navegador. Links com idioma explícito o mantêm.",
  de: "Die manuelle Sprachwahl wird bis zu einem Jahr im Cookie hxsl-locale dieses Browsers gespeichert. Es enthält nur den Sprachcode, keine Dateidaten. Lösche die Website-Cookies, um wieder die Browsersprache zu erkennen. Links mit ausdrücklicher Sprache behalten diese bei.",
  fr: "Le choix manuel de langue est conservé jusqu’à un an dans le cookie hxsl-locale de ce navigateur. Il contient uniquement le code de langue, sans données de fichiers. Effacez les cookies du site pour rétablir la détection du navigateur. Les liens avec une langue explicite la conservent.",
  ja: "手動で選んだ言語は、このブラウザの hxsl-locale Cookie に最長1年間保存されます。言語コードのみで、ファイル情報は含みません。サイトの Cookie を削除するとブラウザ言語の自動判定に戻ります。言語を明示したリンクはその言語を維持します。",
  ko: "수동으로 선택한 언어는 이 브라우저의 hxsl-locale 쿠키에 최대 1년간 저장됩니다. 언어 코드만 포함하며 파일 정보는 저장하지 않습니다. 사이트 쿠키를 지우면 브라우저 언어 감지가 복원됩니다. 언어가 명시된 링크는 해당 언어를 유지합니다.",
  it: "La lingua scelta manualmente viene salvata nel cookie hxsl-locale di questo browser per un massimo di un anno. Contiene solo il codice della lingua, non dati dei file. Cancella i cookie del sito per ripristinare il rilevamento del browser. I link con lingua esplicita la mantengono.",
  tr: "Elle seçilen dil bu tarayıcıdaki hxsl-locale çerezinde en fazla bir yıl saklanır. Yalnızca dil kodunu içerir, dosya bilgisi içermez. Tarayıcı dilini yeniden algılamak için site çerezlerini temizleyin. Dili açıkça belirtilen bağlantılar o dili korur.",
  vi: "Ngôn ngữ chọn thủ công được lưu trong cookie hxsl-locale của trình duyệt này tối đa một năm. Cookie chỉ chứa mã ngôn ngữ, không có dữ liệu tệp. Xóa cookie của trang để khôi phục nhận diện ngôn ngữ trình duyệt. Liên kết có ngôn ngữ rõ ràng vẫn giữ ngôn ngữ đó.",
  nl: "Een handmatige taalkeuze wordt maximaal een jaar bewaard in de hxsl-locale-cookie van deze browser. Deze bevat alleen de taalcode, geen bestandsgegevens. Wis de websitecookies om de browsertaal weer te laten bepalen. Links met een expliciete taal behouden die taal.",
  pl: "Ręczny wybór języka jest zapisywany w pliku cookie hxsl-locale tej przeglądarki na maksymalnie rok. Zawiera tylko kod języka, bez danych plików. Usuń ciasteczka witryny, aby przywrócić wykrywanie języka przeglądarki. Łącza z określonym językiem zachowują ten język.",
  th: "ภาษาที่เลือกเองจะถูกเก็บในคุกกี้ hxsl-locale ของเบราว์เซอร์นี้นานสูงสุดหนึ่งปี มีเฉพาะรหัสภาษา ไม่มีข้อมูลไฟล์ ล้างคุกกี้ของเว็บไซต์เพื่อกลับไปตรวจจับภาษาของเบราว์เซอร์ ลิงก์ที่ระบุภาษาจะคงภาษานั้นไว้",
};
