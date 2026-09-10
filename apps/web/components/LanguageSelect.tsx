"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Languages, X } from "lucide-react";
import { LOCALES, type Locale } from "@hxsl/tool-registry";
import { getLocalePath, localeNames } from "../lib/i18n";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { getLanguageCopy } from "../lib/language-copy";
import { rememberLocale } from "../lib/locale-preference";

export function LanguageSelect({ locale }: { locale: Locale }) {
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = "ltr"; }, [locale]);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const copy = getLanguageCopy(locale);
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  const options = LOCALES.map(code => [code, localeNames[code]] as const).filter(([code, name]) => `${code} ${name}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <button ref={trigger} className="language-trigger" type="button" aria-label={copy.title} aria-haspopup="dialog" onClick={() => { setQuery(""); dialog.current?.showModal(); }}><Languages size={18} aria-hidden="true" /><span>{localeNames[locale]}</span></button>
    <dialog ref={dialog} className="language-dialog" aria-labelledby="language-dialog-title" onClick={event => { if (event.target === event.currentTarget) close(); }} onClose={() => trigger.current?.focus()}>
      <div className="language-dialog-heading"><h2 id="language-dialog-title">{copy.title}</h2><button className="icon-button" type="button" aria-label={getUpgradeCopy(locale).navigation.close} onClick={close}><X size={20} aria-hidden="true" /></button></div>
      <label className="language-filter">{copy.search}<input autoFocus value={query} onChange={event => setQuery(event.target.value)} type="search" /></label>
      <nav className="language-options" aria-label={copy.title}>{options.map(([code, name]) => <Link key={code} href={getLocalePath(code as Locale, pathname.split("/").slice(2).join("/"))} prefetch={false} lang={code} dir="ltr" hrefLang={code} aria-current={code === locale ? "page" : undefined} onClick={event => {
        if (code !== locale && document.querySelector('.workspace[data-has-files="true"]') && !window.confirm(copy.warning)) { event.preventDefault(); return; }
        rememberLocale(code);
        close();
      }}><span>{name}<small>{code}</small></span>{code === locale && <Check size={18} aria-hidden="true" />}</Link>)}</nav>
      {!options.length && <div className="language-empty"><p>{copy.empty}</p><button className="button button-secondary" type="button" onClick={() => setQuery("")}>{getUpgradeCopy(locale).search.clear}</button></div>}
    </dialog>
  </>;
}
