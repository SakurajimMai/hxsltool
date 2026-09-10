# Web Runtime Boundaries

## 1. Scope / Trigger

Use this contract when changing public tool discovery, deployment configuration, Web job transport, routes, or dependencies. HXSL Tools is an anonymous file-tool product; architecture AI, accounts, billing, and administration are not runtime extension points.

## 2. Signatures

- `getPublicTools(locale: Locale): PublicTool[]` and `getPublicTool(id, locale)` read the checked-in registry and locale dictionaries.
- `POST /api/v1/jobs` accepts the existing multipart file-tool request and returns a job id plus capability token.
- `GET|DELETE /api/v1/jobs/:id` and `GET /api/v1/jobs/:id/download` require that capability token.
- `GET /api/health` remains the unauthenticated health signature.

## 3. Contracts

- Tool publication, names, descriptions, FAQs, featured ordering, defaults, and active state come from `@hxsl/tool-registry`, localization helpers, and `apps/web/lib/public-config.ts`.
- Limits and site identity come from `config/site.ts` and the documented environment keys in `.env.example`. Public origin (`SITE_URL`) and contact (`CONTACT_EMAIL`) are env-only: trim empty values, never fall back to a checked-in hostname, public IP, or mailbox, and do not pass them as Docker build-args. `SITE_URL` must be an `http(s)` origin; a bare host is treated as `https://host`. Invalid values must not throw from `new URL()` during HTML render.
- Server-labelled tools require explicit upload consent but never a user session.
- Web stores short-lived, token-protected job files under `HXSL_JOB_DIR` and executes server-labelled jobs in-process with the configured timeout and cancellation signal.
- Serialize manifest writes per job and check active state after processing and output writes; cancelled or expired tasks must never publish late results. Admission uses `MAX_ACTIVE_JOBS`, without a separate pending queue.
- The Web runtime must not require or read administrator SQLite, AI-provider, OAuth, or payment configuration.

## 4. Validation & Error Matrix

| Condition | Required behavior |
| --- | --- |
| Unknown or disabled tool | Job creation fails as an unknown tool |
| Server-labelled tool without consent | Job creation rejects the request |
| Missing/wrong job token | Job status, cancellation, and download do not disclose the job |
| Former `/[locale]/ai/*`, `/admin/*`, `/api/ai/*`, or `/api/admin/*` URL | Direct `404`, without redirect or compatibility handler |
| Explicitly retired public OpenAPI/capabilities/compress endpoint | Existing `410` contract remains |
| Clean checkout with no `packages/*/dist` | `pnpm test`, `content:check`, and `seo:check` must build workspace packages first; they must not resolve `@hxsl/tool-registry` from `src` via runtime `exports` |

## 5. Good / Base / Bad Cases

- Good: an anonymous visitor opens a localized tool, processes locally, and downloads without any session.
- Base: a consented server-labelled tool uses `/api/v1/jobs/*`, in-Web processing, configured limits, and TTL cleanup.
- Bad: a public page imports a database-backed publication helper, introduces an account gate, or links a retired route.

## 6. Tests Required

- Unit: `public-config.test.ts`, `search.test.ts`, and `jobs.test.ts` assert registry discovery, no AI entries, configured limits, token behavior, and consent behavior.
- Static: lint, typecheck, content check, SEO check, and a production build must pass.
- GitHub `verify` is a clean checkout (`dist/` is gitignored) and runs install, lint, typecheck, and build only. Unit tests, `content:check`, `seo:check`, Playwright, and Lighthouse stay local and are not published. Root `pretest` (`pnpm build:packages`) and `@hxsl/web` `pretest` must compile `@hxsl/processing-shared` and `@hxsl/tool-registry` before local Vitest, `content:check`, or `seo:check`. Those packages export `./dist/index.js` (types still come from `src`). Do not retarget runtime `exports` at `src` — Docker and production consume `dist`.
- HTTP: representative former AI/admin/login page and API paths must be direct `404`; health and anonymous job transport must remain reachable.
- Browser: navigation and sitemap must contain no AI/admin links; representative local file workflows must still produce real downloads.

## 7. Wrong vs Correct

### Wrong

```ts
const tools = readPublishedToolsFromAdminDatabase();
if (!userSession) redirect("/login");
```

```yaml
# GitHub verify must not run the unpublished local test suite
- run: pnpm test
```

### Correct

```ts
const tools = getPublicTools(locale);
const job = await createJob(files, toolId, options, consent, clientKey);
```

```json
{
  "scripts": {
    "build:packages": "pnpm --filter @hxsl/processing-shared build && pnpm --filter @hxsl/tool-registry build",
    "pretest": "pnpm build:packages"
  }
}
```

GitHub Actions on `main` publishes `ghcr.io/sakurajimmai/hxsltool` (`latest` and `sha-<commit>`) from `Dockerfile.web`. The image build may bake product defaults such as `SITE_NAME` and `DEFAULT_LOCALE`, but not a public origin, contact address, or indexing policy. Production start is `docker compose up -d` (`compose.yaml` pulls GHCR; `compose.ghcr.yaml` is an alias). Local source builds use `compose.build.yaml`. Zeabur must run that same Web image (`zbpack.json` → `Dockerfile.web`, or pull GHCR); listen on injected `PORT`, set `TRUSTED_PROXY=true` and env-only `SITE_URL`. Operator steps live in `docs/zeabur.md`. Do not commit `.env`.
