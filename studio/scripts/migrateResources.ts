/**
 * One-off migration: create/replace one `resource` document per row of the Framer
 * "Resources" CMS export (normalized to scripts/resourcesData.json). Uploads the
 * author + main images, and stores each article's sections (HTML) + testimonials.
 *
 * Published rows -> `resource-<slug>` (dot-free id, anon-readable by the build).
 * Draft rows     -> `drafts.resource-<slug>` (stay unpublished in the Studio).
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateResources.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

// Stable, short, dot-free id from a (possibly very long) slug. Sanity caps ids at
// 128 chars, so we use a slug prefix + a deterministic hash of the full slug.
const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
const docId = (slug: string) => `resource-${slug.slice(0, 80)}-${hash(slug)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

const uploadCache = new Map<string, {_type: 'image'; asset: {_type: 'reference'; _ref: string}}>()
async function uploadImage(url: string) {
  if (!url) return undefined
  const cached = uploadCache.get(url)
  if (cached) return cached
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = url.split('/').pop()?.split('?')[0] || 'image'
  const asset = await client.assets.upload('image', buffer, {filename})
  const ref = {_type: 'image' as const, asset: {_type: 'reference' as const, _ref: asset._id}}
  uploadCache.set(url, ref)
  console.log(`  ↑ ${filename} → ${asset._id}`)
  return ref
}

interface Section {tag?: string; title?: string; content: string}
interface Testimonial {content: string; personName?: string}
interface Row {
  slug: string
  draft: boolean
  title: string
  category: string
  authorName: string
  authorImage: string
  date: string
  youtubeId: string
  mainImage: string
  sections: Section[]
  testimonials: Testimonial[]
}

const ROWS: Row[] = JSON.parse(
  readFileSync(join(__dirname, 'resourcesData.json'), 'utf-8'),
)

async function main() {
  // Clean up any prior resource docs (incl. the failed run's long-id orphans and
  // drafts) so re-runs don't leave duplicates.
  await client.delete({query: '*[_type == "resource"]'})

  let pub = 0
  let drafts = 0
  for (const r of ROWS) {
    console.log(`\n${r.draft ? '[draft] ' : ''}${r.slug}`)
    const authorImage = await uploadImage(r.authorImage)
    const mainImage = await uploadImage(r.mainImage)

    const baseId = docId(r.slug)
    const doc: Record<string, any> = {
      _id: r.draft ? `drafts.${baseId}` : baseId,
      _type: 'resource',
      title: r.title,
      slug: {_type: 'slug', current: r.slug},
      category: r.category,
      authorName: r.authorName,
      authorImage,
      mainImage,
      youtubeId: r.youtubeId,
      sections: withKeys(r.sections.map((s) => ({_type: 'resourceSection', ...s}))),
      testimonials: withKeys(r.testimonials.map((t) => ({_type: 'resourceTestimonial', ...t}))),
    }
    if (r.date) doc.date = r.date

    await client.createOrReplace(doc)
    r.draft ? drafts++ : pub++
    console.log(`✓ ${doc._id}`)
  }
  console.log(`\n✓ Done. ${pub} published + ${drafts} draft resource documents written.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
