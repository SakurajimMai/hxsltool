# Final validation: 2026-09-10

The anonymous file-tool site runs at http://188.68.56.198:13080/ with only the Web Compose service. The former server Worker and Redis containers, source package, deployment services, scripts and dependencies were removed. Browser PDF.js workers and the hxsl_hxsl-jobs volume remain required and intact.

Final follow-up fixes serialize per-job manifest writes, check task state after processing and output writes, propagate cancellation and timeout signals, and remove the unused queue-depth configuration.

Validation:

- Lint and typecheck passed for Web and both retained packages.
- Unit tests: 270 passed, 5 existing native-engine host skips. Five job tests cover successful output, token checks, missing consent, processing cancellation, output-write cancellation and timeout.
- Docker frozen dependency installation and production build passed after the final fixes.
- Chromium suite: 30/30 passed during this removal; the final follow-up changes affect server jobs and configuration only.
- Full localized SSR route checks passed during this removal.
- After final deployment, public internal smoke passed: retired AI/admin/login routes return direct 404 and existing API retirement endpoints return 410.
- After final deployment, real sanitize-pdf and qpdf verify-pdf jobs completed via the public API, returned valid downloadable outputs, and rejected a wrong capability token with 404. Synthetic jobs were deleted afterward.
- Compose reports only hxsl-web-1, healthy, bound to 0.0.0.0:13080. The short-lived jobs volume is retained.

The checkout has no valid Git repository, so no code commit or Git-backed task archive was created. Historical databases and AI evidence remain untouched.
