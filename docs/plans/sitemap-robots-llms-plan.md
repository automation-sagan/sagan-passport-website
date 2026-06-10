# Plan: Auto-generated sitemap.xml, robots.txt, llms.txt on every deploy

> Status: planned, not implemented (2026-06-11). Crawlers stay blocked for now.

## Context
The Astro site (deployed to Netlify from `web/dist`) has no sitemap or llms.txt, and robots.txt currently blocks everything. Goal: sitemap.xml and llms.txt regenerate automatically from Sanity content on every deploy — no code edits needed when content changes. Crawlers stay **blocked for now**; the plan notes the one-line flip for later.

## How auto-update works
All pages are prerendered at build time, so anything generated during the Astro build always reflects current Sanity content. Every Netlify deploy = fresh sitemap + llms.txt. Zero ongoing maintenance.

## Changes

### 1. sitemap.xml — `@astrojs/sitemap` integration
- `pnpm --filter ./web add @astrojs/sitemap`
- In `web/astro.config.mjs`:
  - add `site: 'https://saganpassport.com'`
  - add `sitemap()` to `integrations`, with a `filter` excluding `/404`, `/site-tree`, and `/api/*`
- Auto-discovers **all** prerendered pages each build (incl. dynamic `/blog/[slug]`, `/resources/[slug]`, `/customers/[slug]`, `/guides/[slug]`) — new Sanity content appears with no code change
- Output is `/sitemap-index.xml` (+ `/sitemap-0.xml`); add a Netlify redirect in `netlify.toml` so `/sitemap.xml → /sitemap-index.xml`

### 2. robots.txt — keep blocked, add sitemap reference
- Edit `web/public/robots.txt` (stays a static file):
  ```
  User-agent: *
  Disallow: /

  Sitemap: https://saganpassport.com/sitemap.xml
  ```
- **To go public later (not now):** change `Disallow: /` → `Disallow: /api/` and remove the `X-Robots-Tag = "noindex, nofollow"` header block from `netlify.toml`

### 3. llms.txt — build-time Astro endpoint
- New file `web/src/pages/llms.txt.ts` (prerendered GET endpoint → emitted as static `llms.txt` in dist)
- Content (llmstxt.org format): site name + one-line description, then sections:
  - **Main pages** — small hardcoded list (`/`, `/how-it-works`, `/pricing`, `/hire-talent`, etc.)
  - **Blog** / **Resources** / **Customers** / **Guides** — fetched from Sanity at build time
- Reuse existing slug fetchers in `web/src/lib/` (`getBlogSlugs`, `getResourceSlugs`, `getAllCustomerSlugs`, `getAllGuideSlugs`); extend the GROQ queries (or add small `getXForLlms()` variants) to also return `title` + meta description so each entry is `- [Title](url): description`
- Regenerates from Sanity on every deploy automatically

### 4. Optional (content updates without manual deploys)
- Sanity webhook → Netlify build hook, so publishing content in Sanity triggers a rebuild (also fixes the existing "content 404s until redeploy" issue)

## Files touched
- `web/astro.config.mjs` — site URL + sitemap integration
- `web/package.json` — add `@astrojs/sitemap`
- `web/public/robots.txt` — add Sitemap line
- `web/src/pages/llms.txt.ts` — new
- `web/src/lib/{blog,resources,customers,guides}.ts` — extend queries with title/description
- `netlify.toml` — `/sitemap.xml` redirect

## Verification
- `pnpm --filter ./web build`, then check `web/dist/` contains `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt`, `llms.txt`
- Confirm sitemap includes dynamic slugs (grep a known blog slug) and excludes `/404`, `/site-tree`, `/api`
- `pnpm --filter ./web preview` and hit `/sitemap.xml`, `/robots.txt`, `/llms.txt`
