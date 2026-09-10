import type { Locale } from "@hxsl/tool-registry";

const clientPattern = /^ca-pub-\d{10,22}$/;

export function parseAdsenseClient(value: string | undefined): string {
  const client = value?.trim() ?? "";
  return clientPattern.test(client) ? client : "";
}

export function adsensePublisherId(client: string): string {
  return client.replace(/^ca-/, "");
}

export function adsAreEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.ENABLE_ADS === "true" && Boolean(parseAdsenseClient(env.GOOGLE_ADSENSE_CLIENT));
}

export const adsConfig = {
  get enabled() { return adsAreEnabled(); },
  get client() { return parseAdsenseClient(process.env.GOOGLE_ADSENSE_CLIENT); },
  get slot() { return process.env.GOOGLE_ADSENSE_SLOT?.trim() ?? ""; },
  get autoAds() { return process.env.GOOGLE_ADSENSE_AUTO_ADS !== "false"; },
  get scriptSrc() {
    const client = parseAdsenseClient(process.env.GOOGLE_ADSENSE_CLIENT);
    return client ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}` : "";
  },
};

const adsNotice: Record<Locale, string> = {
  en: "When ads are enabled for this deployment, Google AdSense scripts and cookies may load on public pages. File bytes from local tools are still not uploaded for advertising.",
  "zh-CN": "若此部署开启广告，公开页面可能加载 Google AdSense 脚本和 Cookie。本地工具中的文件内容仍不会为广告而上传。",
  "zh-TW": "若此部署開啟廣告，公開頁面可能載入 Google AdSense 指令碼與 Cookie。本機工具中的檔案內容仍不會為廣告而上傳。",
  es: "Si los anuncios están activos en esta implementación, las páginas públicas pueden cargar scripts y cookies de Google AdSense. Los bytes de archivos de las herramientas locales no se suben para publicidad.",
  "pt-BR": "Se os anúncios estiverem ativos nesta implantação, as páginas públicas podem carregar scripts e cookies do Google AdSense. Os bytes dos arquivos nas ferramentas locais não são enviados para publicidade.",
  de: "Wenn Werbung in dieser Bereitstellung aktiv ist, können öffentliche Seiten Google-AdSense-Skripte und Cookies laden. Dateibytes lokaler Werkzeuge werden nicht für Werbung hochgeladen.",
  fr: "Si les publicités sont activées sur ce déploiement, les pages publiques peuvent charger des scripts et cookies Google AdSense. Les octets des fichiers des outils locaux ne sont pas envoyés pour la publicité.",
  ja: "このデプロイで広告が有効な場合、公開ページは Google AdSense のスクリプトと Cookie を読み込むことがあります。ローカルツールのファイル内容は広告のためにアップロードしません。",
  ko: "이 배포에서 광고가 켜져 있으면 공개 페이지가 Google AdSense 스크립트와 쿠키를 불러올 수 있습니다. 로컬 도구의 파일 바이트는 광고를 위해 업로드되지 않습니다.",
  it: "Se gli annunci sono attivi in questo deployment, le pagine pubbliche possono caricare script e cookie di Google AdSense. I byte dei file degli strumenti locali non vengono caricati per la pubblicità.",
  tr: "Bu dağıtımda reklamlar açıksa, herkese açık sayfalar Google AdSense betikleri ve çerezleri yükleyebilir. Yerel araçlardaki dosya baytları reklam için yüklenmez.",
  vi: "Nếu quảng cáo bật trên bản triển khai này, trang công khai có thể tải script và cookie Google AdSense. Byte tệp của công cụ cục bộ không được tải lên cho quảng cáo.",
  nl: "Als advertenties op deze deploy aan staan, kunnen openbare pagina’s Google AdSense-scripts en cookies laden. Bestandbytes van lokale tools worden niet voor reclame geüpload.",
  pl: "Jeśli reklamy są włączone w tym wdrożeniu, strony publiczne mogą wczytać skrypty i pliki cookie Google AdSense. Bajty plików z narzędzi lokalnych nie są wysyłane do reklam.",
  th: "หากโฆษณาเปิดในการติดตั้งนี้ หน้าสาธารณะอาจโหลดสคริปต์และคุกกี้ Google AdSense ไบต์ไฟล์จากเครื่องมือในเครื่องจะไม่ถูกอัปโหลดเพื่อโฆษณา",
};

const adsLegal: Record<Locale, string> = {
  en: "Built for local-first work. This deployment may load Google AdSense on public pages.",
  "zh-CN": "为本地优先处理而建。此部署可能在公开页面加载 Google AdSense。",
  "zh-TW": "為本機優先處理而建。此部署可能在公開頁面載入 Google AdSense。",
  es: "Creado para el trabajo local. Esta implementación puede cargar Google AdSense en páginas públicas.",
  "pt-BR": "Feito para o trabalho local. Esta implantação pode carregar o Google AdSense em páginas públicas.",
  de: "Für lokale Verarbeitung gebaut. Diese Instanz kann Google AdSense auf öffentlichen Seiten laden.",
  fr: "Conçu pour le traitement local. Ce déploiement peut charger Google AdSense sur les pages publiques.",
  ja: "ローカル優先のために設計。この公開ページでは Google AdSense を読み込むことがあります。",
  ko: "로컬 우선 처리. 이 배포는 공개 페이지에 Google AdSense를 불러올 수 있습니다.",
  it: "Elaborazione locale prima di tutto. Questo deployment può caricare Google AdSense sulle pagine pubbliche.",
  tr: "Yerel öncelikli iş için. Bu dağıtım herkese açık sayfalarda Google AdSense yükleyebilir.",
  vi: "Ưu tiên xử lý cục bộ. Bản triển khai này có thể tải Google AdSense trên trang công khai.",
  nl: "Gebouwd voor lokaal-eerst werk. Deze deploy kan Google AdSense op openbare pagina’s laden.",
  pl: "Zbudowane pod pracę lokalną. To wdrożenie może wczytać Google AdSense na stronach publicznych.",
  th: "ออกแบบให้ทำงานในเครื่องก่อน การติดตั้งนี้อาจโหลด Google AdSense บนหน้าสาธารณะ",
};

const adLabel: Record<Locale, string> = {
  en: "Advertisement",
  "zh-CN": "广告",
  "zh-TW": "廣告",
  es: "Anuncio",
  "pt-BR": "Anúncio",
  de: "Anzeige",
  fr: "Publicité",
  ja: "広告",
  ko: "광고",
  it: "Pubblicità",
  tr: "Reklam",
  vi: "Quảng cáo",
  nl: "Advertentie",
  pl: "Reklama",
  th: "โฆษณา",
};

export function getAdsNotice(locale: Locale) { return adsNotice[locale]; }
export function getAdsLegal(locale: Locale) { return adsLegal[locale]; }
export function getAdLabel(locale: Locale) { return adLabel[locale]; }

export function adsTxtBody(client = adsConfig.client): string {
  if (!client) return "";
  return `google.com, ${adsensePublisherId(client)}, DIRECT, f08c47fec0942fa0\n`;
}

export function contentSecurityPolicy(ads = adsAreEnabled()): string {
  const extraScript = ads ? " https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.google.com https://www.gstatic.com https://tpc.googlesyndication.com" : "";
  const extraImg = ads ? " https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net https://www.gstatic.com" : "";
  const extraConnect = ads ? " https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://partner.googleadservices.com" : "";
  const extraFrame = ads ? " frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://www.googletagservices.com;" : "";
  return `default-src 'self'; img-src 'self' blob: data:${extraImg}; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'${extraScript}; connect-src 'self'${extraConnect}; worker-src 'self' blob:;${extraFrame} frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;
}
