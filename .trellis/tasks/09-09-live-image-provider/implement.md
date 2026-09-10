# Implement: live image provider admission

## Checklist

1. Keep the live key in `/root/.grok/secrets/hxsl-live-image.env` (mode 600), never copy into `docs/` or source.
2. Add `scripts/ai-live-provider-check.mts` and `pnpm test:ai:live-provider`.
3. Probe `/v1/images/generations` through `invokeImageProvider`.
4. On a real image: persist via the job worker, decode, settle wallet.
5. On vendor 503/4xx: record the outcome without fabricating pixels.
6. Write `docs/ai-architecture/live-image-provider.md` and evidence JSON without secrets.

## Validation

```bash
set -a
. /root/.grok/secrets/hxsl-live-image.env
set +a
AI_LIVE_EVIDENCE_DIR=docs/ai-architecture/evidence/live-image-provider \
pnpm test:ai:live-provider
```

Assert the report file does not contain the secret string.
