# Third-party licenses

Versions below are pinned in workspace manifests or verified from the amd64 Docker image on 2026-09-06. Verify notices again when upgrading the lockfile or Debian packages.

| Component | Version | Role | License / notice |
|---|---:|---|---|
| Next.js | 15.5.6 | SSR web framework | MIT; retain upstream notices |
| React / React DOM | 19.1.0 | UI runtime | MIT; retain upstream notices |
| TypeScript | 5.9.2 | Type checking | Apache-2.0 |
| pdf-lib | 1.17.1 | PDF page assembly | MIT |
| PDF.js (`pdfjs-dist`) | 4.10.38 | lazy browser PDF thumbnail rendering | Apache-2.0 |
| Sharp | 0.34.3 | Server image codecs | Apache-2.0; libvips dependency notices apply |
| Ghostscript | 10.00.0 (Docker, Debian Bookworm) | Server-side lossy PDF image recompression | AGPL-3.0; comply with the package license before redistributing or offering modified binaries |
| qpdf | 11.3.0 (Docker) | PDF integrity, optimization and password operations | Apache-2.0; retain upstream notice |
| Poppler | 22.12.0 (Docker) | PDF rendering and text extraction | upstream GPL/LGPL component notices apply |
| Tesseract | 5.3.0 (Docker) | OCR | Apache-2.0; language-data notices may apply |
| LibreOffice | 7.4.7.2 (Docker) | Office-to-PDF conversion | MPL-2.0 and bundled-component notices apply |
| QRCode | 1.5.4 | QR encoding | MIT |
| JSZip | 3.10.1 | browser ZIP assembly | MIT/GPL-3.0 dual license; use MIT terms |
| lucide-react | 0.468.0 | interface icons | ISC; icon artwork ISC |

The project does not bundle proprietary fonts or claim that a server-installed font grants a commercial font license. Docker's Noto fonts are distributed under the SIL Open Font License; include the upstream font notice if the image or extracted fonts are redistributed. The Docker image is currently verified on Linux amd64; arm64 has not been run in this workspace.
