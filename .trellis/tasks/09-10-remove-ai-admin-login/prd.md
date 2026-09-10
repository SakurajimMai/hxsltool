# Remove AI admin and login

## Goal

Remove the building AI experience, administration surface, and user authentication because these product capabilities are no longer needed. Preserve the standalone local file-tool experience.

## Background

- The request explicitly removes three user-facing capabilities: building AI, administration, and user login.
- The repository contains a standalone local file-tool application alongside AI, account, payment, and administration code.
- Building AI is isolated under localized `/ai/*` pages, `/api/ai/*` endpoints, `lib/ai/*`, AI components, assets, scripts, and AI-specific dependencies.
- Administration is isolated at `/admin/*` and `/api/admin/*`, but its SQLite store also supplies public tool content, publication state, limits, site text, and head metadata (`apps/web/lib/admin-db.ts:10-44`, `apps/web/lib/public-config.ts:1-37`, `apps/web/app/layout.tsx:20-32`).
- The repository's two local administrator databases contain only version-1 defaults, no changed tool overrides, and no additional content versions. A deployed database may differ and is not available in the repository.
- The public `/api/v1/jobs/*` routes implement file conversion jobs independently of building AI or user accounts. The user subsequently chose to remove the optional Worker/Redis deployment and run these jobs only in the Web process.
- Past implementation records confirm that Google OAuth, credits, checkout, payment reconciliation, private AI assets, and the live image-provider dispatcher were introduced only for building AI and have no independent product consumer.

## Requirements

- Remove all navigation and entry points for the building AI experience.
- Remove all administration pages and administration-only server endpoints.
- Remove user registration, login, logout, account-session, and authentication-gated behavior.
- Remove AI account, pricing, credits, order, subscription, Stripe, Creem, PayPal, Google OAuth, generation, upload, asset, and AI job infrastructure because each exists only for the removed building AI capability.
- Remove feature-specific tests, scripts, configuration, assets, and dependencies when they are no longer used.
- Keep unrelated local file processing tools functional and publicly accessible without a user session.
- Keep public file-tool job APIs account-free and execute server-labelled jobs only in the Web process.
- Remove the optional server Worker, Redis queue, Worker scripts, package metadata and deployment profile. Preserve browser Web Workers used by local tools.
- Replace administrator-database reads in the retained product with tool-registry, localization, deployment configuration, and environment values. Do not preserve an administrator database runtime dependency.
- Let all former localized AI pages, administrator pages, AI APIs, administrator APIs, and authentication callbacks resolve as genuine 404 responses; do not add redirects, 410 compatibility handlers, or tombstone pages.
- Update current product and deployment documentation. Preserve historical design/review/evidence files, including local-tool evidence stored under `docs/ai-architecture/`, as non-runtime records.

## Acceptance Criteria

- [x] Building AI pages and APIs are no longer present or reachable.
- [x] Administration pages and APIs are no longer present or reachable.
- [x] Login, registration, logout, and account-session flows are no longer present or reachable.
- [x] AI billing, credits, payment webhooks, orders, subscriptions, and provider integrations are no longer present.
- [x] Administrator authentication, configuration, backup/restore, audit, security, and operational endpoints are no longer present.
- [x] The remaining product has no navigation or copy that advertises the removed capabilities.
- [x] The standalone file-tool directory, tool pages, local processing, and token-protected server job flow still work without login.
- [x] Server-labelled jobs execute in Web with timeout and cancellation signals; the site has no Redis or separate server Worker dependency.
- [x] No retained production code imports deleted feature modules.
- [x] The retained web service neither creates nor reads the administrator SQLite database.
- [x] The application no longer requires AI, payment, Google OAuth, or administrator environment variables and runtime volumes.
- [x] Representative former page and API URLs return 404 without redirecting.
- [x] Relevant lint, type-check, unit, build, and smoke checks pass for the remaining product.

## Out of Scope

- Redesigning or adding functionality to the retained local file tools.
- Deleting or mutating an existing deployed SQLite database or private AI asset directory; deployment cleanup is documented separately because those files may contain sensitive historical data.
- Migrating historical user, payment, AI job, or administrator records into another system.
- Rewriting or deleting historical implementation evidence that is not loaded by the application.

## Technical Notes

- This is a complex cross-layer removal and requires `design.md` plus `implement.md` before implementation.
- Existing public fallback sources are the tool registry and locale dictionaries for content, and `config/site.ts:6-32` for site identity and operational limits.
- Decision: remove the SQLite-backed dynamic configuration entirely and use code/environment defaults. Repository databases contain no customized published values; production customizations are intentionally not migrated by this change.
- Existing precedent uses genuine 404 responses for a removed localized page family (`docs/v3/remove-arabic-20260908.md`) and 410 only for a formerly documented public API product (`docs/v3/open-product-retirement.md`).
- Decision: former AI, administration, and authentication URLs return genuine 404 responses with no redirects or compatibility routes.
