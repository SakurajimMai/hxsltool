# Architecture decisions

1. **Local-first split.** Image canvas work, SVG parsing and basic PDF page operations stay in the browser. Rendering-heavy PDF, OCR, Office and password operations require an explicit server task.
2. **Registry as source of truth.** Route generation, category navigation, capability responses and content/SEO checks read `packages/tool-registry/src/index.ts`.
3. **Short-lived jobs.** The web job layer stores inputs/results in a mode `0700` temporary root with files mode `0600`, separates random job IDs from HMAC-derived bearer tokens when `JOB_TOKEN_SECRET` is configured (with SHA-256 compatibility fallback for local development), removes inputs after processing, and expires results after 900 seconds by default.
4. **No automatic server fallback.** A browser codec failure returns a visible error. The UI never uploads a local task silently.
5. **Quality labels are conservative.** Raster-to-SVG produces shapes by bounded color-region sampling; image signatures are visual only; verification reports unknown trust states; Office/OCR/DXF/DST boundaries stay visible.
6. **Theme tokens are CSS variables.** The page supports light/dark system preference and a manual toggle without mixing component-specific palettes.
7. **Server jobs run in Web.** Server-labelled tools execute in the Web process after explicit upload consent. Each job has an abortable `MAX_JOB_SECONDS` deadline, capability-token access, bounded admission and short-lived storage; Redis and a separate server Worker are not runtime dependencies.
