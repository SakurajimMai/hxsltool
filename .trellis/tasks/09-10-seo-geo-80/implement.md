# Implement — SEO / GEO 80+

1. Crawl/index: robots (15 locales + AI bots), sitemap with lastmod, IndexNow key, llms.txt route, security.txt, 301 `/` → locale.
2. Identity: compose/env CONTACT_EMAIL, ALLOW_INDEXING, SITE_URL; OG 1200×630; favicon.ico; metadata images.
3. Schema/copy: json-ld helper; unique tool-seo-copy; expand about/guides/contact/home definition block; related-tool siblings; remove FAQPage JSON-LD.
4. UX/perf: portal mobile menu; directory default all tools; static asset cache headers; X-Frame-Options.
5. Validate: unit tests, content:check, seo:check, typecheck.

Rollback: revert this task’s files; keep `ALLOW_INDEXING=false` if a rebuild must stay private.
