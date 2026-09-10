# Local PDF annotate and layout outputs

## Goal

Users can watermark, number, crop, resize, flatten, edit metadata, and add headers/footers on PDF files in the existing local workspace, then download a real PDF whose pages, boxes, text, and metadata match the chosen options. Keep the architecture AI Goal open; do not borrow infinite-canvas.

## Background

- The seven tools already exist in the registry as local PDF tools and have shared/browser implementations.
- Browser output evidence currently covers 44/82 identities. These seven are still listed as unverified in `docs/ai-architecture/tool-output-matrix.md`.
- Previous page-operation work proved that unit tests plus “file opens” are not enough: parameters can be ignored, page range can apply to the wrong document, and screenshots can miss the actual error.
- Reorder helper copy still says only drag and arrow keys, even though earlier/later buttons exist.
- Real Google login, image vendors, and PayPal/Creem/Stripe sandbox keys are not available in this environment, so they stay out of this slice.

## Requirements

1. `watermark-pdf` applies the entered text, size, position, rotation, and opacity to the selected pages only; unselected pages stay unmarked.
2. `page-numbers-pdf` writes the formatted number using `{page}` and the start value onto the selected pages at the chosen position.
3. `header-footer-pdf` writes header and footer strings, substituting `{page}`, onto selected pages; empty header or footer is omitted.
4. `crop-pdf` changes the visible crop box by the inset on selected pages and does not claim content deletion.
5. `resize-pdf` changes the page canvas to A4, Letter, or custom width/height for every page; content is not scaled.
6. `metadata-pdf` writes title, author, subject, and comma-separated keywords into the saved PDF.
7. `flatten-pdf` flattens supported AcroForm fields when present; a PDF without supported fields still downloads a valid PDF.
8. Page-range parsing reuses the existing strict `PdfPageError` path. Invalid ranges show the current locale message and do not offer a download.
9. Reorder thumbnail helper text mentions the visible earlier/later buttons in all 15 locales.
10. Desktop and a narrow mobile viewport are actually reviewed for overflow, truncation, and the visible result/error.

## Acceptance criteria

- Isolated production Chromium run covers the seven tool identities with downloaded PDFs reopened (signature, page count, sizes/crop boxes, watermark/number/header strings, metadata fields, flatten with and without a text field).
- At least one invalid page range on a ranged tool shows the localized error card, retry, and no download.
- 15-language helper strings for reorder mention move controls and keep `{n}`-safe existing error copy unchanged.
- Final screenshots of crop, watermark, page numbers, resize, metadata, flatten, and one error/mobile state are actually viewed; workspace axe on those shots has no new violations.
- Existing 7 page-operation identities are not claimed complete by this slice; coverage may rise from 44 to 51 only if all seven new identities have download evidence.
- Lint, typecheck, web tests, content 82×15, and SEO source checks pass. No public deploy, Docker rebuild, or secret collection.

## Out of scope

- `sign-pdf`, compress/lossy, sanitize, server/hybrid engines, Office conversion, OCR, unlock/protect
- Real vendor image generation, Google OAuth, PayPal/Creem/Stripe sandbox
- Filling Trellis placeholder spec files for all packages
- German `Ausgewählt` mid-word wrap (recorded leftover; not this slice)
- Public 13080, DNS/TLS, Git history (repo has no git)

## Open questions

None blocking. Slice choice follows the standing Goal’s “existing tools must not regress” and the fact that live AI/payment certification cannot run without owner credentials.
