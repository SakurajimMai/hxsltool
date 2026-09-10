# Removal evidence

## Current route and module ownership

- `apps/web/app/[locale]/ai/**` owns the localized architecture showcase, studio, pricing, and account pages.
- `apps/web/app/api/ai/**` owns AI configuration, OAuth, users, generation jobs, uploads/assets, orders, subscriptions, and payment webhooks.
- `apps/web/lib/ai/**`, AI-named components, `apps/web/instrumentation.ts`, AI styles, and `apps/web/public/ai/**` support only that product slice.
- `apps/web/app/admin/**`, `apps/web/app/api/admin/**`, administrator components, `admin-api.ts`, `admin-auth.ts`, and `admin-db.ts` own the administration surface.
- Root package scripts and deployment configuration still expose AI/admin checks, secrets, provider settings, payment settings, the admin database mount, and the AI private-image path.

## Shared boundary

- `apps/web/lib/admin-db.ts:56-65` defines the version-1 fallback tool operational/content values.
- `apps/web/lib/admin-db.ts:167-173` supplies runtime and site settings to public code.
- `apps/web/lib/public-config.ts:1-37` reads public tool availability, content, and limits from the administrator database.
- `apps/web/lib/jobs.ts` reads administrator runtime limits and tool state for anonymous file jobs.
- `apps/web/app/layout.tsx`, header/footer, homepage, and localized informational pages read dynamic site content.
- `config/site.ts:6-32`, the tool registry, and localization helpers already contain the accepted static fallback sources.

Both repository SQLite databases were opened read-only during planning. Their `site` and `runtime` settings are version 1 defaults, no tool override has version greater than 1 or a draft, and no content version is non-default. Deployed state is not visible and the user explicitly accepted not migrating it.

## Retained system

- `/[locale]`, category, tool, guide, and informational pages
- local-first browser processing
- token-protected `/api/v1/jobs/*` browser job transport
- `/api/health`
- server-labelled file conversions executed directly in the Web process
- explicit 410 handlers for the previously retired public API product
- historical documentation/evidence, including local-tool reports under `docs/ai-architecture/`

## Product decisions

- Remove the administrator SQLite runtime dependency and use code/environment defaults.
- Remove all AI account, pricing, credit, payment, provider, and generation behavior with building AI.
- Former AI, admin, and login page/API URLs return genuine 404 responses with no redirects or tombstones.
- Do not delete existing local/deployed database or private AI asset data.

## Historical context

`trellis mem` confirmed the architecture product was introduced as a single slice consisting of image generation, Google login, credit charging, and PayPal/Creem/Stripe. The live provider task also confirms its dispatcher, encrypted secret, persisted PNG, and settlement logic belong to this slice. There is no separate consumer to preserve.

The Arabic removal record establishes 404 as the repository precedent for a removed localized page family. The public API retirement record uses 410 only because that API was a distinct documented product.
