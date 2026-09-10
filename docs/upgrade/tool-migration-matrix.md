# Tool migration matrix

Updated: 2026-09-07

This matrix is generated from the current `packages/tool-registry/src/index.ts` inventory and checked against the route build. The UI migration changes the public shell and shared workflow only; each tool continues to use its existing `adapterId`, processing mode, API, and output implementation.

## Shared migration contract

| Surface | Applied to | Compatibility decision |
| --- | --- | --- |
| Route and SEO shell | All 82 enabled tools × 8 locales | Existing `/{locale}/{category}/{slug}` URLs remain; metadata and related links remain registry-backed. |
| ToolShell | All 82 enabled tools | Adds breadcrumb, localized tool facts, processing boundary, privacy note, favorite action, and a common workspace position. |
| ToolWorkspace | All 82 enabled tools | Keeps the existing adapter dispatch and file selectors; adds queue states, preflight messaging, retry/remove controls, stale-result notice, presets, and localized action labels. |
| Specialized adapters | PDF page editors, signing, crop, SVG preview/vectorization, icon pack | Preserved in the existing workspace branches; no specialized interaction was replaced by a generic card. |
| Search/category discovery | All 82 enabled tools | Names, English names, descriptions, aliases, input/output formats, and real anchor URLs come from the registry/search index. |
| Favorites/recent/presets | All 82 enabled tools | Local-only IDs and allowlisted non-sensitive option values; no file, filename, password, OCR text, or result authorization is stored. |

## PDF — 40 tools

| Tool IDs | Adapter / mode | Migration status |
| --- | --- | --- |
| `pdf.merge-pdf`, `pdf.split-pdf`, `pdf.rotate-pdf`, `pdf.reorder-pages`, `pdf.extract-pages`, `pdf.delete-pages`, `pdf.reverse-pdf`, `pdf.duplicate-pages` | Existing PDF page adapters; local | Shell migrated; page/range/order controls retained. Verified representative flows: merge, split, reverse, reorder, extract, crop, sign. |
| `pdf.pdf-to-png`, `pdf.pdf-to-jpg`, `pdf.pdf-to-webp` | Existing PDF render adapters; hybrid/server as selected by existing dispatch | Shell migrated; page range and render options retained; output remains image or ZIP. |
| `pdf.png-to-pdf`, `pdf.jpg-to-pdf`, `pdf.webp-to-pdf`, `pdf.bmp-to-pdf`, `pdf.gif-to-pdf` | Existing image-to-PDF adapters; hybrid | Shell migrated; paper/orientation/margin/fit controls retained; GIF frame control retained. |
| `pdf.pdf-to-text`, `pdf.svg-to-pdf` | Existing conversion adapters; hybrid/server as selected by dispatch | Shell migrated; output contract retained. |
| `pdf.pdf-to-docx`, `pdf.pdf-to-xlsx`, `pdf.pdf-to-pptx`, `pdf.docx-to-pdf`, `pdf.xlsx-to-pdf`, `pdf.pptx-to-pdf` | Existing Office/text conversion adapters; server where required | Shell migrated; server consent and existing engine boundary retained; no new Office claims. |
| `pdf.compress-pdf`, `pdf.watermark-pdf`, `pdf.page-numbers-pdf`, `pdf.metadata-pdf`, `pdf.crop-pdf`, `pdf.flatten-pdf`, `pdf.header-footer-pdf`, `pdf.resize-pdf` | Existing PDF editing adapters; local/hybrid | Shell migrated; actual option schemas retained; structural versus lossy compression boundary remains explicit. |
| `pdf.sign-pdf`, `pdf.unlock-pdf`, `pdf.protect-pdf`, `pdf.compare-pdf`, `pdf.redact-pdf`, `pdf.pdf-ocr`, `pdf.sanitize-pdf`, `pdf.verify-pdf` | Existing security adapters; hybrid/server as selected by dispatch | Shell migrated; consent, password handling, OCR language, and verification limitations retained. Verified signing and representative security routes. |

## SVG — 21 tools

| Tool IDs | Adapter / mode | Migration status |
| --- | --- | --- |
| `svg.png-to-svg`, `svg.jpg-to-svg`, `svg.webp-to-svg`, `svg.gif-to-svg`, `svg.avif-to-svg`, `svg.tiff-to-svg`, `svg.bmp-to-svg` | Existing vectorization adapters; hybrid, TIFF server | Shell migrated; frame selection retained where applicable; SVG output remains geometry rather than a Base64 bitmap wrapper. |
| `svg.svg-color-editor`, `svg.svg-palette-swapper`, `svg.svg-optimizer` | Existing safe SVG editor/optimizer adapters; hybrid | Shell migrated; safe preview and existing color/reference rules retained. |
| `svg.svg-to-png`, `svg.svg-to-webp` | Existing rasterization adapters; local | Shell migrated; width/height/scale controls retained. |
| `svg.svg-to-dxf`, `svg.png-to-dxf`, `svg.jpg-to-dxf` | Existing DXF/vector export adapters; hybrid | Shell migrated; real path/DXF output contract retained. Verified PNG-to-DXF route. |
| `svg.svg-to-react`, `svg.svg-to-base64`, `svg.svg-to-favicon`, `svg.svg-to-dst` | Existing code/data/export adapters; hybrid | Shell migrated; output format and safe parsing boundaries retained. |
| `svg.svg-pattern-maker`, `svg.svg-qr-code` | Existing generator adapters; hybrid | Shell migrated; generator-specific options retained; no placeholder output introduced. |

## Image — 20 tools

| Tool IDs | Adapter / mode | Migration status |
| --- | --- | --- |
| `image.compress-png`, `image.compress-jpeg`, `image.compress-webp`, `image.compress-avif`, `image.image-compressor` | Existing image compression adapters; local | Shell migrated; quality/dimension options, batch queue, per-file results, real size delta, and no-upload boundary retained. Representative image compressor flow verified with a real PNG. |
| `image.png-to-jpg`, `image.jpg-to-png`, `image.png-to-webp`, `image.jpg-to-webp`, `image.webp-to-png`, `image.webp-to-jpg`, `image.png-to-avif`, `image.jpg-to-avif`, `image.avif-to-png`, `image.avif-to-jpg` | Existing image conversion adapters; local | Shell migrated; format-specific options and browser codec limitations retained. |
| `image.resize-image`, `image.crop-image`, `image.rotate-image`, `image.image-background`, `image.strip-exif` | Existing image editing/metadata adapters; local | Shell migrated; dimension, crop, orientation, background, and metadata behavior retained. |

## Icons — 1 tool

| Tool ID | Adapter / mode | Migration status |
| --- | --- | --- |
| `icons.icon-pack` | Existing icon pack adapter; local | Shell migrated; ICO, favicon, PWA, Android resources, fit/padding/background controls and ZIP packaging retained. It is described as resources, not an installable APK. Representative route and output smoke checked. |

## Evidence and remaining compatibility work

- Route generation built 764 static pages, including all 82 tools across all 8 locales.
- Existing browser smoke selectors and true-file processing tests remain in place; new discovery and preference flows are covered by browser tests in `tests/browser/`.
- The matrix records UI compatibility, not a claim that every pre-existing engine gap was newly fixed. Known engine boundaries remain in `packages/tool-registry/src/index.ts`, `apps/web/lib/server-processing.ts`, and the existing processing package.
- Full all-tool output parsing and every three-step chain are still a regression pass item; they must be reported as tested or pending in `docs/upgrade/acceptance.md`, never inferred from route rendering alone.
