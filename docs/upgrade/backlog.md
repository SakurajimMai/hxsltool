# UIUX V2 backlog

## P0 shipped in this upgrade

- Establish semantic design tokens for light and dark themes with one blue accent, consistent radii, focus states and reduced-motion behavior.
- Recompose primary navigation around PDF, Image, SVG and Icons. Add responsive mobile navigation.
- Add registry-backed visible search, `Ctrl/Cmd+K` command search, keyboard selection, format aliases and no-result recovery.
- Add local-only favorites, up to 8 recent tools, clear-history controls and non-sensitive parameter presets.
- Create a shared ToolShell hierarchy with breadcrumb, capability facts, consent boundary, file intake, parameters, processing, result and continuation sections.
- Add category format filters, reset and empty states.
- Add stale-result warning after option changes, retry actions, batch result counts and explicit state treatment.
- Migrate all existing public tool routes to the shared visual language without changing URL slugs or adapters.
- Review desktop, mobile, dark theme, keyboard focus and representative file workflows with real screenshots.

## P1 shipped or verified as compatibility

- Preserve all existing local/server adapters, API routes, CLI commands and Docker profiles.
- Preserve existing legal, consent and privacy wording while improving placement and hierarchy.
- Preserve JSON-LD, canonical, hreflang, sitemap and route generation from the registry.
- Add upgrade documentation, migration matrix, acceptance checklist and before/after screenshot paths.

## Existing scope boundaries

- No new conversion engine, account system, payments, permanent storage, analytics SDK, CMS or paid external service.
- Existing quality boundaries remain: basic Office reconstruction, OCR accuracy, appearance-only signatures, bounded SVG/DXF/DST geometry and explicit sanitize/verify trust states.
- Existing host-only test skips for optional native tools remain documented. Complete Docker runtime remains the integration environment.

## Follow-up after this upgrade

- Collect real-user p75 INP/LCP/CLS after production traffic exists.
- Configure the real canonical domain, DNS, TLS and webmaster verification outside this repository.
- Run isolated full-file parser/output checks for every adapter family, including the three required continuation chains: image resize/compress → format conversion, image → SVG → SVG optimization → favicon/ICO, and image → PDF → merge/compress PDF.
- Add isolated server-job tests for true cancellation, late responses, result expiry and deletion; keep them off the public deployment and use fixture files only.
- Consider a dedicated locale-aware document layout if the framework exposes route params at the root HTML boundary without making all pages dynamic.

## Deployment boundary

- The development deployment is rebuilt and reachable through `http://188.68.56.198:13080/en`; no DNS, TLS, reverse-proxy, remote push or formal production indexing change was made.
- `ALLOW_INDEXING` remains `false` in the running Compose environment. Only an operator with the canonical-domain and privacy sign-off should build a production image with `ALLOW_INDEXING=true`.
