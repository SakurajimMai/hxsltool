import type { Locale } from "@hxsl/tool-registry";
import { adsConfig, getAdLabel } from "../lib/ads";

export function AdSlot({ locale }: { locale: Locale }) {
  if (!adsConfig.enabled || !adsConfig.client || !adsConfig.slot) return null;
  return <aside className="ad-slot" aria-label={getAdLabel(locale)}>
    <span className="ad-slot-label">{getAdLabel(locale)}</span>
    <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={adsConfig.client} data-ad-slot={adsConfig.slot} data-ad-format="auto" data-full-width-responsive="true" />
    <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle=window.adsbygoogle||[]).push({});" }} />
  </aside>;
}
