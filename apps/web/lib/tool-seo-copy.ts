import type { Locale, Tool } from "@hxsl/tool-registry";
import { getLocalizedOptionLabel, getLocalizedToolDescription, getLocalizedToolName, getToolFaq } from "./i18n";
import { getConfiguredToolLimits } from "../../../config/site";

export type ToolSeoCopy = {
  intro: string;
  steps: string[];
  faq: Array<{ question: string; answer: string }>;
  parameterHelp: string;
  privacyText: string;
  resultText: string;
  metaDescription: string;
};

type SeoUi = {
  local: string;
  server: string;
  hybrid: string;
  limits: string;
  pages: string;
  pixels: string;
  stepAdd: string;
  stepOptions: string;
  stepNoOptions: string;
  stepCheck: string;
  result: string;
  controls: string;
  intro: string;
  keepSmaller: string;
  serverGeneric: string;
  typeCheck: string;
};

const ui: Record<Locale, SeoUi> = {
  en: {
    local: "This task runs in the current browser tab and does not upload automatically.",
    server: "This task uses a server engine. You must consent before upload. Results expire after 15 minutes.",
    hybrid: "This task is hybrid: the browser handles what it can; server work requires explicit consent.",
    limits: "Limits: {files} file(s), {mb} MB each{pages}{pixels}.",
    pages: ", {count} pages",
    pixels: ", {count} decoded pixels",
    stepAdd: "Add a supported {input} file. The real type is checked before {name} runs, not only the extension.",
    stepOptions: "Use the controls that belong to this task: {options}. Files over the stated limits are rejected.",
    stepNoOptions: "There are no extra options. Add a supported file and process it.",
    stepCheck: "Check size, format and page or pixel counts on the result before downloading. Compression tasks keep the original when they do not save space.",
    result: "{name} re-checks the output before download. {note}",
    controls: "{name} controls: {options}. {limits}",
    intro: "{name} accepts {input} and writes {output}. {mode} {limits} {note}",
    keepSmaller: "If the result is not smaller, the original bytes are kept.",
    serverGeneric: "Server engines include qpdf, Poppler, Tesseract or LibreOffice depending on the task.",
    typeCheck: "The actual file type is checked before processing, not only the extension.",
  },
  "zh-CN": {
    local: "此任务在当前浏览器标签页运行，不会自动上传。",
    server: "此任务使用服务端引擎，上传前必须明确同意，结果默认 15 分钟后删除。",
    hybrid: "此任务是混合模式：浏览器能做的在本地完成，服务端步骤需要同意。",
    limits: "限制：最多 {files} 个文件，每个 {mb} MB{pages}{pixels}。",
    pages: "，最多 {count} 页",
    pixels: "，解码像素不超过 {count}",
    stepAdd: "添加受支持的 {input}。处理前会核对真实文件类型，而不是只看扩展名。",
    stepOptions: "仅在需要时使用：{options}。超出限制的文件会被拒绝。",
    stepNoOptions: "此任务没有额外选项。添加文件后即可处理。",
    stepCheck: "检查结果的大小、格式和页数/尺寸后再下载。压缩类任务如果没有变小会保留原文件。",
    result: "{name} 会在下载前复查输出。{note}",
    controls: "{name} 的控件：{options}。{limits}",
    intro: "{name} 接受 {input}，生成 {output}。{mode} {limits} {note}",
    keepSmaller: "如果结果没有变小，会保留原文件。",
    serverGeneric: "服务端引擎按任务可能是 qpdf、Poppler、Tesseract 或 LibreOffice。",
    typeCheck: "处理前会检查实际文件类型，而不是只看扩展名。",
  },
  "zh-TW": {
    local: "此任務在目前瀏覽器分頁執行，不會自動上傳。",
    server: "此任務使用伺服器引擎，上傳前必須明確同意，結果預設 15 分鐘後刪除。",
    hybrid: "此任務是混合模式：瀏覽器能做的在本機完成，伺服器步驟需要同意。",
    limits: "限制：最多 {files} 個檔案，每個 {mb} MB{pages}{pixels}。",
    pages: "，最多 {count} 頁",
    pixels: "，解碼像素不超過 {count}",
    stepAdd: "加入支援的 {input}。處理前會核對真實檔案類型，而不只看副檔名。",
    stepOptions: "只在需要時使用：{options}。超出限制的檔案會被拒絕。",
    stepNoOptions: "此任務沒有額外選項。加入檔案後即可處理。",
    stepCheck: "檢查結果的大小、格式與頁數／尺寸後再下載。壓縮類任務若沒有變小會保留原檔。",
    result: "{name} 會在下載前覆核輸出。{note}",
    controls: "{name} 的控制項：{options}。{limits}",
    intro: "{name} 接受 {input}，產生 {output}。{mode} {limits} {note}",
    keepSmaller: "若結果沒有變小，會保留原檔。",
    serverGeneric: "伺服器引擎依任務可能是 qpdf、Poppler、Tesseract 或 LibreOffice。",
    typeCheck: "處理前會檢查實際檔案類型，而不只看副檔名。",
  },
  es: {
    local: "Esta tarea se ejecuta en la pestaña actual y no sube el archivo automáticamente.",
    server: "Esta tarea usa un motor de servidor. Debes dar consentimiento antes de subir. Los resultados caducan a los 15 minutos.",
    hybrid: "Esta tarea es híbrida: el navegador hace lo que puede; el servidor requiere consentimiento explícito.",
    limits: "Límites: {files} archivo(s), {mb} MB cada uno{pages}{pixels}.",
    pages: ", {count} páginas",
    pixels: ", {count} píxeles decodificados",
    stepAdd: "Añade un archivo {input} compatible. Se comprueba el tipo real antes de ejecutar {name}, no solo la extensión.",
    stepOptions: "Usa los controles de esta tarea: {options}. Se rechazan los archivos que superan los límites.",
    stepNoOptions: "No hay opciones extra. Añade un archivo compatible y procésalo.",
    stepCheck: "Comprueba tamaño, formato y páginas o píxeles del resultado antes de descargar. Si la compresión no ahorra espacio, se conserva el original.",
    result: "{name} vuelve a comprobar la salida antes de descargar. {note}",
    controls: "Controles de {name}: {options}. {limits}",
    intro: "{name} acepta {input} y genera {output}. {mode} {limits} {note}",
    keepSmaller: "Si el resultado no es más pequeño, se conservan los bytes originales.",
    serverGeneric: "Los motores de servidor incluyen qpdf, Poppler, Tesseract o LibreOffice según la tarea.",
    typeCheck: "El tipo real del archivo se comprueba antes de procesar, no solo la extensión.",
  },
  "pt-BR": {
    local: "Esta tarefa roda na aba atual e não envia o arquivo automaticamente.",
    server: "Esta tarefa usa um mecanismo no servidor. É preciso consentir antes do envio. Os resultados expiram em 15 minutos.",
    hybrid: "Esta tarefa é híbrida: o navegador faz o que consegue; o servidor exige consentimento explícito.",
    limits: "Limites: {files} arquivo(s), {mb} MB cada{pages}{pixels}.",
    pages: ", {count} páginas",
    pixels: ", {count} pixels decodificados",
    stepAdd: "Adicione um arquivo {input} compatível. O tipo real é conferido antes de {name} rodar, não só a extensão.",
    stepOptions: "Use os controles desta tarefa: {options}. Arquivos acima dos limites são recusados.",
    stepNoOptions: "Não há opções extras. Adicione um arquivo compatível e processe.",
    stepCheck: "Confira tamanho, formato e páginas ou pixels do resultado antes de baixar. Se a compactação não reduzir, o original é mantido.",
    result: "{name} confere a saída de novo antes do download. {note}",
    controls: "Controles de {name}: {options}. {limits}",
    intro: "{name} aceita {input} e gera {output}. {mode} {limits} {note}",
    keepSmaller: "Se o resultado não for menor, os bytes originais são mantidos.",
    serverGeneric: "Os mecanismos de servidor incluem qpdf, Poppler, Tesseract ou LibreOffice conforme a tarefa.",
    typeCheck: "O tipo real do arquivo é verificado antes do processamento, não só a extensão.",
  },
  de: {
    local: "Diese Aufgabe läuft im aktuellen Tab und lädt die Datei nicht automatisch hoch.",
    server: "Diese Aufgabe nutzt eine Server-Engine. Vor dem Upload ist Zustimmung nötig. Ergebnisse laufen nach 15 Minuten ab.",
    hybrid: "Diese Aufgabe ist hybrid: Der Browser macht, was er kann; Serverarbeit braucht ausdrückliche Zustimmung.",
    limits: "Grenzen: {files} Datei(en), je {mb} MB{pages}{pixels}.",
    pages: ", {count} Seiten",
    pixels: ", {count} dekodierte Pixel",
    stepAdd: "Füge eine unterstützte {input}-Datei hinzu. Der echte Typ wird vor {name} geprüft, nicht nur die Endung.",
    stepOptions: "Nutze die Steuerungen dieser Aufgabe: {options}. Dateien über den Grenzen werden abgelehnt.",
    stepNoOptions: "Es gibt keine Extraoptionen. Datei hinzufügen und verarbeiten.",
    stepCheck: "Prüfe Größe, Format und Seiten- oder Pixelzahl vor dem Download. Kompression behält das Original, wenn nichts gespart wird.",
    result: "{name} prüft die Ausgabe vor dem Download erneut. {note}",
    controls: "Steuerungen von {name}: {options}. {limits}",
    intro: "{name} akzeptiert {input} und erzeugt {output}. {mode} {limits} {note}",
    keepSmaller: "Wenn das Ergebnis nicht kleiner ist, bleiben die Originalbytes.",
    serverGeneric: "Server-Engines sind je nach Aufgabe qpdf, Poppler, Tesseract oder LibreOffice.",
    typeCheck: "Der tatsächliche Dateityp wird vor der Verarbeitung geprüft, nicht nur die Endung.",
  },
  fr: {
    local: "Cette tâche s’exécute dans l’onglet actuel et n’envoie pas le fichier automatiquement.",
    server: "Cette tâche utilise un moteur serveur. Un consentement est requis avant l’envoi. Les résultats expirent après 15 minutes.",
    hybrid: "Cette tâche est hybride : le navigateur fait ce qu’il peut ; le serveur exige un consentement explicite.",
    limits: "Limites : {files} fichier(s), {mb} Mo chacun{pages}{pixels}.",
    pages: ", {count} pages",
    pixels: ", {count} pixels décodés",
    stepAdd: "Ajoutez un fichier {input} pris en charge. Le type réel est vérifié avant {name}, pas seulement l’extension.",
    stepOptions: "Utilisez les commandes de cette tâche : {options}. Les fichiers au-delà des limites sont refusés.",
    stepNoOptions: "Pas d’option supplémentaire. Ajoutez un fichier pris en charge puis lancez le traitement.",
    stepCheck: "Vérifiez taille, format et pages ou pixels du résultat avant de télécharger. La compression garde l’original si elle n’économise rien.",
    result: "{name} revérifie la sortie avant le téléchargement. {note}",
    controls: "Commandes de {name} : {options}. {limits}",
    intro: "{name} accepte {input} et produit {output}. {mode} {limits} {note}",
    keepSmaller: "Si le résultat n’est pas plus petit, les octets d’origine sont conservés.",
    serverGeneric: "Les moteurs serveur comprennent qpdf, Poppler, Tesseract ou LibreOffice selon la tâche.",
    typeCheck: "Le type réel du fichier est vérifié avant le traitement, pas seulement l’extension.",
  },
  ja: {
    local: "この作業は現在のブラウザタブで実行され、自動ではアップロードしません。",
    server: "この作業はサーバーエンジンを使います。アップロード前に同意が必要です。結果は 15 分で期限切れになります。",
    hybrid: "この作業はハイブリッドです。ブラウザでできることはローカル、サーバー作業には明示的な同意が必要です。",
    limits: "制限：最大 {files} ファイル、各 {mb} MB{pages}{pixels}。",
    pages: "、最大 {count} ページ",
    pixels: "、デコード画素 {count} まで",
    stepAdd: "対応する {input} ファイルを追加します。{name} の実行前に実際の種類を確認し、拡張子だけには依存しません。",
    stepOptions: "この作業の操作だけを使います：{options}。制限を超えるファイルは拒否されます。",
    stepNoOptions: "追加オプションはありません。対応ファイルを追加して処理してください。",
    stepCheck: "ダウンロード前に結果のサイズ、形式、ページ数または画素数を確認します。圧縮で小さくならない場合は元ファイルを残します。",
    result: "{name} はダウンロード前に出力を再確認します。{note}",
    controls: "{name} の操作：{options}。{limits}",
    intro: "{name} は {input} を受け付け、{output} を出力します。{mode} {limits} {note}",
    keepSmaller: "結果が小さくならない場合は、元のバイトを残します。",
    serverGeneric: "サーバーエンジンは作業に応じて qpdf、Poppler、Tesseract、LibreOffice です。",
    typeCheck: "処理前に実際のファイル種類を確認し、拡張子だけには依存しません。",
  },
  ko: {
    local: "이 작업은 현재 브라우저 탭에서 실행되며 자동으로 업로드하지 않습니다.",
    server: "이 작업은 서버 엔진을 사용합니다. 업로드 전 동의가 필요합니다. 결과는 15분 후 만료됩니다.",
    hybrid: "이 작업은 하이브리드입니다. 브라우저가 할 수 있는 일은 로컬에서, 서버 작업은 명시적 동의가 필요합니다.",
    limits: "한도: 파일 {files}개, 각 {mb} MB{pages}{pixels}.",
    pages: ", 최대 {count}페이지",
    pixels: ", 디코드 픽셀 {count}",
    stepAdd: "지원되는 {input} 파일을 추가하세요. {name} 실행 전에 실제 형식을 확인하며 확장자만 보지 않습니다.",
    stepOptions: "이 작업의 컨트롤만 사용하세요: {options}. 한도를 넘는 파일은 거절됩니다.",
    stepNoOptions: "추가 옵션이 없습니다. 지원 파일을 넣고 처리하세요.",
    stepCheck: "다운로드 전에 결과의 크기, 형식, 페이지 또는 픽셀을 확인하세요. 압축이 공간을 아끼지 않으면 원본을 유지합니다.",
    result: "{name}은(는) 다운로드 전에 출력을 다시 확인합니다. {note}",
    controls: "{name} 컨트롤: {options}. {limits}",
    intro: "{name}은(는) {input}을(를) 받아 {output}을(를) 만듭니다. {mode} {limits} {note}",
    keepSmaller: "결과가 더 작지 않으면 원본 바이트를 유지합니다.",
    serverGeneric: "서버 엔진은 작업에 따라 qpdf, Poppler, Tesseract 또는 LibreOffice입니다.",
    typeCheck: "처리 전에 실제 파일 형식을 확인하며 확장자만 보지 않습니다.",
  },
  it: {
    local: "Questa attività gira nella scheda corrente e non carica il file automaticamente.",
    server: "Questa attività usa un motore server. Serve il consenso prima del caricamento. I risultati scadono dopo 15 minuti.",
    hybrid: "Questa attività è ibrida: il browser fa ciò che può; il server richiede consenso esplicito.",
    limits: "Limiti: {files} file, {mb} MB ciascuno{pages}{pixels}.",
    pages: ", {count} pagine",
    pixels: ", {count} pixel decodificati",
    stepAdd: "Aggiungi un file {input} supportato. Il tipo reale è verificato prima di {name}, non solo l’estensione.",
    stepOptions: "Usa i controlli di questa attività: {options}. I file oltre i limiti vengono rifiutati.",
    stepNoOptions: "Non ci sono opzioni extra. Aggiungi un file supportato e elaboralo.",
    stepCheck: "Controlla dimensione, formato e pagine o pixel del risultato prima di scaricare. La compressione tiene l’originale se non riduce lo spazio.",
    result: "{name} ricontrolla l’uscita prima del download. {note}",
    controls: "Controlli di {name}: {options}. {limits}",
    intro: "{name} accetta {input} e produce {output}. {mode} {limits} {note}",
    keepSmaller: "Se il risultato non è più piccolo, restano i byte originali.",
    serverGeneric: "I motori server includono qpdf, Poppler, Tesseract o LibreOffice a seconda dell’attività.",
    typeCheck: "Il tipo reale del file è verificato prima dell’elaborazione, non solo l’estensione.",
  },
  tr: {
    local: "Bu görev geçerli tarayıcı sekmesinde çalışır ve dosyayı kendiliğinden yüklemez.",
    server: "Bu görev bir sunucu motoru kullanır. Yüklemeden önce onay gerekir. Sonuçlar 15 dakika sonra dolanır.",
    hybrid: "Bu görev hibrittir: tarayıcı yapabildiğini yapar; sunucu işi açık onay ister.",
    limits: "Sınırlar: {files} dosya, her biri {mb} MB{pages}{pixels}.",
    pages: ", {count} sayfa",
    pixels: ", {count} çözülmüş piksel",
    stepAdd: "Desteklenen bir {input} dosyası ekleyin. {name} çalışmadan önce gerçek tür kontrol edilir, yalnızca uzantı değil.",
    stepOptions: "Bu görevin denetimlerini kullanın: {options}. Sınırı aşan dosyalar reddedilir.",
    stepNoOptions: "Ek seçenek yok. Desteklenen bir dosya ekleyip işleyin.",
    stepCheck: "İndirmeden önce sonucun boyutunu, biçimini ve sayfa ya da piksel sayısını kontrol edin. Sıkıştırma yer kazandırmazsa asıl dosya tutulur.",
    result: "{name} indirmeden önce çıktıyı yeniden kontrol eder. {note}",
    controls: "{name} denetimleri: {options}. {limits}",
    intro: "{name} {input} kabul eder ve {output} üretir. {mode} {limits} {note}",
    keepSmaller: "Sonuç daha küçük değilse orijinal baytlar tutulur.",
    serverGeneric: "Sunucu motorları göreve göre qpdf, Poppler, Tesseract veya LibreOffice olabilir.",
    typeCheck: "İşlemeden önce gerçek dosya türü kontrol edilir, yalnızca uzantı değil.",
  },
  vi: {
    local: "Tác vụ này chạy trong thẻ trình duyệt hiện tại và không tải tệp lên tự động.",
    server: "Tác vụ này dùng engine máy chủ. Cần đồng ý trước khi tải lên. Kết quả hết hạn sau 15 phút.",
    hybrid: "Tác vụ này lai: trình duyệt làm phần được; việc máy chủ cần đồng ý rõ.",
    limits: "Giới hạn: {files} tệp, mỗi tệp {mb} MB{pages}{pixels}.",
    pages: ", {count} trang",
    pixels: ", {count} pixel giải mã",
    stepAdd: "Thêm tệp {input} được hỗ trợ. Kiểu thật được kiểm trước khi {name} chạy, không chỉ phần mở rộng.",
    stepOptions: "Dùng điều khiển của tác vụ này: {options}. Tệp vượt giới hạn bị từ chối.",
    stepNoOptions: "Không có tùy chọn thêm. Thêm tệp được hỗ trợ rồi xử lý.",
    stepCheck: "Kiểm kích thước, định dạng và số trang hoặc pixel trước khi tải xuống. Nén giữ bản gốc nếu không tiết kiệm dung lượng.",
    result: "{name} kiểm lại đầu ra trước khi tải xuống. {note}",
    controls: "Điều khiển {name}: {options}. {limits}",
    intro: "{name} nhận {input} và tạo {output}. {mode} {limits} {note}",
    keepSmaller: "Nếu kết quả không nhỏ hơn, giữ byte gốc.",
    serverGeneric: "Engine máy chủ gồm qpdf, Poppler, Tesseract hoặc LibreOffice tùy tác vụ.",
    typeCheck: "Kiểu tệp thật được kiểm trước khi xử lý, không chỉ phần mở rộng.",
  },
  nl: {
    local: "Deze taak draait in het huidige browsertabblad en uploadt het bestand niet automatisch.",
    server: "Deze taak gebruikt een server-engine. Toestemming is nodig vóór upload. Resultaten verlopen na 15 minuten.",
    hybrid: "Deze taak is hybride: de browser doet wat kan; serverwerk vraagt uitdrukkelijke toestemming.",
    limits: "Limieten: {files} bestand(en), elk {mb} MB{pages}{pixels}.",
    pages: ", {count} pagina’s",
    pixels: ", {count} gedecodeerde pixels",
    stepAdd: "Voeg een ondersteund {input}-bestand toe. Het echte type wordt gecontroleerd vóór {name}, niet alleen de extensie.",
    stepOptions: "Gebruik de bediening van deze taak: {options}. Bestanden boven de limieten worden geweigerd.",
    stepNoOptions: "Geen extra opties. Voeg een ondersteund bestand toe en verwerk het.",
    stepCheck: "Controleer grootte, formaat en pagina’s of pixels van het resultaat vóór download. Compressie bewaart het origineel als er geen ruimte winst is.",
    result: "{name} controleert de uitvoer opnieuw vóór download. {note}",
    controls: "Bediening van {name}: {options}. {limits}",
    intro: "{name} accepteert {input} en maakt {output}. {mode} {limits} {note}",
    keepSmaller: "Als het resultaat niet kleiner is, blijven de originele bytes.",
    serverGeneric: "Server-engines zijn afhankelijk van de taak qpdf, Poppler, Tesseract of LibreOffice.",
    typeCheck: "Het echte bestandstype wordt vóór verwerking gecontroleerd, niet alleen de extensie.",
  },
  pl: {
    local: "To zadanie działa w bieżącej karcie i nie wysyła pliku automatycznie.",
    server: "To zadanie używa silnika serwera. Przed wysłaniem potrzebna jest zgoda. Wyniki wygasają po 15 minutach.",
    hybrid: "To zadanie jest hybrydowe: przeglądarka robi, co może; serwer wymaga wyraźnej zgody.",
    limits: "Limity: {files} plik(ów), po {mb} MB{pages}{pixels}.",
    pages: ", {count} stron",
    pixels: ", {count} zdekodowanych pikseli",
    stepAdd: "Dodaj obsługiwany plik {input}. Rzeczywisty typ jest sprawdzany przed {name}, nie tylko rozszerzenie.",
    stepOptions: "Użyj sterowania tego zadania: {options}. Pliki ponad limitami są odrzucane.",
    stepNoOptions: "Brak dodatkowych opcji. Dodaj obsługiwany plik i przetwórz.",
    stepCheck: "Sprawdź rozmiar, format oraz strony lub piksele wyniku przed pobraniem. Kompresja zachowuje oryginał, gdy nic nie oszczędza.",
    result: "{name} ponownie sprawdza wyjście przed pobraniem. {note}",
    controls: "Sterowanie {name}: {options}. {limits}",
    intro: "{name} przyjmuje {input} i tworzy {output}. {mode} {limits} {note}",
    keepSmaller: "Jeśli wynik nie jest mniejszy, zachowywane są oryginalne bajty.",
    serverGeneric: "Silniki serwera to w zależności od zadania qpdf, Poppler, Tesseract lub LibreOffice.",
    typeCheck: "Rzeczywisty typ pliku jest sprawdzany przed przetwarzaniem, nie tylko rozszerzenie.",
  },
  th: {
    local: "งานนี้รันในแท็บเบราว์เซอร์ปัจจุบัน และไม่อัปโหลดไฟล์โดยอัตโนมัติ",
    server: "งานนี้ใช้เอนจินเซิร์ฟเวอร์ ต้องยินยอมก่อนอัปโหลด ผลลัพธ์หมดอายุใน 15 นาที",
    hybrid: "งานนี้เป็นแบบผสม เบราว์เซอร์ทำส่วนที่ทำได้ งานเซิร์ฟเวอร์ต้องยินยอมชัดเจน",
    limits: "ขีดจำกัด: {files} ไฟล์ ไฟล์ละ {mb} MB{pages}{pixels}",
    pages: ", {count} หน้า",
    pixels: ", พิกเซลถอดรหัส {count}",
    stepAdd: "เพิ่มไฟล์ {input} ที่รองรับ จะตรวจชนิดจริงก่อนรัน {name} ไม่ดูแค่นามสกุล",
    stepOptions: "ใช้ตัวควบคุมของงานนี้: {options} ไฟล์ที่เกินขีดจำกัดจะถูกปฏิเสธ",
    stepNoOptions: "ไม่มีตัวเลือกเพิ่ม เพิ่มไฟล์ที่รองรับแล้วประมวลผล",
    stepCheck: "ตรวจขนาด ชนิด และจำนวนหน้าหรือพิกเซลก่อนดาวน์โหลด งานบีบอัดเก็บต้นฉบับเมื่อไม่ประหยัดพื้นที่",
    result: "{name} ตรวจผลอีกครั้งก่อนดาวน์โหลด {note}",
    controls: "ตัวควบคุม {name}: {options} {limits}",
    intro: "{name} รับ {input} และสร้าง {output} {mode} {limits} {note}",
    keepSmaller: "ถ้าผลไม่เล็กลง จะเก็บไบต์ต้นฉบับ",
    serverGeneric: "เอนจินเซิร์ฟเวอร์ตามงานคือ qpdf, Poppler, Tesseract หรือ LibreOffice",
    typeCheck: "ตรวจชนิดไฟล์จริงก่อนประมวลผล ไม่ดูแค่นามสกุล",
  },
};

const honesty: Record<string, Partial<Record<Locale, string>>> = {
  "merge-pdf": {
    en: "Pages keep their original size. Bookmarks and some interactive features may not survive a merge.",
    ja: "ページサイズは維持されます。しおりや一部の操作は結合後に残らないことがあります。",
    "zh-CN": "页面尺寸会保留。书签和部分交互功能在合并后可能丢失。",
  },
  "split-pdf": {
    en: "Empty documents are never produced. Ranges must stay inside the page count.",
    ja: "空の文書は作りません。範囲はページ数の内側に収める必要があります。",
    "zh-CN": "不会生成空文档。范围必须落在页数之内。",
  },
  "unlock-pdf": {
    en: "Unlock only works with a password you are allowed to use. It is a server qpdf task, not a cracker.",
    ja: "ロック解除は使う権限のあるパスワードでのみ動作します。クラックではなくサーバーの qpdf 作業です。",
    "zh-CN": "解锁只适用于你有权使用的密码。这是服务端 qpdf 任务，不是破解。",
  },
  "protect-pdf": {
    en: "Encryption uses qpdf AES-256. Forgotten passwords cannot be recovered from HXSL Tools.",
    ja: "暗号化は qpdf の AES-256 です。忘れたパスワードは HXSL Tools では復元できません。",
    "zh-CN": "加密使用 qpdf AES-256。HXSL Tools 无法找回忘记的密码。",
  },
  "pdf-ocr": {
    en: "OCR is approximate and runs on the server with Tesseract. Scans beat born-digital text extraction.",
    ja: "OCR は近似で、サーバーの Tesseract で実行します。スキャン原稿はテキスト抽出よりこちら向きです。",
    "zh-CN": "OCR 是近似结果，在服务端用 Tesseract 运行。扫描件更适合 OCR，而不是直接抽文本。",
  },
  "pdf-to-text": {
    en: "Selectable PDF text is extracted. Scanned pages without a text layer need PDF OCR instead.",
    ja: "選択できる PDF テキストを抽出します。テキスト層のないスキャンは PDF OCR を使ってください。",
    "zh-CN": "会提取可选中的 PDF 文本。没有文本层的扫描页请改用 PDF OCR。",
  },
  "redact-pdf": {
    en: "Redaction rebuilds pixels so source text is not kept. Cropping is a different, weaker job.",
    ja: "墨消しは画素を作り直し、元の文字を残しません。クロップは別の、より弱い作業です。",
    "zh-CN": "涂黑会重建像素，不保留源文本。裁切是另一项更弱的操作。",
  },
  "crop-pdf": {
    en: "Cropping changes the visible page box. It does not delete the underlying content the way redaction does.",
    ja: "クロップは見えるページ枠を変えるだけで、墨消しのように下の内容は消しません。",
    "zh-CN": "裁切只改变可见页面框，不会像涂黑那样删除底层内容。",
  },
  "image-compressor": {
    en: "Each file in a batch is independent. If compression does not save size, the original bytes are kept.",
    ja: "バッチ内の各ファイルは独立です。圧縮で小さくならない場合は元のバイトを残します。",
    "zh-CN": "批次中的每个文件彼此独立。压缩没有变小时会保留原文件。",
  },
  "icon-pack": {
    en: "Exports ICO, favicon, PWA and Android launcher sizes with fit, padding and background controls.",
    ja: "フィット、余白、背景の操作付きで ICO、favicon、PWA、Android ランチャーサイズを書き出します。",
    "zh-CN": "按适配、边距和背景导出 ICO、网站图标、PWA 和 Android 启动器尺寸。",
  },
};

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

function modeSentence(locale: Locale, mode: Tool["processingMode"]): string {
  const pack = ui[locale];
  return mode === "local" ? pack.local : mode === "server" ? pack.server : pack.hybrid;
}

function honestyFor(locale: Locale, tool: Tool): string {
  const pack = ui[locale];
  const mapped = honesty[tool.slug];
  if (mapped?.[locale]) return mapped[locale]!;
  if (mapped?.en && locale === "en") return mapped.en;
  if (mapped?.en && locale.startsWith("zh") && mapped["zh-CN"] && locale === "zh-TW") return mapped["zh-CN"]!;
  if (mapped?.[locale === "zh-TW" ? "zh-CN" : locale]) return mapped[locale === "zh-TW" ? "zh-CN" : locale]!;
  if (mapped?.en && !["en", "zh-CN", "zh-TW", "ja"].includes(locale)) {
    // Prefer a localized generic note over leftover English on other locales.
  }
  if (mapped?.ja && locale === "ja") return mapped.ja;
  if (mapped?.en && locale === "en") return mapped.en;
  if (mapped?.["zh-CN"] && locale.startsWith("zh")) return mapped["zh-CN"]!;
  if (mapped?.ja && locale === "ja") return mapped.ja;
  if (tool.slug.startsWith("compress")) return pack.keepSmaller;
  if (tool.processingMode === "server") return pack.serverGeneric;
  if (mapped?.en) {
    // Last resort for locales without a dedicated honesty line: use local generic, not English.
    return pack.typeCheck;
  }
  return pack.typeCheck;
}

export function getToolSeoCopy(locale: Locale, tool: Tool): ToolSeoCopy {
  const pack = ui[locale];
  const name = getLocalizedToolName(locale, tool);
  const short = getLocalizedToolDescription(locale, tool);
  const limits = getConfiguredToolLimits(tool);
  const joiner = locale === "ja" || locale.startsWith("zh") || locale === "ko" || locale === "th" ? "、" : ", ";
  const input = tool.inputFormats.join(joiner);
  const output = tool.outputFormats.join(joiner);
  const options = tool.optionSchema.map((option) => getLocalizedOptionLabel(locale, option.label));
  const note = honestyFor(locale, tool);
  const mode = modeSentence(locale, tool.processingMode);
  const pages = limits.maxPages ? fill(pack.pages, { count: limits.maxPages }) : "";
  const pixels = limits.maxPixels ? fill(pack.pixels, { count: limits.maxPixels }) : "";
  const limitLine = fill(pack.limits, { files: limits.maxFiles ?? 1, mb: limits.maxMb ?? 8, pages, pixels });
  const intro = `${short} ${fill(pack.intro, { name, input, output, mode, limits: limitLine, note })}`.trim();
  const steps = [
    fill(pack.stepAdd, { name, input }),
    options.length ? fill(pack.stepOptions, { options: options.join(joiner) }) : pack.stepNoOptions,
    pack.stepCheck,
  ];
  const baseFaq = getToolFaq(locale, tool).map((item, index) => {
    if (index === 0) return { ...item, answer: `${item.answer} ${note}` };
    if (index === 1) return { ...item, answer: `${item.answer} ${mode}` };
    return { ...item, answer: `${item.answer} ${limitLine}` };
  });
  const resultText = fill(pack.result, { name, note });
  const parameterHelp = options.length ? fill(pack.controls, { name, options: options.join(joiner), limits: limitLine }) : limitLine;
  return { intro, steps, faq: baseFaq, parameterHelp, privacyText: mode, resultText, metaDescription: `${intro.slice(0, 155).trim()}…` };
}
