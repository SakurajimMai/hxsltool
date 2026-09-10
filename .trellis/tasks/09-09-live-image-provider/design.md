# Design: live image provider admission

## Boundaries

Reuse `openai-images` + `providerRequest`. Do not add a chat-completions image adapter unless the live Images API is proven absent. Do not store the supplier key in the repo, docs, or evidence JSON.

## Data flow

1. Isolated SQLite + `AI_CONFIG_ENCRYPTION_KEY` + allowlisted `AI_PROVIDER_HOSTS=ai.aimuxa.com`.
2. Write credential name `images` via `writeAiSecret` from the process environment (file outside the repo).
3. Publish a one-model config: `gpt-image-2` at `https://ai.aimuxa.com/v1`.
4. `invokeImageProvider` then, on success, `reserveAiJob` + `runNextAiJob` with the real transport.
5. Sharp-decode persisted PNG; quoted size must match.

## Compatibility

- 401/403 → rejected, job fails, credits released.
- 503 and other 5xx → existing `unknown` outcome (not reclassified to pass the test).
- Image URL hosts are allowlisted only after a successful response reveals them.

## Rollback

Delete the isolated DB and evidence images. Leave production 13080 untouched. Secret file stays under `/root/.grok/secrets/` with mode 600.
