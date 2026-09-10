# Design: local PDF annotate and layout

## Boundaries

Work stays inside the existing Next.js workspace, `pdf-lib` local path, and `@hxsl/processing-shared` adapters. No new engine, no upload, no infinite-canvas.

Shared and browser implementations must produce the same observable output for the seven tools. The previous page-operation slice already showed browser-only and shared-only drift (rotation overwrite, unused repeat count).

## Contracts

- Input: one PDF, existing file picker, existing option schema.
- Page selection: `options.pages` via the existing strict parser. Tools without a visible pages field still default to `all`. Crop/watermark/header/page-numbers honor selection; metadata/resize/flatten are whole-document.
- Output: a downloadable `%PDF-` file. Flatten without fields is still a valid PDF, not an error.
- Errors: `PdfPageError` + `imageProcessingError` for range/limit; other invalid numbers stay explicit failures with no download.

## Data flow

1. User selects a PDF in `/[locale]/pdf/<slug>`.
2. Thumbnails render locally (read-only; they must not rewrite the full plan).
3. `pdfLocal` in `ToolWorkspace` processes in the browser; shared `processPdf` remains the Worker/server twin.
4. Download bytes are reopened with pdf-lib in the check script (page count, size, crop box, content stream markers, info dictionary).

## Compatibility

- Stable tool IDs and routes stay unchanged.
- Do not raise `implementationStatus`.
- Do not add pages fields to metadata/resize/flatten schemas just to unify the template.

## Risks

- Browser watermark currently draws on `source` then saves `source`; the unused copied `result` document must not become the download.
- Resize “content is not scaled” must be asserted (source page markers stay, canvas size changes).
- Flatten with no form must not throw to the user.

## Rollback

Revert the check script, helper copy, and any pdfLocal/shared fixes. Evidence stays under `docs/ai-architecture/evidence/local-pdf-annotate/`.
