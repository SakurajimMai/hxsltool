# Live image provider admission

## Goal

Use the owner-provided OpenAI-compatible Images API to generate a real architectural concept image through the existing HXSL generation path, then independently decode the stored file. Do not treat fixture transports as vendor evidence.

## Background

- PRD acceptance 5–6 require text-to-image and reference-edit through a real supplier; decoded outputs must match claimed format and size.
- Adapter is already `openai-images` (`/images/generations` and `/images/edits`).
- Transport allowlists hosts via `AI_PROVIDER_HOSTS` / `AI_IMAGE_HOSTS`, HTTPS, public IPv4, no redirects.
- Secrets are write-only encrypted in SQLite (`AI_CONFIG_ENCRYPTION_KEY`). The live key must stay outside the repository.
- Google login and payment sandbox keys are still not provided; this slice uses an isolated provisioned test user and granted credits.

## Requirements

1. Configure model `gpt-image-2` at `https://ai.aimuxa.com/v1` with credential name `images`.
2. Allowlist host `ai.aimuxa.com`. If the API returns image URLs, allowlist only those HTTPS hosts after they are observed.
3. Run at least one text-to-image job through `reserveAiJob` + `runNextAiJob` + real `providerRequest`.
4. If the supplier supports reference edits, run one edit job with a local PNG; otherwise record the actual rejection without faking success.
5. Reopen saved outputs with Sharp: PNG, exact quoted size, non-empty pixels. No placeholder or fixture bytes.
6. Charge only successful persisted images; failed or invalid output does not keep the freeze.
7. Evidence report and images must not contain the API key, Authorization headers, or full prompt dumps of the secret.

## Acceptance criteria

- Isolated live report `success: true` for generation, with independently decoded PNG path, width, height, bytes, and job settlement.
- Wallet after success shows reserved=0 and available reduced by the quoted units of persisted images.
- Logs/report strings do not match the live secret.
- No gitignored secret file is copied into `docs/`.

## Out of scope

- Google OAuth live login, PayPal/Creem/Stripe sandbox
- Public 13080 deploy, DNS/TLS
- infinite-canvas
- Remaining 31 file tools
- Committing `.env` or `/root/.grok/secrets/`
