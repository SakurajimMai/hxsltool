# Open product retirement and internal dependency matrix

The current scope retires products aimed at third-party API consumers and terminal users. It does not remove the private web-processing transport or processing engines.

| Surface | Product status | V3 action | Internal replacement/retained dependency |
| --- | --- | --- | --- |
| `/api/openapi.json` | Retired | Return explicit `410`, `no-store`, `noindex`; remove the OpenAPI document | None; web UI does not need a public schema |
| `/api/v1/capabilities` | Retired | Return explicit `410`; remove public capability discovery | Admin reads the code registry server-side |
| `/api/v1/compress/image` + API key branch | Retired | Return explicit `410`; remove API-key product path and quota copy | Web UI uses the generic tokenized job route |
| `/api/v1/jobs` and `/api/v1/jobs/:id*` | Internal web dependency | Keep, validate and rate-limit; never advertise as an open API | Browser upload, status, cancellation, deletion, and temporary download |
| `/api/health` | Internal health check | Keep `no-store`; not a product page | Compose and deployment healthcheck |
| Localized `/api` page | Retired | Return a normal localized 404; remove from navigation, search, structured data and sitemap | None |
| `@hxsl/cli` package and CLI docs/install flow | Retired | Remove workspace/build/README product entry and API-key server mode | Existing processing package remains used by web/worker |
| `scripts/api-key.mjs` | Retired | Remove public API key operator flow | Admin initialization and session auth are separate |
| qpdf/LibreOffice/worker/Redis | Internal dependency | Keep unchanged in principle and harden through effective limits | Existing server tool engine and queue |

Historical planning documents may mention the superseded API/CLI scope, but current README, help, navigation, SEO, sitemap, structured data, and admin UI must not promote it.

No production credentials, database records, job volumes, DNS records, or remote branches are deleted by this retirement.
