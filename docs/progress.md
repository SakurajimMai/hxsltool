# Progress log

## 2026-09-06

- M0: audited the empty repository, inspected `GOAL.md`, and checked public feature names on pdfuck.com, svgcreator.com and pipic.cc.
- M1: created a pnpm workspace, typed registry, eight locale routes, SSR metadata, canonical/hreflang generation, robots/sitemap, legal pages and a local-first visual system.
- M2: added real browser image canvas processing, SVG sanitization/optimization/vector-shape output, QR generation, ICO/ZIP packaging, pdf-lib page operations and a Sharp/qpdf/Ghostscript server layer.
- M3/M4: added protected short-lived filesystem jobs, API capability/job routes, public API-off default, BullMQ worker health process, and local plus authenticated server CLI modes.
- M5: added CI commands, Dockerfiles, Compose core/complete profiles, license/deployment documents and deterministic registry/content/SEO checks.
- M4 follow-up: added locale-aware page copy, guide copy, category descriptions, tool names/summaries, limits and option labels for all eight launch locales; content and SSR smoke checks now cover them. Tool metadata now also emits and checks `x-default`.
- M5 follow-up: added a concrete Caddy TLS/reverse-proxy example and expanded processing tests to cover real PNG/JPEG/WebP/AVIF encoding, reopening and dimensions, plus SVG path-to-PDF vector output.
- M5 follow-up: bounded server admission by active-job and per-client rate limits; cancellation now propagates to the worker queue and aborts supported external processing commands.
- M5 follow-up: wired the documented `JOB_TOKEN_SECRET` into HMAC-based job-token derivation while retaining local-development compatibility.
- M5 follow-up: encrypted password-bearing worker options with AES-256-GCM when `JOB_TOKEN_SECRET` is configured; PDF OCR now returns a ZIP containing both TXT and searchable PDF outputs; PDF rendering supports validated ranges, DPI and bounded long images.
- M5 follow-up: tightened browser file/pixel admission, added image input/output previews and paste handling, implemented image/PDF layout options, and repaired raster-rectangle DXF geometry.
- M5 follow-up: added lazy browser PDF.js thumbnails; page clicks now drive the real page-range option and reorder-pages supports drag plus keyboard ordering.
- M5 follow-up: added icon-pack fit/cover, padding and background controls with shared preview/export rendering, Android circle/squircle/rounded mask previews, favicon HTML instructions, and a local signature pad with typed/image appearance support.
- M5 follow-up: added bounded local image concurrency from `config/limits.ts`, explicit GIF/TIFF frame handling, server-side Sharp TIFF→SVG shape conversion, safe SVG editing previews with palette undo, optional 72 DPI visual PDF comparison reports, positioned/templated PDF watermark and page-number controls, explicit structural-versus-lossy PDF compression with no-savings fallback, and bounded PNG appearance signatures in the private Worker path.

## Verification log

- `pnpm typecheck` — passed across web, worker, registry, processing-shared and CLI.
- `pnpm test` — passed: registry 2 tests, processing-shared 17 tests (12 passed and 5 host skips for OCR/qpdf/Poppler rendering), web 5 tests; CLI/worker smoke contracts passed.
- `pnpm content:check` — passed: 82 tools, 8 locales, 12 required message keys.
- `pnpm seo:check` — passed: 656 localized tool URLs with canonical, hreflang and registry hooks.
- `pnpm test:e2e` — real HTTP/SSR smoke now auto-starts a temporary Next service unless `E2E_BASE_URL` is provided; checks all locale launch pages, legal/API/guide pages, localized metadata, 404, capabilities and OpenAPI.
- `ALLOW_INDEXING=true pnpm verify` — passed end-to-end after isolating HTTP/browser dev builds from the production `.next` directory: lint, typecheck, unit tests, content/SEO checks, 764-page production build, HTTP smoke, 9 browser workflows and Lighthouse. This run includes the current icon, PNG signature, comparison, frame, TIFF, positioned PDF-edit and lossy-compression changes.
- `pnpm --filter @hxsl/web build` — passed: 764/764 static pages generated.
- `docker compose build web` — passed on the current amd64 host with qpdf, Poppler, Tesseract, LibreOffice and Noto fonts in the runtime image.
- `docker compose --profile complete up -d` — passed after fixing Redis tmpfs syntax; Web health, Worker health, Redis readiness, qpdf 11.3.0 and LibreOffice 7.4.7.2 were checked.
- `docker compose up -d --build` — core-only rehearsal passed with only the Web container running and `/api/health` responding; complete mode was restored afterward.
- Complete-mode API smoke passed through the private Worker for PDF text extraction, PDF→DOCX→PDF, PDF→XLSX→PDF, PDF→PPTX→PDF, OCR, secure text redaction followed by re-extraction, password protect/unlock, two-input merge, compare, and wrong-token download rejection.
- Job manifests now persist only hashed authorization plus bounded non-sensitive options; a completed job was queried and downloaded successfully after restarting the Web container.
- CLI smoke covered local output permissions, dry-run JSON, authenticated `--server` mode, and the default public-API-off response.
- The current Compose image was rebuilt after the localization, admission-control and cancellation changes; the health endpoints and a real PDF→Text job were rerun successfully.
- Current container rehearsal: `docker compose --profile complete build` passed; recreated Web/Worker/Redis are healthy, `/api/health` reports Ghostscript 10.00.0 plus qpdf/Poppler/Tesseract/LibreOffice, OCR returns the two-file ZIP, and password protect/unlock passed with a one-time random shared secret. Public API remains disabled by default. The final rehearsal also covers PDF render page ranges, DPI and long-image output after the latest image.
- Final vector smoke: `pdf.svg-to-pdf` produced `shape-vector.pdf` (valid `%PDF-`, 756 bytes, no `/Image` object) through the complete worker path.
- Final complete-image API smoke: Worker-side `pdf.sign-pdf` returned `sign-pdf.pdf` (1,410 bytes, parseable PDF with embedded PNG appearance); visual `pdf.compare-pdf` returned a 214-byte 72 DPI report; `svg.tiff-to-svg` returned a 724-byte SVG with 12 real rectangles and no embedded image; and Ghostscript `pdf.compress-pdf` reduced a random-image PDF from 1,921,541 to 314,973 bytes.
- Browser workflow UX: PDF.js is lazy-loaded only after a PDF is selected; thumbnails render locally, page-selection clicks update the real range option, reorder-pages accepts drag and keyboard ordering, icon resources are packaged after changing fit/padding, SVG palette/DST previews are exercised, and signature/crop controls are exercised. The browser suite now has 9 cases.
- Production-container browser check: `E2E_BASE_URL=http://127.0.0.1:13080 pnpm exec playwright test tests/browser/workflow.spec.ts --grep 'PDF'` passed both thumbnail/order cases against the standalone Docker Web service.
- Final production-container browser check: `E2E_BASE_URL=http://127.0.0.1:13080 pnpm exec playwright test tests/browser/workflow.spec.ts` passed all 9 workflows against the rebuilt complete image.
- Lighthouse baseline: `docs/performance-baseline.json` records public-mode lab scores of 98/95/96 Performance, 96/100/96 Accessibility and 100 SEO for home, PDF merge and image compressor pages; LCP was 2.00–2.12 s and CLS 0. These are lab measurements, not field CWV.

The final release gate is `pnpm verify`. The repository also has a 9-case Playwright mobile/SSR/PDF/SVG/icon/output workflow and a 3-page Lighthouse baseline; production DNS/TLS/Search Console submission remain operator or environment work and are not represented as completed here.
