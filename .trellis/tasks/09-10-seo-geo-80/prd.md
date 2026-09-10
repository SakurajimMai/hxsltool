# Raise live SEO and GEO scores to 80+

## Goal

Make the public HXSL Tools site crawlable, citeable, and able to score 80+ on technical, content, on-page, schema, performance, GEO, and image categories from the 2026-09-10 audit of `http://188.68.56.198:13080`.

## Requirements

- Public pages must be allowed in robots.txt for all 15 locales, with a filled sitemap, IndexNow key, and `llms.txt` as `text/plain`.
- Canonicals, Open Graph, hreflang, and schema URLs must use the configured public origin (`SITE_URL`).
- Tool, hub, about, contact, privacy, terms, and guide pages must have unique, extractable copy (not identical step/FAQ templates).
- Schema must keep WebApplication + BreadcrumbList; must not add HowTo or extra FAQPage JSON-LD for Google.
- OG image (1200×630), favicon.ico, Organization logo, and mobile-menu overlay must work.
- Retired AI/admin/login routes stay 404. No accounts, payments, or AI runtime.

## Acceptance Criteria

- [ ] Live `robots.txt` no longer `Disallow: /` when `ALLOW_INDEXING=true`; all 15 locale prefixes are allowed.
- [ ] `sitemap.xml` lists public locale/home/category/tool/guide/legal URLs on `SITE_URL`.
- [ ] `/llms.txt` returns `text/plain` and disambiguates HXSL Tools from Haxe Shader Language.
- [ ] Contact page shows a real operator email, not the unconfigured-env sentence.
- [ ] Tool pages have unique intro/steps/FAQ answers; English Merge PDF vs Split PDF copy is not a near-duplicate.
- [ ] Locale metadata includes `og:image` and `twitter:image`; `/favicon.ico` is 200.
- [ ] Tool JSON-LD has no FAQPage; Organization includes logo.
- [ ] Homepage `/` language redirect stays 307 with private cache (locale depends on cookie and Accept-Language); locale URLs are canonical.
- [ ] Mobile menu overlay is a full-viewport drawer (not trapped in the sticky header).
- [ ] `pnpm --filter @hxsl/web test`, `pnpm content:check`, and `pnpm seo:check` pass.

## Notes

DNS for `hxsl.org` and TLS on port 443 are operator steps. Code will honor `SITE_URL` / `ALLOW_INDEXING` / `CONTACT_EMAIL` so the current production origin can be indexed after rebuild.
