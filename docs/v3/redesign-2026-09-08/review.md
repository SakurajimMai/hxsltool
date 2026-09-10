# Frontend redesign — 2026-09-08

Scope: user-requested `redesign-existing-projects` correction to match the actual interface at https://pixeltools.io/. This supersedes the cinematic homepage from September 7. Existing Next.js 15 / React 19 / TypeScript / pnpm / CSS and file engines are retained.

## Observed baseline

- Captured the reference and current development site at 1440px and 390px. Evidence: `reference-desktop.png`, `reference-mobile.png`, `before-desktop.png`, `before-mobile.png`, `before.html` and `before-headers.txt`.
- Reference: restrained left-aligned heading, light graph-paper background, pixel header, compact navigation, category controls and search on one row, regular three-column tool cards.
- Previous HXSL: full-width dark photographic hero, oversized title, duplicate decorative image, four oversized narrative sections, pinned scrolling. Featured heading at about 1075px; categories at about 4905px. Tool discovery was pushed below the first viewport.
- Reference images are review evidence only. The application uses its own generated pixel SVG, HXSL brand, published tool content and existing icons.
- Workspace has no `.git` directory. `git status --short` reports “not a git repository”; no commit/diff history is claimed.

## Changes

- Replaced the cinematic homepage with a compact tool directory. Initial featured tasks remain driven by the published administrator configuration, including display order. Category selection, all tools and name/format/alias search work on the real registry.
- Category links have real URLs and work without JavaScript. The 82 tool pages and eight languages remain available.
- Shared tool cards show task icon, name, description, actual formats, processing-mode label and favorite control. Category pages reuse the cards and retain format filtering.
- Added self-hosted Geist from the installed Next distribution, with the original SIL Open Font License in `apps/web/public/fonts/OFL.txt`. No third-party font request is needed.
- Scoped public colors and typography under `.public-site`, keeping the admin styles separate. Added original blue pixel header decoration and a subtle grid. Dark mode uses matching dark surfaces and a dimmed pixel decoration.
- Reworked ToolShell into a single main column: title, description, processing boundary and limits, then upload/workspace. Removed duplicate format panels and the oversized narrow title. Specialized previews and processing components remain in place.
- Corrected hardcoded Chinese scaffolding in other-language tool pages, duplicate step numbering, undersized field labels, and self-links in related-tool lists.
- Removed `HomeMotion.tsx` and `gsap` / `@gsap/react`. Previous artwork is retained for existing sharing metadata. Added generated build-directory exclusions to Docker context.
- Search now drives the directory, has a clear action and a recoverable empty state. Corrected nested-interactive accessibility semantics and added modal focus containment. Chinese composition events do not trigger premature Enter/shortcut navigation.
- Fixed a measured dark-theme primary-button contrast failure (1.89:1 before correction).
- Screenshot follow-up corrected mobile pixel proportions, balanced short heading lines, removed duplicate no-result popovers, and handled failed image previews without broken-image placeholders. Search suggestions respect the selected category; selecting a command result closes the modal and releases scroll locking.

## Checks and evidence

- `pnpm lint`: passed.
- `pnpm i18n:check`: 82 tools / eight locales passed.
- `pnpm seo:check`: 656 localized tool URLs passed (configuration/source checks).
- Existing browser regression: 13 tests passed, including real local image download/no upload, result chaining, DXF, SVG, icon archive, PDF signature/crop/thumbnails/reorder and presets.
- Added `tests/browser/directory-redesign.spec.ts`: three tests passed for category/search recovery, links without JavaScript and 320px reflow.
- After the search accessibility correction, the seven discovery/preferences tests were rerun and passed.
- Final production build: 766 pages generated. Homepage route JS 4.62 kB; First Load JS 134 kB, compared with the previous recorded 49 kB / 160 kB. These are Next build estimates, not field measurements.
- Final container browser regression: **16 / 16 passed in 23.9s**, including the added Enter-to-tool/close-search assertion. Report: `playwright-report/index.html`.
- Production SSR: `E2E_BASE_URL=http://127.0.0.1:13289 node scripts/e2e-smoke.mjs` passed all 656 localized tool routes and the script's content/404/retirement/metadata checks. An earlier combined pnpm invocation ended with SIGTERM/143; this direct rerun completed successfully.
- Final container capture: **16 / 16 scenarios passed** at 320/360/390/768/1440px, across light/dark themes and English, Simplified Chinese, German and Japanese. `browser-evidence.json` reports HTTP 200, no overflow, no page errors, no observed upload requests during these UI scenarios, no scroll pins and no axe WCAG 2/2.1/2.2 A/AA violations. Local processing no-upload is additionally asserted by the real-file browser regression. Automated accessibility scans do not replace a complete assistive-technology audit.
- Viewed production screenshots for desktop/mobile home, both themes, category/tool pages, empty search, command search and file error states. Full-page views are also saved for the desktop/mobile homepage and image workbench.

### Performance and deployment outcome

`performance.json` and three complete `*.lighthouse.json` reports contain mobile laboratory measurements on the isolated final production image, after browser regression/build activity finished:

| Page | Performance | Accessibility | SEO | Lab LCP | Lab CLS |
| --- | --- | --- | --- | --- | --- |
| `/en` | 95 | 100 | 63 | 2.542 s | 0.0333 |
| `/en/pdf/merge-pdf` | 96 | 100 | 63 | 2.451 s | 0.00104 |
| `/en/image/image-compressor` | 98 | 100 | 63 | 2.159 s | 0.00104 |

The sole failing Lighthouse SEO audit is `is-crawlable`: the isolated environment intentionally has `ALLOW_INDEXING=false`. Indexing protection was not disabled to inflate the score. Canonical remains on the configured formal domain. These reports do not establish field p75 performance; INP was not measured. The homepage laboratory LCP is slightly above 2.5 s and is reported as measured.

The development Web container was updated with `docker compose up -d --no-build --no-deps web`. Docker reports `healthy`, bound to `0.0.0.0:13080`. Deployed image: `sha256:73a5acb1cf27e19a2e7dc37ce370e1d96a7655ea0948db5b5c84ae27354f3a05`. Worker and Redis were not recreated; existing named volumes were retained.

Public-IP checks and screenshots are recorded in `live-evidence.json`, `live-desktop.png`, `live-mobile.png`, `after.html` and `after-headers.txt`. The temporary review container and this turn's port-13288 development process were stopped after verification. The temporary container used only synthetic/seeded ephemeral data. The rollback image remains available. This is an update to the existing development endpoint, not a claim of formal domain/TLS publication.

## Reproduce and deploy

```sh
pnpm lint
pnpm typecheck
pnpm i18n:check
pnpm seo:check
docker compose build web
docker run --detach --rm --name hxsl-directory-review-20260908 \
  --publish 127.0.0.1:13289:3000 --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=128m \
  --tmpfs /var/lib/hxsl:rw,noexec,nosuid,size=128m,uid=1001,gid=1001 \
  --tmpfs /var/lib/hxsl-admin:rw,noexec,nosuid,size=32m,uid=1001,gid=1001 \
  --env HXSL_ADMIN_DB_PATH=/var/lib/hxsl-admin/admin.sqlite \
  --env HXSL_JOB_DIR=/var/lib/hxsl --env ALLOW_INDEXING=false hxsl-web:latest
E2E_BASE_URL=http://127.0.0.1:13289 pnpm test:e2e
REDESIGN_BASE_URL=http://127.0.0.1:13289 node scripts/redesign-capture.mjs
LH_BASE_URL=http://127.0.0.1:13289 LH_REPORT_PATH=docs/v3/redesign-2026-09-08/performance.json node scripts/lighthouse.mjs
docker compose up -d --no-build --no-deps web
```

Port 13289 is an isolated temporary container using its own ephemeral job/admin directories, not the current user database. Public development access remains `http://188.68.56.198:13080/` with `0.0.0.0` binding. Existing worker, Redis, secrets and named volumes are retained.

The old development image is saved as `hxsl-web:pre-directory-20260908`. To roll back the application image without altering volumes:

```sh
docker image tag hxsl-web:pre-directory-20260908 hxsl-web:latest
docker compose up -d --no-build --no-deps web
```

DNS, TLS, public API products, CLI products and production-domain publication are outside this UI change. No full repeat of backend security, administrator publishing, or every server conversion is claimed. Real-user performance percentiles remain unobserved. Translation checks are not native-speaker editorial review.
