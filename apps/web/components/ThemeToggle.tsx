"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@hxsl/tool-registry";
import { getThemeLabels } from "../lib/upgrade-copy";

export function ThemeToggle({ locale }: { locale: Locale }) {
  const labels = getThemeLabels(locale);
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("hxsl-theme", next ? "dark" : "light");
    setDark(next);
  }
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={dark ? labels.light : labels.dark} aria-pressed={dark}>{dark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}</button>;
}
