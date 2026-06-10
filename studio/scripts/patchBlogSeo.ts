/**
 * One-off backfill: align the existing `blog` documents with the full Framer
 * CSV export (../../Blog.csv) — SEO fields, image alt text, featured/sidebar
 * flags, and the per-section intro/quote/content2 the original migration
 * dropped. Body HTML is converted to Portable Text (blogBody) so editors get
 * rich text in the Studio instead of raw HTML.
 *
 * Framer template facts this mapping preserves (verified against the live
 * saganpassport.com pages):
 *   • The "Section 1 Title" CSV column is never rendered by Framer (stale
 *     data) — the S1 heading comes from "Section 1 Intro": as a big <h2> when
 *     "Section 1 Blog Title" is true, else as a bold 19px lead-in line.
 *   • <h6> in the content HTML is Framer's *body copy* preset → normal text.
 *   • Sections rebuild wholesale from the CSV (it is the source of truth; the
 *     existing Sanity sections came from this same export).
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchBlogSeo.ts --with-user-token
 */
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'

const client = getCliClient()

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

/* ---- HTML → Portable Text -------------------------------------------------- */
// Compile just the blogBody type (same shape as schemaTypes/blogBody.ts) so
// block-tools knows the allowed styles/marks.
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

function htmlToPt(html?: string) {
  if (!html || !html.trim()) return undefined
  const cleaned = html
    // Framer body-copy preset: <h6> is body text, not a heading
    .replace(/<h6\b[^>]*>/gi, '<p>')
    .replace(/<\/h6>/gi, '</p>')
    // spacer paragraphs (<p dir="auto"><br></p>)
    .replace(/<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
  const blocks = htmlToBlocks(cleaned, blockContentType, {
    parseHtml: (h: string) => new JSDOM(h).window.document,
  })
  return blocks.length > 0 ? blocks : undefined
}

/* ---- CSV row mapping ------------------------------------------------------- */
const bool = (v?: string) => (v ?? '').trim().toLowerCase() === 'true'
const str = (v?: string) => {
  const t = (v ?? '').trim()
  return t === '' ? undefined : t
}

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

async function main() {
  const csv = parseCsv(readFileSync(join(__dirname, '..', '..', 'Blog.csv'), 'utf-8'))
  const header = csv[0]
  const col = (row: string[], name: string) => {
    const idx = header.indexOf(name)
    return idx === -1 ? undefined : row[idx]
  }

  for (const row of csv.slice(1)) {
    const slug = str(col(row, 'Slug'))
    if (!slug) continue
    const id = `blog-${slug}`
    console.log(`\n${id}`)

    const set: Record<string, any> = {
      useH2Headings: bool(col(row, 'Use H2 Headings')),
      featured: bool(col(row, 'Featured')),
      showSidebar: bool(col(row, 'Show Sidebar')),
    }

    const seoTitle = str(col(row, 'SEO Title'))
    const seoDescription = str(col(row, 'SEO Description'))
    if (seoTitle) set.seoTitle = seoTitle
    if (seoDescription) set.seoDescription = seoDescription

    const schemaMarkup = str(col(row, 'Schema Markup'))
    if (schemaMarkup) {
      JSON.parse(schemaMarkup) // fail fast on invalid JSON-LD
      set.schemaMarkup = schemaMarkup
    }

    const imageAlt = str(col(row, 'Image:alt'))
    const authorImageAlt = str(col(row, 'Author Image:alt'))
    if (imageAlt) set['image.alt'] = imageAlt
    if (authorImageAlt) set['authorImage.alt'] = authorImageAlt

    const intro = htmlToPt(col(row, 'Intro Text'))
    if (intro) set.intro = intro

    // Sections 1..13, rebuilt wholesale from the CSV.
    const sections: Record<string, any>[] = []
    const s1HeadingIsBlogTitle = bool(col(row, 'Section 1 Blog Title'))
    for (let n = 1; n <= 13; n++) {
      const label = str(col(row, `Section ${n} Label`))
      const s1Intro = n === 1 ? str(col(row, 'Section 1 Intro')) : undefined
      const title =
        n === 1
          ? s1HeadingIsBlogTitle
            ? s1Intro // Framer renders the S1 Intro as the big section heading
            : undefined
          : str(col(row, `Section ${n} Title`))
      const introLine = n === 1 && !s1HeadingIsBlogTitle ? s1Intro : undefined
      const content = htmlToPt(col(row, `Section ${n} Content`))
      const content2 = htmlToPt(col(row, `Section ${n} Content 2`))
      const quote = str(col(row, `Section ${n} Quote`)) ?? str(col(row, `Section ${n} Qoute`))

      if (!label && !title && !introLine && !content && !content2 && !quote) continue
      const section: Record<string, any> = {_key: k(), _type: 'blogSection'}
      if (label) section.label = label
      if (title) section.title = title
      if (introLine) section.intro = introLine
      if (content) section.content = content
      if (quote) section.quote = quote
      if (content2) section.content2 = content2
      sections.push(section)
      console.log(
        `  · section ${n}: ${title ?? introLine ?? '(no title)'}${quote ? ' +quote' : ''}${content2 ? ' +content2' : ''}`,
      )
    }
    set.sections = sections

    await client.patch(id).set(set).unset(['introHtml']).commit()
    console.log(`✓ ${id}: ${sections.length} sections, seo=${Boolean(seoTitle)}, jsonld=${Boolean(schemaMarkup)}`)
  }
  console.log('\n✓ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
