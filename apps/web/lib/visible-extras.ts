import type { Locale } from "@hxsl/tool-registry";

export type AboutExtras = { catalog: string; identity: string };
export type ContactExtras = { extra: string; helpTitle: string; items: [string, string, string] };
export type GuideExtras = Array<[string, string]>;

const about: Record<Locale, AboutExtras> = {
  en: {
    catalog: "The public catalog has four hubs — PDF, image, SVG and icons — and 82 task pages. Each page states input formats, output formats, local versus server processing, and numeric limits before the workbench runs. Retired AI, account and billing surfaces return 404.",
    identity: "HXSL Tools does not keep user accounts, does not load advertising or analytics SDKs by default, and does not claim cryptographic PDF signatures, perfect OCR, or physical disk erasure after the 15-minute result TTL.",
  },
  "zh-CN": {
    catalog: "公开目录有四个分类：PDF、图片、SVG 和图标，共 82 个任务页。每个页面都会在工作台运行前说明输入输出格式、本地或服务端处理，以及数量限制。已下线的 AI、账号和计费页面返回 404。",
    identity: "HXSL Tools 不保存用户账号，默认不加载广告或分析 SDK，也不声称密码学 PDF 签名、完美 OCR，或 15 分钟结果过期后的物理磁盘擦除。",
  },
  "zh-TW": {
    catalog: "公開目錄有四個分類：PDF、圖片、SVG 與圖示，共 82 個任務頁。每個頁面都會在工作台執行前說明輸入輸出格式、本機或伺服器處理，以及數量限制。已下線的 AI、帳號與計費頁面回傳 404。",
    identity: "HXSL Tools 不保存使用者帳號，預設不載入廣告或分析 SDK，也不聲稱密碼學 PDF 簽名、完美 OCR，或 15 分鐘結果過期後的實體磁碟抹除。",
  },
  es: {
    catalog: "El catálogo público tiene cuatro centros — PDF, imagen, SVG e iconos — y 82 páginas de tareas. Cada página indica formatos, procesamiento local o de servidor y límites numéricos antes de ejecutar el espacio de trabajo. Las superficies de IA, cuentas y facturación retiradas devuelven 404.",
    identity: "HXSL Tools no guarda cuentas, no carga SDK de publicidad ni analítica por defecto, y no afirma firmas PDF criptográficas, OCR perfecto ni borrado físico del disco tras el TTL de 15 minutos.",
  },
  "pt-BR": {
    catalog: "O catálogo público tem quatro hubs — PDF, imagem, SVG e ícones — e 82 páginas de tarefas. Cada página indica formatos, processamento local ou no servidor e limites numéricos antes da bancada. Superfícies retiradas de IA, contas e cobrança retornam 404.",
    identity: "O HXSL Tools não guarda contas, não carrega SDKs de anúncio ou análise por padrão e não afirma assinaturas PDF criptográficas, OCR perfeito nem apagamento físico do disco após o TTL de 15 minutos.",
  },
  de: {
    catalog: "Der öffentliche Katalog hat vier Bereiche — PDF, Bild, SVG und Icons — und 82 Aufgabenseiten. Jede Seite nennt Formate, lokale oder Serververarbeitung und Zahlengrenzen, bevor die Arbeitsfläche startet. Zurückgezogene KI-, Konto- und Abrechnungsseiten liefern 404.",
    identity: "HXSL Tools speichert keine Konten, lädt standardmäßig keine Werbe- oder Analyse-SDKs und behauptet keine kryptografischen PDF-Signaturen, perfektes OCR oder physisches Löschen nach der 15-Minuten-TTL.",
  },
  fr: {
    catalog: "Le catalogue public compte quatre pôles — PDF, image, SVG et icônes — et 82 pages de tâches. Chaque page indique les formats, le traitement local ou serveur et les limites avant le plan de travail. Les surfaces IA, comptes et facturation retirées renvoient 404.",
    identity: "HXSL Tools ne conserve pas de comptes, ne charge pas de SDK publicitaire ou analytique par défaut, et n’affirme pas de signatures PDF cryptographiques, d’OCR parfait ni d’effacement physique après le TTL de 15 minutes.",
  },
  ja: {
    catalog: "公開カタログは PDF・画像・SVG・アイコンの 4 つのハブと 82 の作業ページです。各ページは作業台を始める前に入力と出力の形式、ローカルかサーバーか、数量の上限を示します。廃止した AI・アカウント・課金画面は 404 を返します。",
    identity: "HXSL Tools はユーザーアカウントを持たず、広告や分析 SDK を標準では読み込みません。暗号学的な PDF 署名、完全な OCR、15 分 TTL 後の物理消去も主張しません。",
  },
  ko: {
    catalog: "공개 목록은 PDF, 이미지, SVG, 아이콘 네 허브와 82개 작업 페이지입니다. 각 페이지는 작업대를 시작하기 전에 입출력 형식, 로컬/서버 처리, 수량 한도를 밝힙니다. 중단된 AI·계정·결제 화면은 404를 반환합니다.",
    identity: "HXSL Tools는 계정을 두지 않고, 기본적으로 광고·분석 SDK를 불러오지 않으며, 암호학적 PDF 서명, 완벽한 OCR, 15분 TTL 이후의 물리적 삭제를 주장하지 않습니다.",
  },
  it: {
    catalog: "Il catalogo pubblico ha quattro hub — PDF, immagini, SVG e icone — e 82 pagine di attività. Ogni pagina indica formati, elaborazione locale o server e limiti numerici prima del banco di lavoro. Le superfici ritirate di IA, account e fatturazione restituiscono 404.",
    identity: "HXSL Tools non conserva account, non carica SDK pubblicitari o analitici per impostazione predefinita e non afferma firme PDF crittografiche, OCR perfetto o cancellazione fisica dopo il TTL di 15 minuti.",
  },
  tr: {
    catalog: "Herkese açık katalogda PDF, görüntü, SVG ve simge olmak üzere dört merkez ve 82 görev sayfası vardır. Her sayfa çalışma alanından önce biçimleri, yerel veya sunucu işlemeyi ve sayısal sınırları belirtir. Kaldırılan yapay zeka, hesap ve faturalama yüzeyleri 404 döner.",
    identity: "HXSL Tools hesap tutmaz, varsayılan olarak reklam veya analitik SDK yüklemez; kriptografik PDF imzası, kusursuz OCR veya 15 dakikalık TTL sonrası fiziksel silme iddiasında bulunmaz.",
  },
  vi: {
    catalog: "Danh mục công khai có bốn trung tâm — PDF, ảnh, SVG và biểu tượng — cùng 82 trang tác vụ. Mỗi trang nêu định dạng, xử lý cục bộ hay máy chủ, và giới hạn số trước khi bàn làm việc chạy. Các bề mặt AI, tài khoản và thanh toán đã gỡ trả về 404.",
    identity: "HXSL Tools không giữ tài khoản, mặc định không tải SDK quảng cáo hay phân tích, và không khẳng định chữ ký PDF mật mã, OCR hoàn hảo hay xóa đĩa vật lý sau TTL 15 phút.",
  },
  nl: {
    catalog: "De openbare catalogus heeft vier hubs — PDF, afbeelding, SVG en pictogrammen — en 82 taakpagina’s. Elke pagina noemt formaten, lokale of serververwerking en getalslimieten voordat de werkbank start. Teruggetrokken AI-, account- en facturatiepagina’s geven 404.",
    identity: "HXSL Tools bewaart geen accounts, laadt standaard geen advertentie- of analyse-SDK’s, en beweert geen cryptografische PDF-handtekeningen, perfecte OCR of fysieke schijfwissing na de TTL van 15 minuten.",
  },
  pl: {
    catalog: "Publiczny katalog ma cztery centra — PDF, obraz, SVG i ikony — oraz 82 strony zadań. Każda strona podaje formaty, przetwarzanie lokalne lub serwerowe i limity liczbowe przed uruchomieniem warsztatu. Wycofane strony AI, kont i rozliczeń zwracają 404.",
    identity: "HXSL Tools nie przechowuje kont, domyślnie nie ładuje SDK reklam ani analityki i nie twierdzi kryptograficznych podpisów PDF, idealnego OCR ani fizycznego kasowania po 15-minutowym TTL.",
  },
  th: {
    catalog: "แคตตาล็อกสาธารณะมีสี่ศูนย์ — PDF รูปภาพ SVG และไอคอน — และ 82 หน้างาน แต่ละหน้าบอกชนิดไฟล์ การประมวลผลในเครื่องหรือเซิร์ฟเวอร์ และขีดจำกัดตัวเลขก่อนโต๊ะงาน หน้า AI บัญชี และการเรียกเก็บที่เลิกใช้แล้วคืน 404",
    identity: "HXSL Tools ไม่เก็บบัญชีผู้ใช้ ไม่โหลด SDK โฆษณาหรือวิเคราะห์โดยค่าเริ่มต้น และไม่อ้างลายเซ็น PDF เชิงรหัส OCR สมบูรณ์ หรือการลบดิสก์จริงหลัง TTL 15 นาที",
  },
};

const contact: Record<Locale, ContactExtras> = {
  en: { extra: "Use this address for accessibility notes, security reports, localization corrections, and questions about local versus server processing. Do not send files you are not allowed to process.", helpTitle: "What we can help with", items: ["Wrong or missing translations on a public tool page", "A result that does not match the stated format or size check", "Security issues in the anonymous job transport"] },
  "zh-CN": { extra: "此地址用于无障碍说明、安全报告、翻译更正，以及本地与服务端处理的问题。请勿发送你无权处理的文件。", helpTitle: "我们可以协助的事项", items: ["公开工具页的错译或漏译", "结果与声明的格式或大小检查不符", "匿名任务传输中的安全问题"] },
  "zh-TW": { extra: "此地址用於無障礙說明、安全回報、翻譯更正，以及本機與伺服器處理的問題。請勿傳送你無權處理的檔案。", helpTitle: "我們可以協助的事項", items: ["公開工具頁的錯譯或漏譯", "結果與聲明的格式或大小檢查不符", "匿名任務傳輸中的安全問題"] },
  es: { extra: "Usa esta dirección para accesibilidad, informes de seguridad, correcciones de traducción y dudas sobre procesamiento local o de servidor. No envíes archivos que no puedas tratar.", helpTitle: "En qué podemos ayudar", items: ["Traducciones incorrectas o faltantes en una página pública", "Un resultado que no coincide con el formato o el tamaño declarado", "Problemas de seguridad en el transporte anónimo de tareas"] },
  "pt-BR": { extra: "Use este endereço para acessibilidade, relatos de segurança, correções de tradução e dúvidas sobre processamento local ou no servidor. Não envie arquivos que você não pode processar.", helpTitle: "Como podemos ajudar", items: ["Traduções erradas ou ausentes em uma página pública", "Um resultado que não bate com o formato ou o tamanho declarado", "Problemas de segurança no transporte anônimo de tarefas"] },
  de: { extra: "Nutze diese Adresse für Barrierefreiheit, Sicherheitsmeldungen, Übersetzungskorrekturen und Fragen zu lokaler oder Serververarbeitung. Sende keine Dateien, die du nicht verarbeiten darfst.", helpTitle: "Wobei wir helfen", items: ["Falsche oder fehlende Übersetzungen auf einer öffentlichen Werkzeugseite", "Ein Ergebnis, das nicht zur angegebenen Format- oder Größenprüfung passt", "Sicherheitsprobleme im anonymen Aufgabenversand"] },
  fr: { extra: "Utilisez cette adresse pour l’accessibilité, les signalements de sécurité, les corrections de traduction et les questions sur le traitement local ou serveur. N’envoyez pas de fichiers que vous n’avez pas le droit de traiter.", helpTitle: "Ce que nous pouvons aider", items: ["Traductions erronées ou manquantes sur une page d’outil publique", "Un résultat qui ne correspond pas au format ou au contrôle de taille annoncé", "Problèmes de sécurité dans le transport anonyme des tâches"] },
  ja: { extra: "この宛先は、アクセシビリティ、セキュリティ報告、翻訳の修正、ローカルとサーバー処理に関する質問向けです。処理する権利のないファイルは送らないでください。", helpTitle: "対応できること", items: ["公開ツールページの誤訳や欠落", "表示された形式やサイズ検査と一致しない結果", "匿名ジョブ転送のセキュリティ問題"] },
  ko: { extra: "이 주소는 접근성, 보안 신고, 번역 수정, 로컬과 서버 처리 질문용입니다. 처리할 권한이 없는 파일은 보내지 마세요.", helpTitle: "도움을 드릴 수 있는 일", items: ["공개 도구 페이지의 오역 또는 누락", "안내된 형식이나 크기 검사와 다른 결과", "익명 작업 전송의 보안 문제"] },
  it: { extra: "Usa questo indirizzo per accessibilità, segnalazioni di sicurezza, correzioni di traduzione e domande su elaborazione locale o server. Non inviare file che non sei autorizzato a trattare.", helpTitle: "Come possiamo aiutare", items: ["Traduzioni errate o mancanti in una pagina pubblica", "Un risultato che non corrisponde al formato o al controllo dimensione dichiarato", "Problemi di sicurezza nel trasporto anonimo dei lavori"] },
  tr: { extra: "Bu adresi erişilebilirlik, güvenlik bildirimleri, çeviri düzeltmeleri ve yerel ya da sunucu işleme soruları için kullanın. İşleme yetkiniz olmayan dosyaları göndermeyin.", helpTitle: "Yardım edebileceğimiz konular", items: ["Herkese açık araç sayfasında yanlış veya eksik çeviriler", "Belirtilen biçim veya boyut denetimiyle uyuşmayan sonuç", "Anonim iş aktarımındaki güvenlik sorunları"] },
  vi: { extra: "Dùng địa chỉ này cho hỗ trợ tiếp cận, báo cáo bảo mật, sửa bản dịch và câu hỏi về xử lý cục bộ hay máy chủ. Đừng gửi tệp bạn không được phép xử lý.", helpTitle: "Chúng tôi có thể giúp gì", items: ["Bản dịch sai hoặc thiếu trên trang công cụ công khai", "Kết quả không khớp kiểm tra định dạng hoặc kích thước đã nêu", "Vấn đề bảo mật trong vận chuyển tác vụ ẩn danh"] },
  nl: { extra: "Gebruik dit adres voor toegankelijkheid, beveiligingsmeldingen, vertaalcorrecties en vragen over lokale of serververwerking. Stuur geen bestanden die je niet mag verwerken.", helpTitle: "Waarmee we kunnen helpen", items: ["Foute of ontbrekende vertalingen op een openbare toolpagina", "Een resultaat dat niet overeenkomt met de opgegeven formaat- of groottetoets", "Beveiligingsproblemen in het anonieme taaktransport"] },
  pl: { extra: "Ten adres służy do dostępności, zgłoszeń bezpieczeństwa, poprawek tłumaczeń i pytań o przetwarzanie lokalne lub serwerowe. Nie wysyłaj plików, których nie wolno Ci przetwarzać.", helpTitle: "W czym możemy pomóc", items: ["Błędne lub brakujące tłumaczenia na publicznej stronie narzędzia", "Wynik niezgodny z zadeklarowanym formatem lub sprawdzeniem rozmiaru", "Problemy bezpieczeństwa w anonimowym transporcie zadań"] },
  th: { extra: "ใช้ที่อยู่นี้สำหรับเรื่องการเข้าถึง รายงานความปลอดภัย การแก้คำแปล และคำถามเรื่องประมวลผลในเครื่องหรือเซิร์ฟเวอร์ อย่าส่งไฟล์ที่คุณไม่มีสิทธิ์ประมวลผล", helpTitle: "สิ่งที่เราช่วยได้", items: ["คำแปลผิดหรือขาดในหน้าเครื่องมือสาธารณะ", "ผลลัพธ์ที่ไม่ตรงกับการตรวจชนิดไฟล์หรือขนาดที่ระบุ", "ปัญหาความปลอดภัยในการส่งงานแบบไม่ระบุตัวตน"] },
};

const guidePdf: Record<Locale, GuideExtras> = {
  en: [["Crop is not redaction", "Use Crop PDF only to change the visible box. Use Redact PDF when the underlying text must go. Flatten changes supported forms; sanitize resets declared metadata."], ["Related tools", "Open Redact PDF, Sanitize PDF, Verify PDF and Unlock PDF from the PDF hub. Local tasks stay in the tab. Password and OCR tasks are server jobs with a 15-minute result TTL."]],
  "zh-CN": [["裁切不是涂黑", "裁切 PDF 只改变可见区域。需要去掉底层文字时请用涂黑。扁平化会改变受支持的表单；清理会重置已声明的元数据。"], ["相关工具", "从 PDF 分类打开涂黑、清理、验证和解锁。本地任务留在标签页。密码和 OCR 是服务端任务，结果默认保留 15 分钟。"]],
  "zh-TW": [["裁切不是遮蔽", "裁切 PDF 只改變可見區域。需要去掉底層文字時請用遮蔽。扁平化會改變支援的表單；清理會重設已宣告的中繼資料。"], ["相關工具", "從 PDF 分類開啟遮蔽、清理、驗證和解鎖。本機任務留在分頁。密碼和 OCR 是伺服器任務，結果預設保留 15 分鐘。"]],
  es: [["Recortar no es redactar", "Usa Recortar PDF solo para el recuadro visible. Usa Redactar PDF cuando el texto subyacente deba desaparecer. Aplanar cambia formularios compatibles; limpiar restablece metadatos declarados."], ["Herramientas relacionadas", "Abre Redactar, Limpiar, Verificar y Desbloquear desde el hub PDF. Las tareas locales se quedan en la pestaña. Contraseña y OCR son tareas de servidor con TTL de 15 minutos."]],
  "pt-BR": [["Recortar não é redigir", "Use Recortar PDF só para a caixa visível. Use Redigir PDF quando o texto subjacente precisa sumir. Achatar muda formulários suportados; limpar redefine metadados declarados."], ["Ferramentas relacionadas", "Abra Redigir, Limpar, Verificar e Desbloquear no hub de PDF. Tarefas locais ficam na aba. Senha e OCR são tarefas no servidor com TTL de 15 minutos."]],
  de: [["Zuschneiden ist keine Schwärzung", "Zuschneiden ändert nur den sichtbaren Rahmen. Schwärzen, wenn der zugrunde liegende Text weg muss. Reduzieren ändert unterstützte Formulare; Bereinigen setzt deklarierte Metadaten zurück."], ["Verwandte Werkzeuge", "Öffne Schwärzen, Bereinigen, Prüfen und Entsperren im PDF-Bereich. Lokale Aufgaben bleiben im Tab. Passwort und OCR sind Serveraufgaben mit 15-Minuten-TTL."]],
  fr: [["Recadrer n’est pas caviarder", "Recadrer un PDF ne change que le cadre visible. Caviarder quand le texte sous-jacent doit disparaître. Aplatir change les formulaires pris en charge ; nettoyer réinitialise les métadonnées déclarées."], ["Outils associés", "Ouvrez Caviarder, Nettoyer, Vérifier et Déverrouiller depuis le pôle PDF. Les tâches locales restent dans l’onglet. Mot de passe et OCR sont des tâches serveur avec un TTL de 15 minutes."]],
  ja: [["クロップは墨消しではない", "クロップ PDF は見える枠だけを変えます。下の文字を消す必要があるときは墨消しを使います。フラット化は対応フォームを変え、サニタイズは宣言済みメタデータをリセットします。"], ["関連ツール", "PDF ハブから墨消し、サニタイズ、検証、ロック解除を開きます。ローカル作業はタブ内に留まります。パスワードと OCR はサーバー作業で、結果は 15 分間残ります。"]],
  ko: [["자르기는 삭제가 아닙니다", "PDF 자르기는 보이는 상자만 바꿉니다. 아래 글자를 없애야 하면 삭제를 쓰세요. 평면화는 지원 양식을 바꾸고, 정리는 선언된 메타데이터를 초기화합니다."], ["관련 도구", "PDF 허브에서 삭제, 정리, 검증, 잠금 해제를 여세요. 로컬 작업은 탭에 남습니다. 비밀번호와 OCR은 서버 작업이며 결과는 15분 TTL입니다."]],
  it: [["Ritagliare non è oscurare", "Ritaglia PDF cambia solo il riquadro visibile. Usa Oscura PDF quando il testo sottostante deve sparire. Appiattire cambia i moduli supportati; igienizzare reimposta i metadati dichiarati."], ["Strumenti correlati", "Apri Oscura, Igienizza, Verifica e Sblocca dall’hub PDF. Le attività locali restano nella scheda. Password e OCR sono lavori server con TTL di 15 minuti."]],
  tr: [["Kırpmak redaksiyon değildir", "PDF Kırp yalnızca görünür kutuyu değiştirir. Alttaki yazı gitmeliyse Redakte PDF kullanın. Düzleştirme desteklenen formları değiştirir; temizleme bildirilen üst veriyi sıfırlar."], ["İlgili araçlar", "PDF merkezinden Redakte, Temizle, Doğrula ve Kilidi Aç’ı açın. Yerel işler sekmede kalır. Parola ve OCR 15 dakikalık TTL ile sunucu işleridir."]],
  vi: [["Cắt không phải che", "Cắt PDF chỉ đổi khung nhìn thấy. Dùng Che PDF khi chữ bên dưới phải mất. Làm phẳng đổi biểu mẫu được hỗ trợ; dọn đặt lại siêu dữ liệu đã khai báo."], ["Công cụ liên quan", "Mở Che, Dọn, Xác minh và Mở khóa từ trung tâm PDF. Tác vụ cục bộ ở lại thẻ. Mật khẩu và OCR là việc máy chủ với TTL 15 phút."]],
  nl: [["Bijsnijden is geen redigeren", "PDF bijsnijden verandert alleen het zichtbare kader. Gebruik Redigeren als de onderliggende tekst weg moet. Afvlakken verandert ondersteunde formulieren; opschonen zet gedeclareerde metadata terug."], ["Gerelateerde tools", "Open Redigeren, Opschonen, Verifiëren en Ontgrendelen in de PDF-hub. Lokale taken blijven in het tabblad. Wachtwoord en OCR zijn servertaken met een TTL van 15 minuten."]],
  pl: [["Przycinanie to nie redakcja", "Przytnij PDF zmienia tylko widoczną ramkę. Użyj Redaguj PDF, gdy tekst pod spodem musi zniknąć. Spłaszczanie zmienia obsługiwane formularze; czyszczenie resetuje zadeklarowane metadane."], ["Powiązane narzędzia", "Otwórz Redaguj, Wyczyść, Zweryfikuj i Odblokuj w centrum PDF. Zadania lokalne zostają w karcie. Hasło i OCR to zadania serwerowe z TTL 15 minut."]],
  th: [["การครอบไม่ใช่การลบข้อความ", "ครอบ PDF เปลี่ยนแค่กรอบที่เห็น ใช้ลบข้อความเมื่อตัวอักษรด้านล่างต้องหาย การทำให้แบนเปลี่ยนฟอร์มที่รองรับ การทำความสะอาดรีเซ็ตเมทาดาทาที่ประกาศไว้"], ["เครื่องมือที่เกี่ยวข้อง", "เปิด ลบข้อความ ทำความสะอาด ตรวจสอบ และปลดล็อก จากศูนย์ PDF งานในเครื่องคงอยู่ในแท็บ รหัสผ่านและ OCR เป็นงานเซิร์ฟเวอร์ TTL 15 นาที"]],
};

const guideImage: Record<Locale, GuideExtras> = {
  en: [["Pick a format for the destination", "PNG keeps crisp edges and transparency. JPEG suits photographs. WebP is the default modern web format. AVIF is smaller where the pipeline accepts it. Resize before you compress."], ["Related tools", "Open Image Compressor, Compress PNG, PNG to WebP and SVG to PNG from the image and SVG hubs. The result summary shows size even when a conversion gets larger."]],
  "zh-CN": [["按用途选择格式", "PNG 适合清晰边缘和透明。JPEG 适合照片。WebP 是现代网页的默认格式。流程支持时 AVIF 更小。先调整尺寸再压缩。"], ["相关工具", "从图片和 SVG 分类打开图片压缩、压缩 PNG、PNG 转 WebP、SVG 转 PNG。结果摘要会显示体积，即使转换后变大。"]],
  "zh-TW": [["依用途選擇格式", "PNG 適合清晰邊緣與透明。JPEG 適合照片。WebP 是現代網頁的預設格式。流程支援時 AVIF 更小。先調整尺寸再壓縮。"], ["相關工具", "從圖片與 SVG 分類開啟圖片壓縮、壓縮 PNG、PNG 轉 WebP、SVG 轉 PNG。結果摘要會顯示體積，即使轉換後變大。"]],
  es: [["Elige el formato del destino", "PNG conserva bordes nítidos y transparencia. JPEG encaja en fotografías. WebP es el formato web moderno por defecto. AVIF es más pequeño si el flujo lo admite. Redimensiona antes de comprimir."], ["Herramientas relacionadas", "Abre Compresor de imágenes, Comprimir PNG, PNG a WebP y SVG a PNG. El resumen muestra el tamaño aunque la conversión sea mayor."]],
  "pt-BR": [["Escolha o formato do destino", "PNG mantém bordas nítidas e transparência. JPEG serve para fotos. WebP é o formato web moderno padrão. AVIF fica menor quando o fluxo aceita. Redimensione antes de comprimir."], ["Ferramentas relacionadas", "Abra o Compressor de imagens, Comprimir PNG, PNG para WebP e SVG para PNG. O resumo mostra o tamanho mesmo quando a conversão aumenta."]],
  de: [["Format nach Ziel wählen", "PNG hält Kanten und Transparenz. JPEG passt zu Fotos. WebP ist das moderne Standard-Webformat. AVIF ist kleiner, wenn die Pipeline es akzeptiert. Vor dem Komprimieren skalieren."], ["Verwandte Werkzeuge", "Öffne Bildkompressor, PNG komprimieren, PNG zu WebP und SVG zu PNG. Die Zusammenfassung zeigt die Größe auch wenn die Konvertierung größer wird."]],
  fr: [["Choisir le format selon la destination", "PNG garde des bords nets et la transparence. JPEG convient aux photos. WebP est le format web moderne par défaut. AVIF est plus petit si la chaîne l’accepte. Redimensionnez avant de compresser."], ["Outils associés", "Ouvrez Compresseur d’images, Compresser PNG, PNG vers WebP et SVG vers PNG. Le résumé affiche la taille même si la conversion agrandit le fichier."]],
  ja: [["用途に合わせて形式を選ぶ", "PNG は輪郭と透明を保ちます。JPEG は写真向きです。WebP は現代の Web の標準です。パイプラインが対応していれば AVIF はより小さくなります。圧縮の前にサイズを合わせてください。"], ["関連ツール", "画像と SVG ハブから画像圧縮、PNG 圧縮、PNG から WebP、SVG から PNG を開きます。変換後に大きくなっても、結果の要約にサイズが出ます。"]],
  ko: [["목적에 맞는 형식을 고르세요", "PNG는 선명한 가장자리와 투명도를 지킵니다. JPEG는 사진에 맞습니다. WebP는 기본 현대 웹 형식입니다. 파이프라인이 받으면 AVIF가 더 작습니다. 압축 전에 크기를 맞추세요."], ["관련 도구", "이미지와 SVG 허브에서 이미지 압축, PNG 압축, PNG→WebP, SVG→PNG를 여세요. 변환 후 커져도 결과 요약에 크기가 나옵니다."]],
  it: [["Scegli il formato in base alla destinazione", "PNG mantiene bordi netti e trasparenza. JPEG va per le foto. WebP è il formato web moderno predefinito. AVIF è più piccolo se la pipeline lo accetta. Ridimensiona prima di comprimere."], ["Strumenti correlati", "Apri Compressore immagini, Comprimi PNG, PNG in WebP e SVG in PNG. Il riepilogo mostra la dimensione anche se la conversione ingrandisce il file."]],
  tr: [["Hedefe göre biçim seçin", "PNG keskin kenar ve saydamlığı korur. JPEG fotoğraflara uyar. WebP varsayılan modern web biçimidir. Boru hattı kabul ederse AVIF daha küçüktür. Sıkıştırmadan önce yeniden boyutlandırın."], ["İlgili araçlar", "Görüntü ve SVG merkezinden Görüntü sıkıştırıcı, PNG sıkıştır, PNG’den WebP ve SVG’den PNG’yi açın. Dönüşüm büyüse bile özet boyutu gösterir."]],
  vi: [["Chọn định dạng theo đích", "PNG giữ cạnh sắc và trong suốt. JPEG hợp ảnh. WebP là định dạng web hiện đại mặc định. AVIF nhỏ hơn khi chuỗi chấp nhận. Đổi kích thước trước khi nén."], ["Công cụ liên quan", "Mở Nén ảnh, Nén PNG, PNG sang WebP và SVG sang PNG. Tóm tắt vẫn hiện kích thước khi chuyển đổi làm file lớn hơn."]],
  nl: [["Kies het formaat bij de bestemming", "PNG houdt scherpe randen en transparantie. JPEG past bij foto’s. WebP is het moderne standaardwebformaat. AVIF is kleiner als de keten het accepteert. Schaal vóór comprimeren."], ["Gerelateerde tools", "Open Afbeeldingscompressor, PNG comprimeren, PNG naar WebP en SVG naar PNG. De samenvatting toont de grootte ook als de conversie groter wordt."]],
  pl: [["Dobierz format do celu", "PNG zachowuje ostre krawędzie i przezroczystość. JPEG pasuje do zdjęć. WebP to domyślny nowoczesny format WWW. AVIF jest mniejszy, gdy łańcuch go przyjmuje. Zmień rozmiar przed kompresją."], ["Powiązane narzędzia", "Otwórz Kompresor obrazów, Kompresuj PNG, PNG do WebP i SVG do PNG. Podsumowanie pokazuje rozmiar nawet gdy konwersja powiększa plik."]],
  th: [["เลือกชนิดไฟล์ตามปลายทาง", "PNG คงขอบคมและความโปร่งใส JPEG เหมาะกับภาพถ่าย WebP เป็นชนิดเว็บสมัยใหม่ตั้งต้น AVIF เล็กกว่าเมื่อสายงานรับได้ ปรับขนาดก่อนบีบอัด"], ["เครื่องมือที่เกี่ยวข้อง", "เปิด ตัวบีบอัดรูป บีบ PNG PNG เป็น WebP และ SVG เป็น PNG จากศูนย์รูปและ SVG สรุปผลยังแสดงขนาดแม้การแปลงจะทำให้ไฟล์ใหญ่ขึ้น"]],
};

export function getAboutExtras(locale: Locale) { return about[locale]; }
export function getContactExtras(locale: Locale) { return contact[locale]; }
export function getGuideExtras(locale: Locale, slug: string): GuideExtras {
  return slug === "pdf-privacy-basics" ? guidePdf[locale] : guideImage[locale];
}

export const maintenanceCopy: Record<Locale, { title: string; body: string }> = {
  en: { title: "This tool is not accepting new tasks right now.", body: "Existing results remain available; please try again later." },
  "zh-CN": { title: "该工具暂时不接受新任务。", body: "已有结果仍可使用，请稍后再试。" },
  "zh-TW": { title: "此工具暫時不接受新任務。", body: "既有結果仍可使用，請稍後再試。" },
  es: { title: "Esta herramienta no acepta tareas nuevas por ahora.", body: "Los resultados existentes siguen disponibles; inténtalo más tarde." },
  "pt-BR": { title: "Esta ferramenta não aceita novas tarefas no momento.", body: "Os resultados existentes continuam disponíveis; tente de novo mais tarde." },
  de: { title: "Dieses Werkzeug nimmt derzeit keine neuen Aufgaben an.", body: "Vorhandene Ergebnisse bleiben verfügbar; bitte später erneut versuchen." },
  fr: { title: "Cet outil n’accepte pas de nouvelles tâches pour le moment.", body: "Les résultats existants restent disponibles ; réessayez plus tard." },
  ja: { title: "現在、このツールでは新しいタスクを受け付けていません。", body: "既存の結果は利用できます。しばらくしてから再試行してください。" },
  ko: { title: "현재 이 도구는 새 작업을 받지 않습니다.", body: "기존 결과는 사용할 수 있습니다. 나중에 다시 시도하세요." },
  it: { title: "Questo strumento non accetta nuove attività al momento.", body: "I risultati esistenti restano disponibili; riprova più tardi." },
  tr: { title: "Bu araç şu anda yeni görev kabul etmiyor.", body: "Mevcut sonuçlar duruyor; lütfen daha sonra yeniden deneyin." },
  vi: { title: "Công cụ này hiện không nhận tác vụ mới.", body: "Kết quả hiện có vẫn dùng được; hãy thử lại sau." },
  nl: { title: "Deze tool accepteert nu geen nieuwe taken.", body: "Bestaande resultaten blijven beschikbaar; probeer het later opnieuw." },
  pl: { title: "To narzędzie nie przyjmuje teraz nowych zadań.", body: "Istniejące wyniki pozostają dostępne; spróbuj ponownie później." },
  th: { title: "เครื่องมือนี้ยังไม่รับงานใหม่ในตอนนี้", body: "ผลลัพธ์ที่มีอยู่ยังใช้ได้ โปรดลองใหม่ภายหลัง" },
};
