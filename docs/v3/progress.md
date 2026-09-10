# HXSL Tools V3 progress

## M0 — baseline and retirement matrix

- [x] Confirm repository instructions and superseding goal file status.
- [x] Record stack, routes, registry, worker, storage, security headers, public binding, and baseline URL evidence.
- [x] Create the open-product/internal-dependency matrix.
- [x] Refresh V3 desktop/mobile and admin screenshots after implementation. Evidence: `after/*.png` and `after/browser-evidence-production.json`.

## M1 — persistence, auth, admin shell, retirement

- [x] Idempotent SQLite schema and migration. Evidence: `apps/web/lib/admin-db.ts`, `pnpm test:admin`.
- [x] Restricted administrator initialization, secure session, CSRF/source protection, recent-auth checks, MFA/recovery and audit log. Evidence: `pnpm test:admin` and `pnpm test:admin:http`.
- [x] Retire public API/CLI surfaces without breaking browser job endpoints. Evidence: retirement routes return 410; `/en/api` returns 404; server job rehearsal passes.
- [x] Persistent Compose volume and isolated backup/restore scripts. Evidence: `pnpm backup:rehearsal` and Docker volume inspection.

## M2–M4 — operational loop and frontend integration

- [x] Tool operations, language content, SEO checks, site copy, runtime limits, jobs, backup UI.
- [x] Draft/preview/validate/publish/rollback and public SSR verification. Japanese draft isolation, publish and rollback are covered by the admin HTTP smoke.
- [x] Preserve all 82 tools, eight locales, V2 workbench, search/favorites/recent/presets, privacy boundary, and tool chaining. Evidence: 656-route E2E and 13 browser tests.

## M5 — verification

- [x] Real admin and browser E2E, output parsing, auth/limit/privacy checks. Evidence: `pnpm verify` and the live Docker server-job rehearsal.
- [x] Production build and isolated container rebuild persistence check. Evidence: `pnpm build`, Docker rebuild, admin HTTP smoke restart check, and backup/restore rehearsal.
- [x] Screenshot review and final acceptance matrix. Evidence: `docs/v3/acceptance.md` and production screenshot evidence.

## Boundaries and follow-up

- The live development endpoint is reachable at `http://188.68.56.198:13080/` and is bound to `0.0.0.0`; its admin database is mounted but has no administrator until a deployment operator performs restricted initialization.
- DNS, TLS, production canonical-domain changes, search-engine submission and real-user p75 telemetry were not performed. Lighthouse is laboratory evidence only; field CWV remains unobserved.
- No public API/CLI replacement is planned. Existing browser-internal jobs, worker, queue, health check and security controls remain in scope.

## 2026-09-08 — reference-led frontend correction

- Read and applied `redesign-existing-projects`; captured the reference site and current development interface before making changes.
- Replaced the previous cinematic design with a compact directory, original pixel header, self-hosted Geist, real category filters/search, shared cards and a single-column ToolShell. Removed GSAP dependencies.
- Reviewed desktop/mobile/light/dark and error-state screenshots, correcting contrast, search semantics/focus, pixel stretching, repeated empty states and broken image previews.
- Sixteen browser regression tests passed; the expanded search-selection test also passed. Production SSR smoke passed for 656 tool routes. One wrapper run ended with SIGTERM/143; rerunning the direct smoke command completed successfully.
- Final evidence, deployment status and rollback instructions are maintained in [the redesign review](redesign-2026-09-08/review.md).

## 2026-09-08 — mobile, ten languages and managed Head settings

- Updated mobile layout, accessible searchable language dialog, touch controls, preflight/option/result translations; preserved uppercase HX and existing tools.
- Added Korean and Italian: 10 locales, 820 localized tool URLs; all 930 public page HTML checks and 19 production browser tests passed.
- Added validated Meta and advertising-preparation fields to existing persistent site drafts/publishing. No third-party ad scripts or ad activation were introduced. Protected publish/export/restore and container recreation persistence passed in isolation.
- Updated only development web on port 13080 after protected DB backup; worker/Redis/volumes preserved. See [review and actual limitations](mobile-i18n-head-20260908/review.md) for screenshots, reports, performance and rollback.

## 2026-09-08 — browser language preference and sixteen locales

- Added root-only Accept-Language negotiation, with validated persistent manual preference taking priority. Explicit locale links, admin and internal APIs remain stable.
- Added Turkish, Vietnamese, Dutch, Polish, Thai and Arabic, including RTL, local Arabic font, metadata, guides, controls and admin-seeded content. No native-language human review is claimed.
- Production regression passed 28 browser tests, including real local PNG→JPEG outputs in all six languages; 1488 raw HTML pages and the isolated indexable sitemap were checked. Final presentation fixes and deployment details are recorded in [the language review](languages-16-20260908/review.md).
# 2026-09-08 — Remove Arabic (latest owner instruction)

Arabic was removed from the active Registry, runtime locale packs, language negotiation and UI; other 15 languages retained. Former `/ar` pages now return 404, no Arabic hreflang/sitemap entries, and historical admin rows remain unchanged. Development web updated after production-browser regression (28/28); see [scope, checks and rollback](remove-arabic-20260908.md). Earlier sixteen-language reports remain historical evidence, not the current enabled list.
