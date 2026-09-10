import { LOCALES, type Locale } from "@hxsl/tool-registry";

export const LOCALE_COOKIE = "hxsl-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export function validLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
function matchLanguage(tag: string): Locale | undefined {
  const normalized = tag.toLowerCase();
  const exact = LOCALES.find(locale => locale.toLowerCase() === normalized);
  if (exact) return exact;
  const [language, ...parts] = normalized.split("-");
  if (language === "zh") return parts.some(part => ["hant", "tw", "hk", "mo"].includes(part)) ? "zh-TW" : "zh-CN";
  if (language === "pt") return "pt-BR";
  return LOCALES.find(locale => locale === language);
}

/** Only the unprefixed entry point negotiates; explicit locale URLs stay stable. */
export function preferredLocale(saved: string | undefined, header: string | null): Locale {
  if (validLocale(saved)) return saved;
  const preferences = (header ?? "").slice(0, 4096).split(",").map((item, index) => {
    const [tag, ...parameters] = item.trim().split(";");
    const quality = parameters.find(parameter => parameter.trim().startsWith("q="));
    const raw = quality?.trim().slice(2);
    const q = raw === undefined ? 1 : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(raw) ? Number(raw) : 0;
    return { tag, q, index };
  }).filter(item => item.q > 0 && /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i.test(item.tag))
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of preferences) { const match = matchLanguage(tag); if (match) return match; }
  return "en";
}

export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}
