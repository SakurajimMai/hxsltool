# UIUX V2 runtime audit

Date: 2026-09-07

## Environment

- Repository: `/root/code/hxsl`, pnpm workspace, Next.js App Router, React 19, TypeScript, plain CSS in `apps/web/app/globals.css`.
- No Git metadata is present in this workspace. Existing files are treated as user-owned and are preserved.
- `GOAL-UIUX-V2.md` was not present. This audit follows the supplied upgrade brief.
- Live deployment: Docker Compose complete profile at `http://188.68.56.198:13080/`.
- Public Web binding is `0.0.0.0:13080`; Worker and Redis remain private Compose services.

## Baseline evidence

- `curl -D` against `/` returned the expected 307 redirect to `/en`, security headers, CSP, and a cacheable prerendered response.
- Browser screenshots were captured with Playwright at 1440px and 390px widths:
  - `docs/upgrade/baseline/home-desktop.png`
  - `docs/upgrade/baseline/home-mobile.png`
  - `docs/upgrade/baseline/tool-desktop.png`
  - `docs/upgrade/baseline/tool-mobile.png`
- The live health endpoint reported Web healthy with Ghostscript 10.00.0, qpdf 11.3.0, Poppler 22.12.0, Tesseract 5.3.0 and LibreOffice 7.4.7.2.

## What is working and must be preserved

- The registry is the source of truth for 82 enabled routes: 40 PDF, 21 SVG, 20 image and 1 icon pack.
- Existing local-first processing, server consent, queue jobs, cancellation, short-lived results, API, CLI, i18n, canonical URLs, hreflang, sitemap and JSON-LD are already implemented.
- Existing Playwright workflows cover local image processing, DXF, icon packaging, SVG safety, signature/crop, DST, PDF thumbnails and reorder behavior.
- Existing output checks must remain unchanged unless a UI change requires a selector update.

## Observed UX debt

1. The header gives equal visual weight to tools, guides, privacy, about and API, while the brief calls for PDF, Image, SVG and Icons as the primary navigation.
2. The desktop homepage is calm but has repeated card grids, weak tool search, and no visible recent or favorite layer.
3. The mobile header reduces to logo, language and theme only. There is no menu or compact tool discovery path.
4. The tool page places a large information column beside a sticky workbench, but the workbench does not clearly separate file intake, options, process action and results.
5. Category pages have no format filter, clear-filter action or no-results state.
6. Options are rendered as one undifferentiated list, presets are absent, and changing options does not tell the user that an existing result is stale.
7. Queue rows expose download and removal but not retry. Batch results do not state how many successful outputs are included in the ZIP.
8. The existing color system is green and warm-beige rather than the requested restrained neutral plus single blue accent. It also lacks a complete manual dark-theme token layer.
9. Baseline screenshots show the information architecture is legible, but mobile density and navigation need a deliberate second pass at 320px, 360px, 390px and 768px.

## Browser and performance baseline

- Existing release verification had passed before this upgrade; the current baseline Lighthouse artifact is `docs/performance-baseline.json`.
- The previous lab baseline records Performance 97-98, Accessibility 96-100 and SEO 100 on representative public pages, with LCP about 2.1s and CLS 0.
- No real-user INP, LCP or CLS data is available. This remains a post-deployment observation item.

## Risk register

- High: changing shared workspace markup can break file processing selectors and PDF thumbnail workflows.
- High: changing route markup or metadata can regress the 82 x 8 localized public pages.
- Medium: localStorage preference code must never receive files, file names, passwords, OCR text or download tokens.
- Medium: mobile navigation and command search must not steal focus from file inputs, signature canvas or PDF keyboard controls.

## Final implementation evidence

- The final Docker Web image was rebuilt on 2026-09-07 with 764 generated pages: 8 locale home pages, 32 category pages, 656 tool pages and the existing legal/API/guide routes. The complete Compose profile remains healthy; Web is published as `0.0.0.0:13080->3000`, Worker and Redis are not published.
- Public smoke and workflow evidence: `E2E_BASE_URL=http://188.68.56.198:13080 pnpm exec playwright test` passed 13/13. This covers search aliases and `Ctrl/Cmd+K`, mobile menu focus/Escape, category filtering, safe presets/stale results, local image output parsing, translated SSR, DXF geometry, icon ZIP resources, SVG sanitization, signature/crop, DST dimensions and PDF selection/reorder.
- Public raw HTML checks passed for all 8 locale variants of `/pdf/merge-pdf`: HTTP 200, matching `html lang`, localized title/description, formal canonical, and 9 alternate links (8 locales plus `x-default`). The current development deployment correctly returns `robots.txt Disallow: /` and an empty sitemap because `ALLOW_INDEXING=false`.
- Production-like Lighthouse (`ALLOW_INDEXING=true`, local standalone build) is recorded in `docs/performance-baseline.json`: home 96/96/100, Merge PDF 97/100/100, Image Compressor 96/100/100 for Performance/Accessibility/SEO; LCP 2.25–2.40s and CLS 0. These are lab values, not field p75 data.
- Screenshot audit artifacts are in `docs/upgrade/baseline/` and `docs/upgrade/after/`. The final pass also measured no horizontal overflow at 320, 360, 390 and 768 CSS pixels and captured no page or console errors. The 320px check is the reflow-equivalent evidence for 400% zoom; native browser zoom is not exposed reliably by headless Chromium.
- A read-only-container image-cache error found during the audit was removed by serving a 1200×900, 59KB static WebP with `next/image unoptimized`; the final container log contains only normal startup lines.

## Remaining observation limits

- Real-user p75 LCP/INP/CLS is not available in this environment and is explicitly not inferred from Lighthouse.
- All 82 routes are registry/build/shell compatible, but not every engine has a new full-file E2E parser run in this phase. Server-side cancellation/expiry/delete and the three exact multi-tool continuation chains remain follow-up regression work, documented in the acceptance checklist.
