# Implement: local PDF annotate and layout

## Ordered checklist

1. Capture a failing production baseline for the seven tools (old `.next-ai-build` if still valid, otherwise current build labeled `before`).
2. Align browser `pdfLocal` and shared adapters so selected pages, watermark/header/number strings, crop boxes, resize canvas, metadata, and flatten match the PRD.
3. Update reorder helper copy in all 15 locales to mention earlier/later buttons.
4. Add `scripts/local-pdf-annotate-check.mts` (or extend the pages script behind an env flag) that downloads and reopens real PDFs.
5. Rebuild isolated production (`NEXT_DIST_DIR=.next-ai-build`) and run the after suite.
6. View the final screenshots. Record failures in `before/`, successes in `after/`.
7. Update `docs/ai-architecture/tool-output-matrix.md`, `implement.md`, `validation.md`, and a slice review file.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH=/tmp/hxsl-annotate-admin.sqlite \
AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
HXSL_ANNOTATE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-annotate/after \
pnpm exec tsx scripts/local-pdf-annotate-check.mts
```

Also rerun `pnpm test:local:pdf-pages` without locale expansion if page-plan or `pdfLocal` shared paths change.

## Rollback points

- After baseline: stop if the script cannot start standalone.
- After code fix: keep the red baseline; do not delete failing assertions.
- After after-suite: if coverage would be claimed without download evidence, do not update the 44/82 count.

## Not in this pass

Sign-pdf, server tools, AI vendor/Google/payments, Trellis spec bootstrap, public deploy.
