# Reference feature matrix

This matrix is the single human-readable scope audit. Names were checked against the public reference landing pages on 2026-09-06; implementations belong to HXSL and do not call those sites. `implemented` means a registry entry and an adapter/workbench path exist; `verified` is reserved for output tests that have run.

## PDF

| # | Reference task | HXSL tool ID | Input → output | Mode | Test path | Status |
|---:|---|---|---|---|---|---|
| 1 | Merge PDF | `pdf.merge-pdf` | PDF → PDF | local | `processing-shared` | implemented |
| 2 | Split PDF | `pdf.split-pdf` | PDF → PDF | local | `processing-shared` | implemented |
| 3 | Rotate PDF | `pdf.rotate-pdf` | PDF → PDF | local | `processing-shared` | implemented |
| 4 | Reorder Pages | `pdf.reorder-pages` | PDF → PDF | local | browser Playwright; rendered thumbnails with keyboard/drag ordering | verified |
| 5 | Extract Pages | `pdf.extract-pages` | PDF → PDF | local | `processing-shared` | implemented |
| 6 | Delete Pages | `pdf.delete-pages` | PDF → PDF | local | `processing-shared` | implemented |
| 7 | Reverse PDF | `pdf.reverse-pdf` | PDF → PDF | local | `processing-shared` | implemented |
| 8 | Duplicate Pages | `pdf.duplicate-pages` | PDF → PDF | local | `processing-shared` | implemented |
| 9 | PDF → PNG | `pdf.pdf-to-png` | PDF → PNG/ZIP | hybrid | server job | implemented |
| 10 | PDF → JPG | `pdf.pdf-to-jpg` | PDF → JPG/ZIP | hybrid | server job | implemented |
| 11 | PDF → WebP | `pdf.pdf-to-webp` | PDF → WebP/ZIP | hybrid | server job | implemented |
| 12 | PNG → PDF | `pdf.png-to-pdf` | PNG → PDF | hybrid | shared PDF | implemented |
| 13 | JPG → PDF | `pdf.jpg-to-pdf` | JPG → PDF | hybrid | shared PDF | implemented |
| 14 | WebP → PDF | `pdf.webp-to-pdf` | WebP → PDF | hybrid | shared PDF | implemented |
| 15 | PDF → Text | `pdf.pdf-to-text` | PDF → TXT | server | server job | implemented |
| 16 | BMP → PDF | `pdf.bmp-to-pdf` | BMP → PDF | hybrid | shared PDF | implemented |
| 17 | GIF → PDF | `pdf.gif-to-pdf` | GIF frame → PDF | hybrid | shared PDF | implemented |
| 18 | SVG → PDF | `pdf.svg-to-pdf` | SVG → PDF | hybrid | shared PDF | implemented |
| 19 | PDF → Word | `pdf.pdf-to-docx` | PDF → DOCX | server | basic editable paragraph reconstruction | implemented |
| 20 | PDF → Excel | `pdf.pdf-to-xlsx` | PDF → XLSX cells | server | basic line/tab/spacing cell reconstruction; no table OCR | implemented |
| 21 | PDF → PPTX | `pdf.pdf-to-pptx` | PDF → PPTX | server | basic editable text slide reconstruction; no layout-perfect conversion | implemented |
| 22 | Word → PDF | `pdf.docx-to-pdf` | DOCX → PDF | server | LibreOffice worker | implemented |
| 23 | Excel → PDF | `pdf.xlsx-to-pdf` | XLSX → PDF | server | LibreOffice worker | implemented |
| 24 | PowerPoint → PDF | `pdf.pptx-to-pdf` | PPTX → PDF | server | LibreOffice worker | implemented |
| 25 | Compress PDF | `pdf.compress-pdf` | PDF → PDF | hybrid | qpdf structural / Ghostscript lossy | implemented |
| 26 | Add Watermark | `pdf.watermark-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 27 | Add Page Numbers | `pdf.page-numbers-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 28 | Edit Metadata | `pdf.metadata-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 29 | Crop PDF | `pdf.crop-pdf` | PDF → PDF | local | PDF fixture plus inset-aware thumbnail preview | verified |
| 30 | Flatten PDF | `pdf.flatten-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 31 | Header & Footer | `pdf.header-footer-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 32 | Resize PDF | `pdf.resize-pdf` | PDF → PDF | local | PDF fixture | implemented |
| 33 | Sign PDF | `pdf.sign-pdf` | PDF → PDF | hybrid | typed/drawn/uploaded appearance signature; visual-only boundary | verified |
| 34 | Unlock PDF | `pdf.unlock-pdf` | encrypted PDF → PDF | server | qpdf path | implemented |
| 35 | Protect PDF | `pdf.protect-pdf` | PDF → encrypted PDF | server | qpdf path | implemented |
| 36 | Compare PDF | `pdf.compare-pdf` | PDF → report | hybrid | selectable text diff; optional 72 DPI visual diff | implemented |
| 37 | Redact PDF | `pdf.redact-pdf` | PDF → rebuilt PDF | hybrid | pixel/source check | implemented |
| 38 | PDF OCR | `pdf.pdf-ocr` | scan → ZIP(TXT + searchable PDF) | server | OCR fixture / ZIP structure | implemented |
| 39 | Sanitize PDF | `pdf.sanitize-pdf` | PDF → clean copy | hybrid | clean-copy boundary; not full active-content scanner | implemented |
| 40 | Verify PDF | `pdf.verify-pdf` | PDF → report | server | qpdf integrity plus explicit signature/trust boundary | implemented |

The core browser build exposes honest engine boundaries for tasks that need rendering, Office, OCR, qpdf or signature libraries. They do not silently fall back to a screenshot or claim a weaker result is equivalent. Office exports are intentionally basic reconstructions: DOCX paragraphs, XLSX text cells and a PPTX text slide are valid/editable package outputs, not layout-perfect document conversion. OCR returns a ZIP containing both the searchable PDF and the extracted TXT file.

## SVG, image and icon scope

| Reference family | HXSL IDs | Input → output | Mode | Boundary |
|---|---|---|---|---|
| Raster to SVG | `svg.png-to-svg`, `svg.jpg-to-svg`, `svg.webp-to-svg`, `svg.gif-to-svg`, `svg.avif-to-svg`, `svg.tiff-to-svg`, `svg.bmp-to-svg` | raster → real SVG shapes | local/server | bounded color-region reconstruction; GIF/TIFF expose explicit frame selection, and TIFF uses the Sharp worker path |
| SVG editing | `svg.svg-color-editor`, `svg.svg-palette-swapper`, `svg.svg-optimizer` | SVG → SVG | hybrid | safe XML parser, live sanitized preview, original undo choice and ten configured palettes |
| SVG export | `svg.svg-to-png`, `svg.svg-to-webp`, `pdf.svg-to-pdf`, `svg.svg-to-dxf`, `svg.svg-to-react`, `svg.svg-to-base64`, `svg.svg-to-favicon` | SVG → PNG/WebP/PDF/DXF/TSX/TXT/ZIP | local/hybrid | SVG→PDF uses server-side PDF path drawing for supported `<path>` geometry and rejects unsafe/unsupported-only input |
| Embroidery/pattern/QR | `svg.svg-to-dst`, `svg.svg-pattern-maker`, `svg.svg-qr-code` | SVG/text → DST/SVG | local | outline running-stitch only; QR is generated with a real QR encoder |
| Image compression/conversion | `image.*` (20 registry tasks) | PNG/JPG/WebP/AVIF → image | local | canvas and Sharp validate actual encoders; decoded pixel limits apply |
| Resource pack | `icons.icon-pack` | PNG/JPG/SVG → ICO/PNG/ZIP | local | ICO contains seven PNG directory entries; web/PWA/Android files are separated; fit, padding, background and mask previews share the export renderer |

## Excluded reference-site extras

Reference-site advertising, donations, affiliate destinations, login/payment flows, testimonials, hosted storage and unrelated third-party integrations are intentionally not implemented. HXSL supplies its own local workbench, API capability endpoint and CLI instead.
