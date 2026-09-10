# UIUX V2 acceptance checklist

This checklist is kept alongside the implementation. Every row must have code or test evidence before the upgrade is closed.

| Area | Acceptance evidence | Status |
| --- | --- | --- |
| Runtime audit | `docs/upgrade/runtime-audit.md` plus baseline screenshots | Complete |
| Design system | Shared semantic tokens, light/dark states, focus, reduced motion; screenshot review | Complete — `globals.css`, final light/dark screenshots |
| Navigation | Category-first desktop nav and usable mobile menu | Complete — UIUX browser test |
| Search | Registry-backed visible search and `Ctrl/Cmd+K` keyboard flow | Complete — alias/no-result/focus test |
| Preferences | Favorites, 8 recent tools, clear history, safe presets | Complete — localStorage allowlist and browser test |
| ToolShell | Shared hierarchy while preserving specialized adapters | Complete — 82 × 8 route build and migration matrix |
| Queue UX | Retry, cancellation, batch summary, stale-result treatment | Implemented; representative real-file coverage complete, server cancellation/expiry follow-up |
| Category discovery | Format filter, clear filter and empty state | Complete — category browser test |
| Responsive UI | 320, 360, 390 and 768px plus desktop screenshots | Complete — no overflow at all four widths |
| Accessibility | Labels, keyboard alternatives, focus, live state, contrast | Complete for audited flows — Lighthouse 96/100/100 and keyboard tests |
| Localization | All 8 locales cover new navigation and preference UI | Complete — content check, build, public HTML checks |
| SEO | Stable URLs and existing registry-generated metadata remain intact | Complete — 656 URL check, 8 public locale checks, Lighthouse SEO 100 |
| File chains | Existing three continuation chains still process real files | Partial — continuation path exists; all three full parser chains remain follow-up |
| Full regression | lint, typecheck, tests, e2e, build, Lighthouse and Docker | Complete for this phase — commands and limits below |

## Evidence commands

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
ALLOW_INDEXING=true pnpm build
ALLOW_INDEXING=true pnpm perf:lighthouse
ALLOW_INDEXING=true pnpm verify
docker compose up -d --build web
E2E_BASE_URL=http://188.68.56.198:13080 pnpm exec playwright test
```

The last `E2E_BASE_URL=http://188.68.56.198:13080 pnpm test:e2e` run passed both HTTP SSR/API smoke and 13/13 browser tests. The final image build generated 764 pages. `docs/performance-baseline.json` is a local production-like lab run; the running public Compose environment intentionally has `ALLOW_INDEXING=false`, so its robots file disallows crawling and its sitemap has zero URLs.

## Explicit limits and untested items

| Item | Result / boundary |
| --- | --- |
| All public routes | All 82 tools are migrated to the shared shell and built for all 8 locales. Full parser/output validation of every adapter is not claimed from route rendering alone. |
| Three continuation chains | UI/session continuation infrastructure remains; all three exact multi-step real-file chains are follow-up regression work. |
| Server cancellation/expiry/delete | Existing backend protections are preserved; isolated end-to-end verification of each lifecycle is pending. |
| Native optional tools | Existing host-only skips remain; complete Docker is the integration environment. |
| RUM | No real traffic data; p75 LCP/INP/CLS is pending observation. |
| Production release | No DNS/TLS/indexing/remote push was performed. The tested public IP is a development deployment. |

## Build, isolated deployment and rollback

Build and start the current development Compose service:

```text
docker compose up -d --build web
curl -fsS http://127.0.0.1:13080/api/health
```

For complete local integration, use `docker compose --profile complete up -d --build`. The service is published on `0.0.0.0:${APP_PORT:-13080}`; set `APP_HOST=127.0.0.1` behind a local reverse proxy. Keep `ALLOW_INDEXING=false` for test/staging.

Before a production update, record the current image digest/tag and keep the previous image. Roll back by restoring that known-good image reference in the deployment manifest, then run `docker compose up -d web` and the health plus representative E2E smoke checks. This workspace has no Git metadata and no prior image tag supplied, so a historical rollback image was not invented or claimed as tested; Docker volume data must not be deleted as part of rollback.
