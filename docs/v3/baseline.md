# HXSL Tools V3 baseline

Date: 2026-09-07

## Runtime evidence

- Development endpoint: `http://188.68.56.198:13080/`
- `GET /en` returned `200 OK` during the audit. The response was `120252` bytes and included `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
- The response headers included the existing security policy, `X-Content-Type-Options: nosniff`, and the public host is bound through Compose as `0.0.0.0:${APP_PORT}:3000`. No DNS, TLS, or production-domain change was made.
- Fresh V3 production-build screenshots are in `docs/v3/after/`, with viewport/status/overflow evidence in `after/browser-evidence-production.json`. The review covered frontend desktop/mobile, light/dark themes, a category page, a representative workbench and the admin desktop/mobile shell.

## Stack and data path

- Next.js 15 App Router, React 19, TypeScript, pnpm workspace, plain semantic CSS, and `lucide-react`.
- The registry in `packages/tool-registry` contains 82 tools across PDF, Image, SVG, and Icons, with eight locales: `en`, `zh-CN`, `zh-TW`, `es`, `pt-BR`, `de`, `fr`, `ja`.
- Browser jobs use `/api/v1/jobs`, `/api/v1/jobs/:id`, and `/api/v1/jobs/:id/download`. These are internal, short-lived, token-authorized web-session endpoints and must remain.
- Server processing uses the existing worker/Redis path and qpdf, Poppler, Tesseract, LibreOffice, Ghostscript, and the shared processing package. Local processing remains in the browser.
- Job input/result files are kept under the protected `HXSL_JOB_DIR` job volume. Before V3 there was no persistent admin database or admin configuration service.
- Node 22.10.2 exposes the built-in experimental `node:sqlite` module. V3 uses the existing runtime rather than adding a native database dependency.

## Confirmed product debt

- The repository still contained a public OpenAPI document, public capabilities endpoint, API-key image endpoint, a localized API page, API/CLI navigation and translations, a CLI workspace package, and API-key setup text.
- `README.md`, `.env.example`, Compose, and the Docker build still described the retired public API/CLI product.
- Public pages were registry/i18n driven, but operational content and limits were environment/code values only; there was no draft/publish/rollback path.
- The job manifest contains security-sensitive internal fields for recovery. It must never be copied into an admin response; the admin job view is sanitized to IDs, states, phases, timing, error codes, retry count, configuration version, and cleanup state.

## Baseline commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm build
E2E_BASE_URL=http://188.68.56.198:13080 pnpm test:e2e
```

The V2 baseline passed these checks before V3 changes. V3 results and fresh screenshots are recorded in `docs/v3/progress.md` and `docs/v3/acceptance.md`. The final production-style lab report is `docs/performance-baseline.json`; it was generated with `ALLOW_INDEXING=true` so the SEO score measures the indexable configuration, while the live development deployment remains `ALLOW_INDEXING=false` until operator sign-off.
