# Prompt: migrate the rest of the Sagan Passport pages to Sanity

> Paste this whole file into a new Claude Code session opened at the repo root
> (`/Users/sajjad/Desktop/Saganpassport Website`). It documents the exact,
> already-proven pattern used to connect the **homepage** and **pricing** page
> to Sanity. Follow it page-by-page for the remaining pages.

---

## Your task

This Astro + Sanity monorepo has its homepage and pricing page already connected
to Sanity. Do the **same migration** for the remaining pages: move their
hardcoded content + Framer-hosted images into Sanity, refactor the Astro
components to read from Sanity, then build, commit, push, and redeploy the studio.

**Ask me which page to start with**, then do that one page end-to-end before
moving on. Don't try to do all pages in one shot.

---

## Project facts

- **Monorepo (pnpm):** `web/` (Astro 6, static build, deployed to Netlify from `web/dist`) and `studio/` (Sanity 5).
- **Sanity project:** `projectId: 3ofs1zkm`, `dataset: production` (hardcoded in `web/astro.config.mjs` and `studio/sanity.config.ts`).
- **Dataset is public**, so the Astro build reads it at build time with **no token**. Image/content writes need auth (see below).
- **Studio is deployed** at `https://saganpassport.sanity.studio/` (host set in `studio/sanity.cli.ts`).
- **Auto-rebuild:** a Sanity webhook → Netlify build hook is live, so **publishing in the Studio rebuilds the live site** (~1–2 min). The site is static, so content changes only appear after a rebuild.
- **Prefetch** is already enabled in `web/astro.config.mjs` (don't touch).
- You are authenticated: `sanity login` is done. Run write scripts with `npx sanity exec <script> --with-user-token`.
- Pushes go **directly to `main`** (the user has approved this). Commit messages end with the repo's `Co-Authored-By` trailer.

---

## The proven pattern (what was done for homepage + pricing)

For each page, repeat these steps:

### 1. Explore the page
Read `web/src/pages/<page>.astro` and every component/data file it imports.
Inventory: all hardcoded text, and every `framerusercontent.com` image URL.

### 2. Sanity schemas (`studio/schemaTypes/`)
- Create a **singleton document** schema for the page (e.g. `howItWorks.ts`) with a
  `seoTitle` field + one field/section per chunk of content. Use field `groups`
  for readability (see `homepage.ts` for the grouped example).
- Factor repeated structures into small **object** schemas (like the existing
  `button`, `person`, `feature`, `testimonialItem`, `slide`, `planItem`). **Reuse
  existing object types** where they fit instead of making new ones.
- Use `defineType`/`defineField`, no semicolons, single quotes (matches `navCard.ts`).
- Images are `type: 'image'` with `options: {hotspot: true}`.
- `preview.prepare: () => ({title: '<Page name>'})` for the singleton.
- Register every new type in `studio/schemaTypes/index.ts`.
- Wire the singleton in `studio/sanity.config.ts` in **three places** (copy the
  homepage/pricing lines): the `structureTool` list item, the
  `newDocumentOptions` filter array, and the `actions` singleton-guard array.

### 3. Migration script (`studio/scripts/migrate<Page>.ts`)
Copy `studio/scripts/migratePricing.ts` (no images) or `migrateHomepage.ts` (with
images) as the template. Key pieces, **both required**:

```ts
import {getCliClient} from 'sanity/cli'
const client = getCliClient()

// (A) Every object inside a Sanity ARRAY needs a unique _key, or the Studio
// shows a "Missing keys" error. Always wrap array items:
let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = (arr) => arr.map((item) => ({_key: k(), ...item}))

// (B) Upload Framer images as Sanity assets (dedupes identical content by hash,
// so re-runs are safe). Cache by URL so a repeated image uploads once:
const cache = new Map()
async function uploadImage(url) {
  if (cache.has(url)) return cache.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop()?.split('?')[0] || 'image'
  const asset = await client.assets.upload('image', buffer, {filename})
  const ref = {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}
  cache.set(url, ref)
  return ref
}
```

Build the document with a **fixed `_id`** equal to the schema name (e.g.
`{_id: 'howItWorks', _type: 'howItWorks', ...}`), copy the page's text
**verbatim** (preserve curly quotes `'` `'` `"` `"` and em dashes `—`), set image
fields to the `uploadImage()` refs, wrap every array with `withKeys(...)`, and add
`_type` to each array object. Finish with `await client.createOrReplace(doc)`.

Run it:
```bash
cd studio && npx sanity exec scripts/migrate<Page>.ts --with-user-token
```
⚠️ Migration scripts overwrite the whole document — only run once per page; after
that the user edits in the Studio.

### 4. Astro data layer (`web/src/lib/<page>.ts`)
Copy `web/src/lib/pricing.ts`. Export TS interfaces + a GROQ query + an async
`get<Page>()` that does `sanityClient.fetch(QUERY) ?? {}`. Import
`sanityClient` from `'sanity:client'`. For images, project the raw image object
in GROQ and resolve to URLs in components with the existing
`imgUrl()` helper from `web/src/lib/sanityImage.ts` (`imgUrl(source)` →
CDN URL string; returns `''` if unset).

### 5. Refactor the Astro components
- In `web/src/pages/<page>.astro`: `const data = await get<Page>()`, pass
  `data.seoTitle ?? '<fallback>'` to `<Layout title=…>`, and pass each section's
  data into its component as props.
- In each component: replace the hardcoded `const` arrays/strings with
  `interface Props { … }` + `const { … } = Astro.props;`. Convert Sanity image
  refs to URLs with `imgUrl(...)` wherever a `src`/`background-image` string is
  expected.
- **Keep hardcoded (by design):** Spline scene URLs, the Calendly link, the
  Portal/AI-Agents URLs, and the **inlined SVG icons** (e.g. in
  `MembershipToggle.astro`) — those are code, not editable content.
- If a data file becomes fully unused after the refactor, delete it (as was done
  with `homepage/testimonials.ts`). If only a *type* is still imported, keep the
  type and remove the data (as was done with `pricing/pricing.ts`).

### 6. Verify
```bash
pnpm --filter ./web typecheck        # must be 0 errors
pnpm --filter ./web build            # must complete
```
Then spot-check `web/dist/<page>/index.html`: confirm the migrated text is present
and image `src`s point at `cdn.sanity.io`, not `framerusercontent.com`. (Note:
`AppearText` splits headings into per-word `<span>`s, so grep single words, not
whole phrases.)

### 7. Ship
```bash
git add -A && git commit   # focused message + Co-Authored-By trailer
git push origin main
cd studio && npx sanity deploy   # REQUIRED after any schema change so the new
                                 # singleton appears in the deployed Studio
```

---

## ⚠️ Shared components — handle carefully

Some components are used by more than one page. Migrating them naively would
change another page silently. Known shared piece:

- **`web/src/components/howitworks/MembershipSection.astro`** (+ its
  `MembershipToggle.astro`, which has **4 Framer tab images** + inlined SVG icons)
  is used by **both** `pricing.astro` and `how-it-works.astro`. It was left
  hardcoded on purpose during the pricing migration.

For shared components, prefer a **shared singleton** (e.g. `membership`) queried by
both pages, rather than embedding the content in one page's document. Flag any
other shared component you find and confirm the approach before refactoring it.

---

## Remaining pages (suggest tackling in this order)

| Page | Entry | Components / data to migrate | Images? |
|---|---|---|---|
| How It Works | `web/src/pages/how-it-works.astro` | `components/howitworks/` (HiwHero, ProcessSection, ProofSection, FaqSection/FaqAccordion) + shared MembershipSection | check each |
| Membership (shared) | used by how-it-works + pricing | `components/howitworks/MembershipToggle.astro` (TABS data) | yes — 4 tab images |
| Sagan University | `web/src/pages/sagan-university.astro` | `components/saganuniversity/` | yes (check) |
| Customers (7 verticals) | `web/src/pages/customers/*` | `components/customer/CustomerTemplate.astro` + `web/src/data/customers.ts` | yes — many |
| Blog | `web/src/pages/blog/*` | `components/blog/` + `web/src/data/blog.ts` (3 posts, rich HTML) | yes |
| Resources | `web/src/pages/resources/*` | `components/resources/` + `web/src/data/resources.ts` (3 case studies) | yes |
| 404 | `web/src/pages/404.astro` | inline | likely none |

Notes:
- **Customers/Blog/Resources** are multi-entry (one document per vertical/post/case
  study), not singletons. Use a normal document type (not a singleton) with a
  `slug` field, and have the Astro dynamic route (`[slug].astro`) query by slug.
  These have rich HTML bodies — consider Portable Text (block content) or a
  long-text field; confirm with the user.
- Blog/resources bodies currently store raw HTML strings — ask the user whether to
  keep HTML (simple text field rendered with `set:html`) or convert to Sanity
  Portable Text (cleaner, but more refactor).

---

## Reference files to copy from (already in the repo)

- Schema (grouped singleton): `studio/schemaTypes/homepage.ts`
- Schema (simple singleton + object): `studio/schemaTypes/pricing.ts`, `planItem.ts`
- Singleton wiring: `studio/sanity.config.ts`
- Migration (with images + `_key`): `studio/scripts/migrateHomepage.ts`
- Migration (no images): `studio/scripts/migratePricing.ts`
- Data layer: `web/src/lib/homepage.ts`, `web/src/lib/pricing.ts`
- Image helper: `web/src/lib/sanityImage.ts` (`urlFor`, `imgUrl`)
- Refactored components: `web/src/components/homepage/*`, `web/src/components/pricing/PricingTable.astro`

Start by asking me which page to convert first.
