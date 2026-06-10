/**
 * One-off sitewide migration: convert the remaining raw-HTML content fields to
 * rich text (Portable Text), mirroring the blog conversion (patchBlogSeo.ts).
 *
 *   resource (13)    sections[].content        HTML → richBody
 *   blog (3)         cta.description           HTML → richBody
 *   comparison (4)   comparisonRows[].{competitorText,saganText}
 *                                              HTML → inlineBody
 *   agentDemo (8)    heroHeadlineHtml/heroLeadHtml → heroHeadline/heroLead
 *                                              HTML → inlineBody (old unset)
 *   landingPage (3)  same as agentDemo
 *
 * Inline span styling maps to the inlineBody decorators (serialized back to
 * equivalent markup by web/src/lib/richTextHtml.ts):
 *   color #F5B800, .text-ember            → highlight
 *   .text-glacier/.text-ink/.text-tide,
 *   color #093A3E                         → accent
 *   .text-muted, .text-ash                → muted
 *   <strong class="check">                → check
 *   color var(--green) / var(--red) bold  → good / bad
 *
 * Writes a backup of every affected document to
 * scripts/richTextBackup-<date>.json before patching.
 *
 * Run from the studio dir (after `sanity login`):
 *   npx sanity exec scripts/patchRichTextSitewide.ts --with-user-token
 */
import {writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {htmlToBlocks} from '@sanity/block-tools'
import {Schema} from '@sanity/schema'
import {JSDOM} from 'jsdom'

const client = getCliClient()

let keySeq = 0
const k = () => `k${(keySeq++).toString(36)}${Math.random().toString(36).slice(2, 8)}`

/* ---- block-level HTML → Portable Text (richBody) --------------------------- */
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

/* ---- inline HTML → Portable Text (inlineBody) ------------------------------ */
function spanMark(el: Element): string | undefined {
  const cls = (el.getAttribute('class') || '').toLowerCase()
  const style = (el.getAttribute('style') || '').toLowerCase()
  if (style.includes('f5b800') || cls.includes('text-ember')) return 'highlight'
  if (cls.includes('text-muted') || cls.includes('text-ash')) return 'muted'
  if (style.includes('var(--green)')) return 'good'
  if (style.includes('var(--red)')) return 'bad'
  if (cls.includes('text-glacier') || cls.includes('text-ink') || cls.includes('text-tide')) return 'accent'
  if (style.includes('#093a3e')) return 'accent'
  return undefined
}

function htmlToInlineBody(html?: string) {
  if (!html || !html.trim()) return undefined
  const doc = new JSDOM(`<div id="root">${html}</div>`).window.document
  const root = doc.getElementById('root')!

  const children: Record<string, any>[] = []
  const markDefs: Record<string, any>[] = []

  const pushText = (text: string, marks: string[]) => {
    if (!text) return
    children.push({_type: 'span', _key: k(), text, marks: [...marks]})
  }

  const walk = (node: Node, marks: string[]) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        pushText(child.textContent ?? '', marks)
        continue
      }
      if (child.nodeType !== 1) continue
      const el = child as Element
      const tag = el.tagName.toLowerCase()
      if (tag === 'br') {
        pushText('\n', marks)
      } else if (tag === 'a') {
        const def = {_type: 'link', _key: k(), href: el.getAttribute('href') || '#'}
        markDefs.push(def)
        walk(el, [...marks, def._key])
      } else if (tag === 'strong' || tag === 'b') {
        const cls = (el.getAttribute('class') || '').toLowerCase()
        walk(el, [...marks, cls.includes('check') ? 'check' : 'strong'])
      } else if (tag === 'em' || tag === 'i') {
        walk(el, [...marks, 'em'])
      } else if (tag === 'span') {
        const mark = spanMark(el)
        walk(el, mark ? [...marks, mark] : marks)
      } else {
        walk(el, marks) // unwrap anything else (p, div, …)
      }
    }
  }
  walk(root, [])

  if (children.length === 0) return undefined
  return [{_type: 'block', _key: k(), style: 'normal', markDefs, children}]
}

/* ---- migration -------------------------------------------------------------- */
async function main() {
  const docs: Record<string, any>[] = await client.fetch(
    `*[_type in ["resource", "comparison", "agentDemo", "landingPage", "blog"]]`,
  )
  const backupPath = join(__dirname, 'richTextBackup-2026-06-10.json')
  writeFileSync(backupPath, JSON.stringify(docs, null, 1))
  console.log(`Backed up ${docs.length} docs → ${backupPath}\n`)

  for (const doc of docs) {
    const id = doc._id as string
    const set: Record<string, any> = {}
    const unset: string[] = []

    if (doc._type === 'resource' && Array.isArray(doc.sections)) {
      // already-converted sections (arrays) pass through untouched
      set.sections = doc.sections.map((s: any) => ({
        ...s,
        _key: s._key || k(),
        content: typeof s.content === 'string' ? htmlToRichBody(s.content) : s.content,
      }))
    }

    if (doc._type === 'blog' && typeof doc.cta?.description === 'string') {
      set['cta.description'] = htmlToRichBody(doc.cta.description)
    }

    if (doc._type === 'comparison' && Array.isArray(doc.comparisonRows)) {
      set.comparisonRows = doc.comparisonRows.map((r: any) => ({
        ...r,
        _key: r._key || k(),
        competitorText:
          typeof r.competitorText === 'string' ? htmlToInlineBody(r.competitorText) : r.competitorText,
        saganText: typeof r.saganText === 'string' ? htmlToInlineBody(r.saganText) : r.saganText,
      }))
    }

    if (doc._type === 'agentDemo' || doc._type === 'landingPage') {
      if (typeof doc.heroHeadlineHtml === 'string') {
        const pt = htmlToInlineBody(doc.heroHeadlineHtml)
        if (pt) set.heroHeadline = pt
        unset.push('heroHeadlineHtml')
      }
      if (typeof doc.heroLeadHtml === 'string') {
        const pt = htmlToInlineBody(doc.heroLeadHtml)
        if (pt) set.heroLead = pt
        unset.push('heroLeadHtml')
      }
    }

    if (Object.keys(set).length === 0 && unset.length === 0) {
      console.log(`· ${id}: nothing to convert`)
      continue
    }
    let patch = client.patch(id).set(set)
    if (unset.length > 0) patch = patch.unset(unset)
    await patch.commit()
    console.log(`✓ ${id}: ${Object.keys(set).join(', ') || '(unset only)'}`)
  }
  console.log('\n✓ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
