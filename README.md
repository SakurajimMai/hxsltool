# HXSL Tools

HXSL Tools is a Next.js App Router workspace for local-first PDF, image, SVG and icon processing. The public interface supports 15 languages: `en`, `zh-CN`, `zh-TW`, `es`, `pt-BR`, `de`, `fr`, `ja`, `ko`, `it`, `tr`, `vi`, `nl`, `pl` and `th`.

The product is account-free. Architecture AI, user login, billing and the administrator console have been retired. Their former pages and APIs return `404`; they are not redirects or compatibility shims. Historical implementation notes under `docs/ai-architecture/` remain as evidence only and do not describe the current runtime.

## Development

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:13080`. The unprefixed homepage selects a saved supported language first, then the browser's `Accept-Language`, then English.

Local checks (the test suite stays on this machine and is not published; GitHub `verify` runs install, lint, typecheck and build only):

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm build
pnpm test:e2e
pnpm verify
```

Most file tools run entirely in the browser. Server-labelled tools require explicit consent and use short-lived, token-protected folders through `/api/v1/jobs/*`. These routes are private web transport, not a public developer API. The former public API and CLI remain retired with `410` responses at their explicit retirement endpoints.

The local production-browser suites exercise actual downloaded outputs:

```bash
NEXT_DIST_DIR=.next-local-build pnpm build
pnpm test:local:images
pnpm test:local:pdf-batch
pnpm test:local:pdf-pages
pnpm test:local:pdf-annotate
pnpm test:local:svg
pnpm test:local:recompute
```

Server-labelled tools execute in the Web process with a bounded timeout. The production Web image includes qpdf, Poppler, OCR and LibreOffice; Redis and a separate server Worker are not required.

## Docker

Production Compose pulls `ghcr.io/sakurajimmai/hxsltool` (GitHub Actions publishes `latest` and `sha-<commit>` from `Dockerfile.web`):

```bash
docker compose up -d
```

`compose.ghcr.yaml` is the same GHCR service:

```bash
docker compose -f compose.ghcr.yaml up -d
```

To build the image from local source:

```bash
docker compose -f compose.build.yaml up -d --build
```

Zeabur: pull `ghcr.io/sakurajimmai/hxsltool` as a Docker service (do not use the Node/Next builder). Full steps: [docs/zeabur.md](docs/zeabur.md).

The default host binding is `0.0.0.0:13080`. For production, put Caddy or Nginx in front, restrict direct port access, and configure DNS, TLS, contact details, `ALLOW_INDEXING=true`, and webmaster verification as documented in [docs/deploy.md](docs/deploy.md).

The retired administrator volume is no longer declared or mounted. Upgrades must not delete old SQLite databases, account records, payment records or private AI files; archive or remove them only through a separate, explicitly authorized data-retention procedure. See [retirement notes](docs/v3/remove-ai-admin-login-20260910.md).
