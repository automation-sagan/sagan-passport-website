/**
 * One-off migration: create/replace one `blog` document per post. Source content
 * is the normalized BlogPost data (web/src/data/blog.ts) — the same posts as the
 * Framer "Blog" CMS export, already collapsed into intro + cost cards + sections,
 * which is exactly what the article template renders. Uploads author + cover
 * images; section/intro bodies keep their original HTML.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateBlog.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'
import {BLOG_POSTS} from '../../web/src/data/blog'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`
const withKeys = <T extends Record<string, any>>(arr: T[]) => arr.map((item) => ({_key: k(), ...item}))

const uploadCache = new Map<string, {_type: 'image'; asset: {_type: 'reference'; _ref: string}}>()
async function uploadImage(url?: string) {
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

async function main() {
  // Clean slate so re-runs don't leave duplicates.
  await client.delete({query: '*[_type == "blog"]'})

  for (const p of BLOG_POSTS) {
    console.log(`\n${p.slug}`)
    const authorImage = await uploadImage(p.authorImage)
    const image = await uploadImage(p.image)

    const doc: Record<string, any> = {
      _id: `blog-${p.slug}`, // dot-free id → readable by the tokenless build
      _type: 'blog',
      title: p.title,
      slug: {_type: 'slug', current: p.slug},
      category: p.category,
      readTime: p.readTime,
      author: p.author,
      authorImage,
      image,
      introHtml: p.introHtml,
      costNote: p.costNote,
      costCards: withKeys((p.costCards ?? []).map((c) => ({_type: 'blogCostCard', ...c}))),
      sections: withKeys(
        (p.sections ?? []).map((s) => ({
          _type: 'blogSection',
          label: s.label,
          title: s.title,
          content: s.html,
        })),
      ),
    }
    if (p.date) doc.date = p.date

    await client.createOrReplace(doc)
    console.log(`✓ ${doc._id}`)
  }
  const count = await client.fetch('count(*[_type == "blog"])')
  console.log(`\n✓ Done. ${count} blog documents written.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
