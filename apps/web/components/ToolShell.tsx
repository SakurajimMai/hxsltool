import Link from "next/link";
import { ChevronRight, Monitor, Cloud } from "lucide-react";
import type { Locale, Tool } from "@hxsl/tool-registry";
import { getLocalePath, getMessages } from "../lib/i18n";
import { getUpgradeCopy } from "../lib/upgrade-copy";
import { FavoriteButton } from "./FavoriteButton";

export function ToolShell({ locale, tool, localizedName, localizedDescription, workspace, children }: { locale: Locale; tool: Tool; localizedName: string; localizedDescription: string; localizedBoundary: string; workspace: React.ReactNode; children: React.ReactNode }) {
  const m = getMessages(locale);
  const copy = getUpgradeCopy(locale);
  const modeCopy = tool.processingMode === "local" ? copy.tool.local : tool.processingMode === "server" ? copy.tool.server : copy.tool.consent;
  const ModeIcon = tool.processingMode === "local" ? Monitor : Cloud;
  return <>
    <div className="shell breadcrumb"><Link href={getLocalePath(locale)}>{copy.tool.home}</Link><ChevronRight size={14} aria-hidden="true" /><Link href={getLocalePath(locale, `/${tool.category}`)}>{m.category[tool.category]}</Link><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{localizedName}</span></div>
    <section className="shell tool-layout">
      <header className="tool-header">
        <div className="tool-title-row"><h1>{localizedName}</h1><FavoriteButton toolId={tool.id} locale={locale} compact /></div>
        <p>{localizedDescription}</p>
        <div className="tool-mode-note"><ModeIcon size={16} aria-hidden="true" />{modeCopy}<span className="mode-boundary">· {copy.tool.files}: {tool.limits.maxFiles ?? 1} · {tool.limits.maxMb} MB</span></div>
      </header>
      <div className="tool-workspace-column">{workspace}</div>
      {children}
    </section>
  </>;
}
