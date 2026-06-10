/**
 * One-off blog backfill matching the live Framer site (captured 2026-06-11):
 *
 *   1. Creates the missing post "Virtual Assistant, Freelancer, or Full-Time
 *      Overseas Employee" — published on Framer 2026-06-09, *after* the
 *      Blog.csv export, so the original CSV migration never saw it. Body
 *      sections were scraped from the live page and convert to Portable Text
 *      here (same pipeline as patchBlogSeo.ts: <h6> is Framer's body-copy
 *      preset → normal text).
 *   2. Sets schemaMarkup (Article JSON-LD) on the two existing posts that
 *      were missing it, verbatim from the live pages.
 *   3. Creates the `blogIndex` singleton with the live /blog title + meta
 *      description.
 *
 * Note: the live page's Article JSON-LD for the new post had the cost post's
 * headline/description copy-pasted into it (a Framer-side mistake) — the
 * payload uses the post's real title + meta description instead.
 *
 * Data lives in blogSeoPayload.json next to this script.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/migrateBlogVaPost.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'

const client = getCliClient()

const payload = JSON.parse(readFileSync(join(__dirname, 'blogSeoPayload.json'), 'utf8'))

/* ---- HTML → Portable Text (same setup as patchBlogSeo.ts) ---- */
const blockContentType = Schema.compile({
  name: 'blog',
  types: [
    {
      name: 'blogBody',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              {name: 'link', type: 'object', fields: [{name: 'href', type: 'url'}]},
            ],
          },
        },
      ],
    },
  ],
}).get('blogBody')

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

function htmlToPt(html?: string) {
  if (!html || !html.trim()) return undefined
  const cleaned = html
    // Framer body-copy preset: <h6> is body text, not a heading
    .replace(/<h6\b[^>]*>/gi, '<p>')
    .replace(/<\/h6>/gi, '</p>')
    // spacer paragraphs / trailing breaks
    .replace(/<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
  const blocks = htmlToBlocks(cleaned, blockContentType, {
    parseHtml: (h: string) => new JSDOM(h).window.document,
  }) as Record<string, unknown>[]
  for (const b of blocks) b._key = b._key ?? k()
  return blocks.length > 0 ? blocks : undefined
}

async function run() {
  // 1. blogIndex singleton
  await client.createOrReplace({
    _id: 'blogIndex',
    _type: 'blogIndex',
    seoTitle: payload.index.seoTitle,
    seoDescription: payload.index.seoDescription,
  })
  console.log('Created blogIndex singleton')

  // 2. schemaMarkup on the two existing posts
  for (const [slug, ld] of Object.entries(payload.schemaPatches as Record<string, string>)) {
    const id = await client.fetch(`*[_type == "blog" && slug.current == $slug][0]._id`, {slug})
    if (!id) {
      console.error(`!! no blog doc for ${slug}`)
      continue
    }
    await client.patch(id).set({schemaMarkup: ld}).commit()
    console.log(`Patched schemaMarkup on ${slug}`)
  }

  // 3. the missing post
  const p = payload.post
  const res = await fetch(p.coverImageUrl)
  if (!res.ok) throw new Error(`cover download failed: ${res.status}`)
  const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {
    filename: p.coverImageUrl.split('/').pop(),
  })
  console.log(`Uploaded cover → ${asset._id}`)

  const sections = (p.sections as Record<string, string>[]).map((s) => ({
    _key: k(),
    _type: 'blogSection',
    label: s.label,
    ...(s.title ? {title: s.title} : {}),
    ...(s.intro ? {intro: s.intro} : {}),
    content: htmlToPt(s.contentHtml),
    ...(s.content2Html ? {content2: htmlToPt(s.content2Html)} : {}),
  }))

  await client.createOrReplace({
    _id: `blog-${p.slug}`,
    _type: 'blog',
    title: p.title,
    slug: {_type: 'slug', current: p.slug},
    category: p.category,
    date: p.date,
    readTime: p.readTime,
    author: p.author,
    image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}, alt: p.title},
    featured: false,
    useH2Headings: true,
    showSidebar: true,
    intro: htmlToPt(p.introHtml),
    sections,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    schemaMarkup: p.schemaMarkup,
  })
  console.log(`Created blog-${p.slug} (${sections.length} sections)`)
  console.log('Done.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
