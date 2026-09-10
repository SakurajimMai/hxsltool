# Publish hxsltool image via GitHub Actions

## Goal

Upload this project to the empty GitHub repository `SakurajimMai/hxsltool` and build/push the production Web image with GitHub Actions to GHCR.

## Requirements

- Workflow builds `Dockerfile.web` on push to `main` and on `v*` tags.
- Image name: `ghcr.io/sakurajimmai/hxsltool`.
- Tags: `latest` on default branch, git SHA, and version tags.
- Do not commit `.env`, `node_modules`, build output, Trellis runtime, or evidence dumps.
- Existing `pnpm verify` stays local; GitHub `verify` runs install, lint, typecheck, and build only. Unit tests, `content:check`, `seo:check`, Playwright, and Lighthouse stay local and are not published.

## Acceptance Criteria

- [x] `.github/workflows/image.yml` builds and pushes to GHCR with `packages: write`.
- [x] Source is on `https://github.com/SakurajimMai/hxsltool` branch `main`.
- [x] `.env` is not in git.
- [x] Deploy docs mention pulling `ghcr.io/sakurajimmai/hxsltool`.
