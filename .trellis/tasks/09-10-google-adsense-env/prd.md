# Google AdSense env configuration

## Goal

Operators can turn on Google AdSense from environment variables. Ads stay off unless explicitly enabled with a valid publisher client.

## Requirements

- `ENABLE_ADS=true` and `GOOGLE_ADSENSE_CLIENT=ca-pub-…` are both required to load ads.
- Optional `GOOGLE_ADSENSE_SLOT` for one display unit; `GOOGLE_ADSENSE_AUTO_ADS` defaults to true when ads are on.
- `/ads.txt` is served when a client is configured.
- CSP allows Google ad hosts only when ads are on.
- Footer and privacy copy must not claim “no advertising scripts” while ads are loaded.
- File tools, jobs, and retired AI/admin routes are unchanged.

## Acceptance Criteria

- [ ] Default env (no ads vars / ENABLE_ADS=false) loads no AdSense script.
- [ ] Invalid client values do not enable ads.
- [ ] Valid client + ENABLE_ADS=true injects the AdSense script and meta account.
- [ ] `/ads.txt` contains `google.com, pub-…, DIRECT, f08c47fec0942fa0` when enabled.
- [ ] Unit tests cover enable/disable parsing.
- [ ] `pnpm --filter @hxsl/web test` and typecheck pass.
