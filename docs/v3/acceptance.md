# HXSL Tools V3 acceptance

This is the final evidence matrix for the repository implementation and isolated deployment rehearsal. “Pass” means the behavior was exercised by code-level, HTTP, browser, or container evidence listed in the same row. It does not claim DNS, TLS, search-engine indexing, or field telemetry that was not executed.

| Area | Acceptance item | Result and evidence |
| --- | --- | --- |
| Scope | Public API/CLI product surfaces retired; browser processing still works | **Pass.** `/api/openapi.json`, `/api/v1/capabilities`, and `/api/v1/compress/image` return 410 for GET/POST/OPTIONS; localized `/api` is 404; `/api/v1/jobs*` and `/api/health` remain. `pnpm test:e2e` and the live PDF job rehearsal pass. |
| Baseline | Existing stack, routes, tools, locales, worker, storage, headers and bind recorded | **Pass.** See `baseline.md`: Next 15.5.6, 82 tools, 8 locales, 656 localized tool routes, Docker bind `0.0.0.0:13080`. No Git metadata was present in the checkout, so Git status is recorded as unavailable. |
| Persistence | Settings/content survive restart and container rebuild | **Pass in isolation.** SQLite schema is idempotent; admin HTTP smoke restarts against the same temp database; `pnpm backup:rehearsal` restores administrator and operational data without secrets. The live app has a separate `hxsl-admin` volume. |
| Authentication | Restricted init, password hash, login/logout, expiry/revoke, CSRF/source checks, recent auth and MFA | **Pass.** `pnpm test:admin`, `pnpm test:admin:http`; no default password or registration. TOTP and one-time recovery-code paths are exercised. Production admin cookies still require HTTPS with `ADMIN_COOKIE_SECURE=true`. |
| Authorization | Unauthenticated admin reads/writes, previews, imports, exports, rollback and jobs rejected | **Pass.** HTTP smoke returns 401 for unauthenticated state/security access and 403 for missing CSRF; all admin routes call server-side session authorization. |
| Configuration | Technical facts read-only; operational overlays schema-checked; hard caps enforced server-side | **Pass.** Registry facts are read-only, effective config is shared by UI/admission/processing, and the admin HTTP smoke rejects a limit above the deployment hard cap. |
| Publishing | Draft isolation, preview, validation, publish, cache/version update and rollback | **Pass.** Japanese title/FAQ/error/SEO draft is not public, publish updates SSR content, rollback restores the previous version; invalid content/limits are rejected. |
| Localization | Eight locales retained; localized content/status/SEO; no fake human-review status | **Pass.** `pnpm content:check`, `pnpm i18n:check`, 656-route E2E and Japanese publish flow. Missing/placeholder content is reported; copying English creates draft content. |
| SEO | Self-canonical, hreflang/x-default, initial HTML, internal links and sitemap qualification | **Pass for generated qualification.** `pnpm seo:check` checks all 656 localized tool URLs, metadata, JSON-LD and links. `/robots.txt` and `/sitemap.xml` are noindex-safe in staging; production indexing requires explicit `ALLOW_INDEXING=true`. Actual search-engine inclusion is **unknown**, not claimed. |
| Jobs | Sanitized admin state, real cancel/retry/cleanup, no file names/content/tokens in admin | **Pass.** Admin summaries expose tool/status/phase/error code/version/cleanup only. Live Docker rehearsal completed a real PDF-to-JPG worker task, authenticated download, and cancellation; worker/Web secrets were corrected to the same injected value before the successful run. |
| Frontend | Anonymous V2 workbench, all tools, consent, previews, batch states, chains and modern responsive UI | **Updated 2026-09-08.** The previous cinematic visual sign-off is superseded by the user-requested reference-led correction: compact PixelTools-style directory, original pixel header, three-column task cards, category tabs/search, and unified single-column ToolShell. Sixteen browser tests cover discovery and real-file workflows; the production SSR smoke checks 656 localized tool routes. See [redesign review](redesign-2026-09-08/review.md) for actual screenshots, accessibility findings/fixes, final verification and deployment evidence. Historical V3 backend acceptance is not a claim that every backend scenario was rerun for this UI change. |
| Admin | Overview, tools, multilingual, SEO, site, jobs, runtime, audit, backup and security modules | **Pass in isolated authenticated UI/HTTP rehearsal.** Admin is Chinese-only as scoped, with operational filters, drafts, preview/history, rollback, maintenance, limits, sanitized jobs and TOTP/recovery setup. |
| Security | No arbitrary shell/SQL/JS, Docker socket, public registration, client secret, or unsafe admin caching | **Pass by code review and tests.** Exports omit password hashes, sessions, MFA, deployment secrets, job tokens and user files; preview/import/export are authenticated and no-store. HTTPS/TLS hardening remains deployment work. |
| Backup | Secret-free export, import preflight to draft, isolated backup/restore | **Pass.** Admin HTTP smoke checks secret-free export and draft import; `pnpm backup:rehearsal` completes restore in `/tmp` without touching production volumes. |
| Quality | Lint/typecheck/unit/i18n/SEO/build/E2E/a11y/performance and screenshot review | **Pass.** `pnpm verify` completed; 13 browser tests passed; production screenshots in `after/` were inspected at desktop/mobile, light/dark themes, including admin. No width overflow was found at 320/360/390/768px. |
| Performance | Lab target and field metrics | **Lab pass for performance/accessibility/SEO on indexable production configuration.** See `../performance-baseline.json`: three pages, Performance 95–100, Accessibility 96–100, SEO 100, LCP about 1.9–2.3s, CLS 0. INP is not available in this Lighthouse run. Real-user p75 LCP/INP/CLS is **not observed**. |
| Deployment | Public bind, isolated rebuild, production publish boundaries | **Pass for local/container rehearsal.** `hxsl-web-1` is healthy on `0.0.0.0:13080`; public IP `/en` returns 200; worker and Redis are private. DNS, TLS, formal production canonical switch, search submission and administrator initialization were not performed. |

## Operator sign-off still required

1. Set the formal `SITE_URL` and trusted proxy/TLS configuration, then use `ADMIN_COOKIE_SECURE=true` and, only behind a trusted proxy, `TRUSTED_PROXY=true`.
2. Create the first administrator through the restricted maintenance initializer, remove `ADMIN_INIT_TOKEN`, restart, and verify login from the HTTPS origin.
3. Review content/privacy/legal copy, run the production smoke commands, then explicitly enable indexing and verify robots, sitemap, canonical and hreflang before submitting the sitemap.

No credentials, recovery codes, or deployment secrets are included in this document.

## 2026-09-08 incremental acceptance — mobile / languages / Head

This table supersedes earlier locale counts and performance figures for this increment only; it does not claim a rerun of every historical backend scenario.

| Item | Result and evidence |
| --- | --- |
| Mobile and existing appearance | Pass at 320/360/390/768/1440px, light/dark, error and language dialog; 12 screenshot scenarios with zero overflow/page errors/axe violations. Live screenshots inspected. |
| Additional languages | Korean and Italian added; ten languages retained throughout Registry, UI, routes and admin. 930 raw-HTML page checks and 820 tool SEO checks pass. Native-language review pending; some underlying engine diagnostics and old administrator content remain unchanged. |
| Custom Head Meta | Authenticated, whitelisted plain-text fields; draft isolation, publication into raw head, optimistic locking, export/restore and persistent-container recreation pass. Arbitrary scripts/system metadata overrides rejected. |
| Future ads | Preparation only: validated public publisher/slot IDs and admin layout preview. No account connection, CMP, ad script, frontend blank slot or ad activation. |
| Regression | Lint/typecheck/i18n/SEO/build passed; 19 production browser tests passed. Five existing shared tests skipped for missing host binaries; existing worker test placeholder is not engine evidence. |
| Performance | P95–96, A100; SEO66 due staging noindex. Lab LCP 2.53–2.72s, so 2.5s target is not claimed. Field p75 unobserved. |
| Development deployment | Only web rebuilt on 0.0.0.0:13080; protected pre-update DB backup and rollback image preserved. No DNS, public TLS, indexing submission or ad deployment performed. |

Full evidence, instructions and remaining limitations: [increment review](mobile-i18n-head-20260908/review.md).

## 2026-09-08 incremental acceptance — browser preference / sixteen locales

| Item | Result and evidence |
| --- | --- |
| First entry | Root-only 307 language negotiation with browser quality weighting and regional fallback; no IP lookup. Manual language cookie takes priority and survives browser-context restoration. Explicit URLs stay stable. |
| Persistence/privacy | Language code only, up to one year; automatic detection does not write a cookie; rejected switches do not change it. All sixteen privacy pages disclose this functional preference. |
| New content | tr, vi, nl, pl, th and ar added throughout Registry, UI, guides, parameters, SEO and admin. Strict source-key and placeholder checks pass. Human review remains pending. |
| RTL and mobile | Arabic direction set in initial HTML and client navigation; local font corrects fallback rendering; technical canvas/page-order/numeric controls preserved. 18 screenshot/axe scenarios pass. |
| Correct output | Six new-language PNG→JPEG tests independently decode real dimensions and assert no uploads. A pre-existing image Registry format-direction error was fixed, not bypassed. Existing PDF/SVG/icon tests also pass. |
| SEO | 1488 raw pages and 1488-entry isolated indexable sitemap checked; staging remains noindex and its sitemap empty. Search-engine inclusion unknown. |
| Final regression/development | 28/28 final production-browser tests pass; final Dutch-label adjustment additionally checked on 93 pages. Public development URL passes 17 live checks. Only development web was updated; protected backup/rollback image retained. |
| Measured performance | English P94/A100, Arabic P89/A100; staging SEO66. Arabic performance remains below the older P90 target; field p75 is unobserved. |
| Limits | Existing administrator content is preserved, including historical copy that may need review after technical-format corrections. Some underlying engine diagnostics remain English. No new OCR language capabilities, DNS/TLS or ad activation are claimed. |

Final command results, screenshots, development deployment and rollback: [language review](languages-16-20260908/review.md).

## 2026-09-08 — Arabic removed at owner's request

This explicitly supersedes Arabic's enabled status in the preceding sixteen-locale increment. Fifteen languages remain; unsupported Arabic preferences fall back, and 93 former Arabic routes return 404. Arabic is absent from language menus and the isolated indexable sitemap. Historical administrator data is preserved (82 rows unchanged against the protected pre-update backup). 28 production browser tests and the final 69 web unit tests pass; development web only was updated. Evidence and remaining limits: [Arabic removal](remove-arabic-20260908.md).
