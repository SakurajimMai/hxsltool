# V3 configuration and persistence model

## Three configuration layers

1. **Technical capability (code, read-only in admin):** stable tool ID and route, category, real input/output, adapter, local/server/hybrid mode, option schema, and engine capability.
2. **Operational content (SQLite, admin-maintainable):** featured/order/aliases, safe default options, lower limits within deployment caps, accepting-new-tasks, maintenance state, localized content, SEO fields, site copy, announcements, and guides.
3. **Deployment/security (environment or deployment secret):** database path/volume, passwords and session secrets, trusted proxy/TLS, job storage, worker resources, hard upper limits, and canonical domain.

The effective service is `code defaults + published operational overlay + schema/engine/deployment hard-cap validation`. The browser receives only the filtered public view. It never receives sessions, hashes, tokens, raw job manifests, secrets, or arbitrary configuration.

## Persistence

V3 uses Node 22's built-in `node:sqlite` through `apps/web/lib/admin-db.ts`. The database is created with restrictive permissions and WAL mode. Compose mounts it at `/var/lib/hxsl-admin/admin.sqlite` using a named persistent volume; job files remain in their separate temporary job volume.

The idempotent migration seeds only missing tool/locale records from the existing registry and translations. It never overwrites a published or draft record. New registry tools receive an initial record; retired tools and historical versions are retained as audit history.

Backups exported from the admin UI contain operational settings, published/draft content, and version metadata only. They exclude admin password hashes, sessions, MFA/recovery material, deployment secrets, job tokens, and user files. Full database backup/restore is a restricted maintenance script and must be rehearsed in an isolated directory.

## Publish lifecycle

`draft -> preview -> validation -> diff -> publish -> invalidate/reload -> public verification -> rollback`.

A draft is stored separately from the published version. Publishing requires optimistic version matching, required content/placeholder/safe-content validation, technical option validation, and hard-limit validation. A rollback writes a new published version referencing the historical version; it does not erase audit evidence.
