# Implement: remove AI, administration, and login

## Checklist

1. Establish a focused baseline for public configuration, search, jobs, content, and SEO tests; record any pre-existing failures without changing unrelated features.
2. Replace administrator-backed public configuration with deterministic registry/localization/site-config values. Update public pages and root metadata to remove database reads, announcements, and dynamic head metadata.
3. Decouple `jobs.ts` from administrator runtime/operational state while preserving token authorization, upload consent, configured limits, TTL, cancellation and downloads. Execute server-labelled jobs only in Web with an abortable configured timeout.
4. Remove AI from the homepage, header, footer, mobile navigation, search, sitemap, CSS, and tests. Delete localized AI pages, AI API routes, AI components, `lib/ai`, sample assets, and AI-only instrumentation.
5. Delete administrator pages, API routes, components, authentication/database/API libraries, presentation configuration, backup/security utilities, and administration-only tests/scripts/styles.
6. Remove AI/admin/auth/payment and server-Worker package scripts, environment settings, dependencies, Docker image steps, Compose services/mounts/volumes, Worker package/spec files, and stale TypeScript build-path entries. Regenerate the lockfile with pnpm.
7. Update README and deployment documentation to describe the retained account-free file-tool product and the fact that old data is no longer mounted. Preserve historical evidence documents.
8. Add or update regressions for static public configuration and representative former URLs returning 404. Scan retained source/config for imports, routes, environment variables, dependencies, and user-visible promotion of removed features.
9. Run focused tests, full unit/type/content/SEO checks, a clean production build, and browser smoke tests. Inspect the final route manifest and representative desktop/mobile pages for retained workflow regressions.

## Validation

```bash
pnpm --filter @hxsl/web exec vitest run lib/public-config.test.ts lib/search.test.ts lib/jobs.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm build
pnpm test:e2e
node scripts/internal-smoke.mjs
```

Fresh-build HTTP assertions:

- retained localized home/tool pages return 200
- `/api/health` remains 200
- token-protected `/api/v1/jobs/*` remains reachable and account-free
- `/en/ai/architecture`, `/en/ai/studio`, `/en/ai/pricing`, `/en/ai/account`, `/admin`, `/admin/login`, `/api/ai/config`, `/api/ai/me`, `/api/admin/state`, and `/api/admin/auth/login` return 404 without redirects
- existing retired public API endpoints still return 410

## Risky Files and Rollback Points

- `apps/web/lib/public-config.ts`: preserve tool content/limit shapes used by pages and the workbench.
- `apps/web/lib/jobs.ts`: preserve anonymous token authorization, consent, queue admission, expiry, timeout and in-process cancellation behavior.
- `apps/web/app/layout.tsx` and localized content pages: preserve metadata and locale behavior after database removal.
- `compose.yaml` and `Dockerfile.web`: remove AI/admin storage plus Redis/Worker deployment; retain `/var/lib/hxsl` and file-tool engine packages in Web.
- `pnpm-lock.yaml`: change only through pnpm dependency removal/install.

At each boundary, run focused tests before deleting the old backing modules. Existing `.data` files and deployed volumes are never deletion targets.
