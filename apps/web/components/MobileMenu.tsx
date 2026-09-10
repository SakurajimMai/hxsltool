"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@hxsl/tool-registry";
import { getLocalePath, getMessages } from "../lib/i18n";
import { getUpgradeCopy } from "../lib/upgrade-copy";

export function MobileMenu({ locale, categories }: { locale: Locale; categories: Array<{ slug: string; label: string }> }) {
  const copy = getUpgradeCopy(locale);
  const m = getMessages(locale);
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", trap); trigger.current?.focus(); };
  }, [open]);
  useEffect(() => { function onKey(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); } window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  const overlay = open ? <div className="mobile-menu-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><aside ref={panel} role="dialog" aria-modal="true" className="mobile-menu-panel" aria-label={copy.navigation.menu}><div className="mobile-menu-heading"><strong>HXSL Tools</strong><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={copy.navigation.close}><X size={17} aria-hidden="true" /></button></div><nav className="mobile-menu-links"><span className="eyebrow">{copy.navigation.menu}</span>{categories.map((category, index) => <Link href={getLocalePath(locale, `/${category.slug}`)} key={category.slug} ref={index === 0 ? firstLink : undefined} onClick={() => setOpen(false)}>{category.label}</Link>)}<span className="mobile-menu-divider" /><Link href={getLocalePath(locale, "/guides/prepare-images-for-web")} onClick={() => setOpen(false)}>{m.nav.guides}</Link><Link href={getLocalePath(locale, "/privacy")} onClick={() => setOpen(false)}>{m.nav.privacy}</Link><Link href={getLocalePath(locale, "/about")} onClick={() => setOpen(false)}>{m.nav.about}</Link></nav></aside></div> : null;
  return <><button ref={trigger} type="button" className="mobile-menu-trigger" onClick={() => setOpen(true)} aria-label={copy.navigation.menu} aria-expanded={open}><Menu size={19} aria-hidden="true" /></button>{overlay && typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay}</>;
}
