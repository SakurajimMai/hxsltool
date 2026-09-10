# Deployment and operations

## Configure

Copy `.env.example` to `.env` and set `SITE_URL`, `CONTACT_EMAIL` and a strong `JOB_TOKEN_SECRET`. Public origin and contact email come only from the deployment environment; they are never checked-in defaults and are not Docker build-args. Keep `ALLOW_INDEXING=false` until DNS, TLS, contact details and privacy copy have been reviewed.

Google AdSense stays off unless both `ENABLE_ADS=true` and a valid `GOOGLE_ADSENSE_CLIENT` (`ca-pub-…`) are set. Optional `GOOGLE_ADSENSE_SLOT` adds one display unit above the footer; `GOOGLE_ADSENSE_AUTO_ADS` defaults to `true`. After enabling ads, confirm `/ads.txt` and that the privacy footer no longer claims advertising scripts are absent. Restart the Web process (and rebuild if CSP was baked at image build time) after changing these values.

HXSL Tools has no user accounts, administrator login, payment providers or AI-provider runtime. Do not add retired admin, OAuth, payment or AI secrets to new deployments. The anonymous `/api/v1/jobs/*` endpoints use short-lived capability tokens and are private browser transport, not a public API.

Server job admission is bounded by `MAX_ACTIVE_JOBS` (default `4`) and `JOB_RATE_LIMIT_PER_MINUTE` (default `30` per forwarded client address). `MAX_JOB_SECONDS` (default `120`) bounds execution and `MAX_OUTPUT_BYTES` defaults to 200 MiB. These limits come from checked-in configuration and environment variables.

## Start

GitHub Actions on `main` builds `Dockerfile.web` and publishes `ghcr.io/sakurajimmai/hxsltool` (`latest` plus `sha-<commit>`). Anonymous `docker pull` works when the GHCR package is public. GitHub `verify` runs install, lint, typecheck and build; the test suite exists only locally and is not published.

Production Compose pulls that image:

```bash
docker compose up -d
curl -fsS http://127.0.0.1:13080/api/health
```

`compose.ghcr.yaml` is an alias of the same GHCR service:

```bash
docker compose -f compose.ghcr.yaml up -d
```

To build the image from local source:

```bash
docker compose -f compose.build.yaml up -d --build
```

By default Compose publishes Web on `0.0.0.0:${APP_PORT:-13080}`. Set `APP_HOST=127.0.0.1` when access should be limited to a local reverse proxy or SSH tunnel.

Server-labelled jobs execute in the Web process. Redis and a separate server Worker are not deployed. The Web service uses a read-only root filesystem, bounded temporary storage and the short-lived `hxsl-jobs` volume.

Put Caddy or Nginx in front for TLS and canonical-host redirects. Review [`docs/Caddyfile.example`](./Caddyfile.example) before use. Set `TRUSTED_PROXY=true` only when a trusted proxy overwrites `X-Forwarded-Proto`; leave it `false` for direct access.

## Zeabur

HXSL Tools needs the production Web image (`qpdf`, Poppler, Tesseract, LibreOffice). Do not let Zeabur's Node/Next builder deploy `apps/web` alone. `zbpack.json` points Git deploys at `Dockerfile.web`. Zeabur does not deploy Compose YAML.

The process listens on `HOSTNAME=0.0.0.0` and `PORT` (image default `3000`; Zeabur injects `PORT`). Job folders stay under `HXSL_JOB_DIR` (`/var/lib/hxsl`) and expire; a persistent volume is not required.

Prefer pulling the already-built GHCR image (faster, same artifact as Compose):

1. Create a Zeabur project and add a **Docker Images** service.
2. Image: `ghcr.io/sakurajimmai/hxsltool:latest` (or `sha-<commit>`). HTTP port `3000`, port name `web`.
3. Set the variables below. Generate `JOB_TOKEN_SECRET` in the dashboard; do not paste production secrets into git.
4. Bind a domain. After TLS is live, set `SITE_URL` to that origin (`https://…`, no trailing slash). Until a custom domain is bound, `${ZEABUR_WEB_URL}` is the public origin Zeabur assigned to the `web` port.
5. Confirm `GET /api/health` returns `200` and former `/en/ai/*` and `/admin` paths are `404`.

Git alternative: add a service from `SakurajimMai/hxsltool`. Zeabur must build `Dockerfile.web` (see `zbpack.json`). The first image build installs LibreOffice and is slow; if it fails on disk or time, use the GHCR image instead.

Required variables (no checked-in public origin):

| Key | Value |
| --- | --- |
| `SITE_URL` | Public origin for this deployment (`${ZEABUR_WEB_URL}` or the bound HTTPS origin) |
| `TRUSTED_PROXY` | `true` |
| `JOB_TOKEN_SECRET` | Strong random secret |
| `CONTACT_EMAIL` | Operator mailbox, or empty |
| `ALLOW_INDEXING` | `false` until origin, TLS, and privacy copy are reviewed |
| `ENABLE_SERVER_TOOLS` | `true` |
| `HXSL_JOB_DIR` | `/var/lib/hxsl` |

Optional: `SITE_NAME`, `DEFAULT_LOCALE`, ads keys, job limits. Give the service enough memory for in-process LibreOffice jobs (plan for about 2 GiB). Do not enable Zeabur's Node builder (`ZBPACK_IGNORE_DOCKERFILE`).

## Retired data

The former admin SQLite volume and private AI asset directory are no longer mounted, opened, migrated or deleted by the application. Before deploying this version, take a retention-compliant offline archive if those records must be kept. Remove any upstream AI-provider callbacks, OAuth redirect registrations and payment webhooks separately. Do not delete an old named volume as part of the application update.

Former AI, admin and login pages and APIs return `404`. Verify representative paths after deployment:

```bash
for path in /en/ai/architecture /en/ai/studio /admin /admin/login /api/ai/config /api/admin/state; do
  test "$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:13080$path")" = 404
done
```

## Health and rollback

Run the health endpoint, `pnpm test:internal`, and a representative local tool smoke test after each update. Keep the previous image tag available. If health or smoke checks fail, restore the previous image and restart; do not delete volumes as a rollback step. Job folders are temporary and expire automatically.

## Search setup

After production review, set `ALLOW_INDEXING=true`, restart the Web process, verify `/robots.txt`, `/sitemap.xml`, canonical links and hreflang, then submit the sitemap to Google Search Console and Bing Webmaster Tools. Retired AI/admin/login routes must not appear in navigation or the sitemap. Indexing policy, like origin and contact, is runtime env and is not baked into the image.

## Reverse proxy notes

Proxy `/api/v1/jobs` and downloads without caching and with buffering disabled where required. Align body-size limits with `MAX_IMAGE_MB` and `MAX_PDF_MB`. Browser-local tools should remain usable without analytics or server-job processing.
