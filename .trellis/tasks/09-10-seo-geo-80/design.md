# Design — SEO / GEO 80+

## Boundary

Change public discovery only: robots, sitemap, metadata, JSON-LD, page copy, static assets, middleware redirect, mobile menu portal, and compose/env defaults. Do not change job processing, tool-registry capability contracts, or retired AI/admin routes.

## Public origin

`config/site.ts` remains the single origin. Compose/Dockerfile production defaults become:

- `ALLOW_INDEXING=true`
- `CONTACT_EMAIL=hello@hxsl.org`
- `SITE_URL=http://188.68.56.198:13080` (the live origin until DNS/TLS for hxsl.org exist)

Organization copy still names the brand **HXSL Tools** and states it is not Haxe Shader Language.

## Copy uniqueness

`apps/web/lib/tool-seo-copy.ts` builds per-tool intro, steps, FAQ, and meta description from registry facts (slug, formats, mode, limits, options) plus slug-specific honesty notes. `public-config.ts` consumes that instead of repeating `getPageCopy().tool.*` three times.

## Schema

Shared helper `apps/web/lib/json-ld.ts`: Organization (logo, email, description, alternateName), WebSite, WebPage/CollectionPage/AboutPage/ContactPage, BreadcrumbList, WebApplication + Offer. No FAQPage, no HowTo, no SearchAction, no fake ratings.

## Files expected

- `apps/web/app/robots.ts`, `sitemap.ts`, `middleware.ts`, `next.config.ts`, `layout.tsx`
- `apps/web/app/llms.txt/route.ts`, `.well-known/security.txt/route.ts`, IndexNow key in `public/`
- `apps/web/lib/metadata.ts`, `json-ld.ts`, `tool-seo-copy.ts`, `public-config.ts`, `related-tools.ts`
- Locale pages (home, about, contact, guides, tool, category)
- `apps/web/components/MobileMenu.tsx`, `ToolDirectory.tsx`
- `compose.yaml`, `Dockerfile.web`, `.env.example`
- `scripts/seo-check.ts`, tests
