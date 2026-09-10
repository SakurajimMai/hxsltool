import Script from "next/script";
import { adsConfig } from "../lib/ads";

export function GoogleAdsense() {
  if (!adsConfig.enabled || !adsConfig.scriptSrc) return null;
  return <Script id="google-adsense" async src={adsConfig.scriptSrc} crossOrigin="anonymous" strategy="afterInteractive" />;
}
