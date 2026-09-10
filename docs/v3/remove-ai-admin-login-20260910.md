# AI, administration and login retirement

Date: 2026-09-10

Architecture AI, its account and payment flows, the administrator console, and all associated provider callbacks were removed from the current runtime. Former pages and APIs intentionally return `404` without redirecting to another feature.

The remaining product is an anonymous file-tool directory. Browser-local tools remain local. Server-labelled tools continue through token-protected `/api/v1/jobs/*` transport and execute in the Web process with configured admission, timeout and storage limits. Redis and a separate server Worker are no longer deployed.

Runtime tool publication, content, feature ordering, maintenance defaults and hard limits now come from the checked-in registry and environment configuration. The application no longer opens or mutates the retired administrator SQLite database.

No existing operator or user data was deleted by this change. The old admin volume and private AI asset paths are simply no longer declared or mounted. Operators are responsible for any separately authorized retention, archival or deletion procedure, and for disabling external OAuth registrations, AI-provider callbacks and payment webhooks.

Historical notes and evidence under `docs/ai-architecture/` and dated `docs/v3/` subdirectories are retained for audit context. They are not current deployment instructions.
