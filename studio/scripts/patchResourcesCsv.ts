/**
 * One-off backfill: align the existing `resource` documents with the full
 * Framer CSV export ("Resources (1).csv" at repo root), the same way
 * patchBlogSeo.ts aligned the blog with Blog.csv. The CSV is the SEO team's
 * canonical source.
 *
 * Column mapping (every CSV column is handled — none skipped):
 *   Slug                      → matches doc by slug.current
 *   :draft                    → matches the doc's draft status (drafts.* id)
 *   Title / Category / Author Name / Date  → set (Date unset when blank)
 *   Share Link                → shareLink (new field)
 *   YouTube Video Link        → youtubeId (ID extracted from the URL)
 *   Main Image / Author Image → images already live as Sanity assets (same
 *                               Framer sources) — left untouched
 *   Main Image:alt / Author Image:alt → image alt fields (blank in this
 *                               export → unset)
 *   Section 1..6 Tag/Title/Content → sections[] rebuilt wholesale; Content
 *                               converted HTML → richBody (rich text, no HTML)
 *   Testimonial 1..2 Content/Person Name → testimonials[] (blank in this
 *                               export → unset)
 *
 * Writes a backup of every resource document to
 * scripts/resourcesBackup-2026-06-10.json before patching.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchResourcesCsv.ts --with-user-token
 */
import {readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

/* ---- minimal RFC4180 CSV parser (cells contain quoted newlines + quotes) ---- */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    if (row.length > 1 || row[0] !== '') rows.push(row)
  }
  return rows
}

/* ---- HTML → Portable Text (richBody) ---------------------------------------- */
const blockContentType = Schema.compile({
  name: 'site',
  types: [
    {
      name: 'richBody',
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
            annotations: [{name: 'link', type: 'object', fields: [{name: 'href', type: 'url'}]}],
          },
        },
      ],
    },
  ],
}).get('richBody')

function htmlToRichBody(html?: string) {
  if (!html || !html.trim()) return undefined
  const cleaned = html
    .replace(/<h6\b[^>]*>/gi, '<p>')
    .replace(/<\/h6>/gi, '</p>')
    .replace(/<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
  const blocks = htmlToBlocks(cleaned, blockContentType, {
    parseHtml: (h: string) => new JSDOM(h).window.document,
  })
  return blocks.length > 0 ? blocks : undefined
}

/* ---- helpers ----------------------------------------------------------------- */
const str = (v?: string) => {
  const t = (v ?? '').trim()
  return t === '' ? undefined : t
}

function youtubeIdFrom(link?: string): string | undefined {
  const url = str(link)
  if (!url) return undefined
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([\w-]{6,})/)
  return m ? m[1] : undefined
}

/* ---- backfill ----------------------------------------------------------------- */
async function main() {
  const csv = parseCsv(readFileSync(join(__dirname, '..', '..', 'Resources (1).csv'), 'utf-8'))
  const header = csv[0]
  const col = (row: string[], name: string) => {
    const idx = header.indexOf(name)
    return idx === -1 ? undefined : row[idx]
  }

  const docs: Record<string, any>[] = await client.fetch('*[_type == "resource"]')
  const backupPath = join(__dirname, 'resourcesBackup-2026-06-10.json')
  writeFileSync(backupPath, JSON.stringify(docs, null, 1))
  console.log(`Backed up ${docs.length} resource docs → ${backupPath}\n`)

  for (const row of csv.slice(1)) {
    const slug = str(col(row, 'Slug'))
    if (!slug) continue
    const isDraft = str(col(row, ':draft')) === 'true'
    const doc = docs.find(
      (d) => d.slug?.current === slug && d._id.startsWith('drafts.') === isDraft,
    )
    if (!doc) {
      console.warn(`✗ no ${isDraft ? 'draft' : 'published'} doc for slug "${slug}" — skipped`)
      continue
    }

    const set: Record<string, any> = {
      title: str(col(row, 'Title')),
      category: str(col(row, 'Category')),
      authorName: str(col(row, 'Author Name')),
    }
    const unset: string[] = []

    const date = str(col(row, 'Date'))
    if (date) set.date = date
    else unset.push('date')

    const shareLink = str(col(row, 'Share Link'))
    if (shareLink) set.shareLink = shareLink

    const ytId = youtubeIdFrom(col(row, 'YouTube Video Link'))
    if (ytId) set.youtubeId = ytId
    else unset.push('youtubeId')

    const mainAlt = str(col(row, 'Main Image:alt'))
    const authorAlt = str(col(row, 'Author Image:alt'))
    if (mainAlt) set['mainImage.alt'] = mainAlt
    else unset.push('mainImage.alt')
    if (authorAlt) set['authorImage.alt'] = authorAlt
    else unset.push('authorImage.alt')

    // Sections 1..6, rebuilt wholesale from the CSV as rich text.
    const sections: Record<string, any>[] = []
    for (let n = 1; n <= 6; n++) {
      const tag = str(col(row, `Section ${n} Tag`))
      const title = str(col(row, `Section ${n} Title`))
      const content = htmlToRichBody(col(row, `Section ${n} Content`))
      if (!tag && !title && !content) continue
      const section: Record<string, any> = {_key: k(), _type: 'resourceSection'}
      if (tag) section.tag = tag
      if (title) section.title = title
      if (content) section.content = content
      sections.push(section)
    }
    set.sections = sections

    // Testimonials 1..2 (blank across this export → cleared to match the CSV).
    const testimonials: Record<string, any>[] = []
    for (let n = 1; n <= 2; n++) {
      const content = str(col(row, `Testimonial ${n} Content`))
      const personName = str(col(row, `Testimonial ${n} Person Name`))
      if (!content && !personName) continue
      testimonials.push({_key: k(), _type: 'resourceTestimonial', content, personName})
    }
    if (testimonials.length > 0) set.testimonials = testimonials
    else unset.push('testimonials')

    await client.patch(doc._id).set(set).unset(unset).commit()
    console.log(`✓ ${doc._id}: ${sections.length} sections${ytId ? ', yt' : ''}${shareLink ? ', share' : ''}`)
  }
  console.log('\n✓ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
