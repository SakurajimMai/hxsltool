# Design: remove AI, administration, and login

## Architecture and Boundaries

The retained product is the localized PDF, image, SVG, and icon tool directory plus its local-first workbench. Server-labelled file conversions continue to use token-protected `/api/v1/jobs/*` routes and execute only inside the Web process. These paths do not use a user account, Redis or a separate server Worker.

The retired product slice includes:

- localized `/[locale]/ai/*` pages, AI components, AI styles, sample assets, sitemap/search/navigation entries, and AI metadata/copy
- `/api/ai/*`, Google OAuth, user sessions, credits, orders, subscriptions, payment webhooks, private AI assets, generation dispatch, provider integration, and their tests
- `/admin/*`, `/api/admin/*`, administrator sessions/MFA, dynamic tool/content/site configuration, audit and backup operations, administration components/styles/scripts, and their tests
- AI/administrator instrumentation, environment variables, dependencies, Docker filesystem paths/volumes, package scripts, and active documentation references

Historical documentation and evidence are not runtime dependencies and remain in place. This is especially important because `docs/ai-architecture/` also contains current file-tool verification records.

## Retained Data Flow

### Public content and discovery

```text
Tool registry + locale dictionaries + config/site.ts
  -> public-config.ts
  -> home/category/tool/search/sitemap pages
```

`public-config.ts` will construct public tools directly from the registry. Names, descriptions, FAQs, and tool-page content come from existing localization helpers. Featured ordering, default options, active state, and configured limits use deterministic code defaults equivalent to the current version-1 administrator seed.

Site name, contact email, indexing, and hard limits come from `config/site.ts` and environment variables. About/privacy/terms/contact body text falls back directly to the locale dictionaries. Dynamic announcements and administrator-published head metadata disappear.

### Server file jobs

```text
Anonymous browser + explicit upload consent
  -> /api/v1/jobs
  -> jobs.ts using siteConfig limits
  -> abortable in-process processing
  -> token-protected status/download
```

The job service no longer asks the administrator database for runtime limits, maintenance state, or configuration versions. Admission/output/TTL/timeout limits come from `siteConfig`; registry tools are available according to the checked-in registry. An `AbortController` per active job enforces cancellation and `MAX_JOB_SECONDS` for supported processing engines. Persisted job manifests retain a fixed configuration version only for backward-compatible shape, not dynamic publication.

## Routing Contract

Deleting the route source files is the contract. Next.js will return its normal 404 for former AI, administrator, login, callback, payment, and configuration URLs. No redirects, 410 handlers, middleware branches, or placeholder pages will remain.

The existing explicit 410 responses for the separately retired public OpenAPI/capabilities/compress API product remain unchanged.

## Package and Deployment Changes

- Remove `google-auth-library`, `stripe`, and `qrcode` when source scans confirm no retained consumer; regenerate `pnpm-lock.yaml` through pnpm.
- Remove AI/admin and server-Worker scripts from root package scripts, while keeping local-tool, generic content/SEO, health, and browser smoke checks.
- Remove AI/admin/payment/auth environment variables from `.env.example` and Compose.
- Remove the administrator persistent volume, `/var/lib/hxsl-admin` setup, and copied backup/restore scripts from the web image.
- Remove the Redis and Worker services, `Dockerfile.worker`, `apps/worker`, and Worker-specific environment variables. Keep the `hxsl-jobs` volume and Web image processing binaries.
- Do not delete existing local or deployed SQLite/private-image data. It simply stops being mounted or read by the new application. Operational cleanup is a separate, explicit action.

## Compatibility and Risks

- Production-only administrator customizations will stop applying. The user explicitly accepted returning to code/environment defaults without migrating them.
- Stale Next build artifacts may still mention deleted routes; validation uses a fresh production build and checks its route behavior, not old manifests.
- The highest regression risk is the shared public configuration boundary. Unit tests must cover deterministic tool discovery/content/limits, and browser smoke tests must cover representative local and server-backed tools.
- Removing payment webhooks means providers can no longer notify this application. Operators must disable upstream webhook registrations separately; this repository change does not mutate external provider settings.

## Rollback

Rollback requires restoring the prior application source/image and remounting the preserved administrator volume and AI asset directory with their former secrets. This change will not alter those persisted files, so source rollback does not require a data migration.
