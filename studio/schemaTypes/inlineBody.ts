import {createElement} from 'react'
import {defineArrayMember, defineType} from 'sanity'

/** Single-line / inline rich text for short marked-up copy: hero headlines and
 * leads (agent demos, landing pages) and comparison-table cells. No headings or
 * lists — just styled spans. The web build serializes the decorators back to
 * the same markup the pages' CSS already styles (web/src/lib/richTextHtml.ts):
 *   highlight → <span style="color:#F5B800">            (brand yellow)
 *   accent    → <span class="text-glacier font-medium"> (dark emphasis)
 *   muted     → <span class="text-muted">
 *   check     → <strong class="check">                  (vs-table accent bold)
 *   good      → green bold   ·   bad → red bold         (vs-table cells)
 * Blocks (Enter presses) are joined with <br /> on the page. */

const mark = (style: React.CSSProperties) => (props: {children?: React.ReactNode}) =>
  createElement('span', {style}, props.children)

export const inlineBody = defineType({
  name: 'inlineBody',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {title: 'Yellow highlight', value: 'highlight', component: mark({color: '#F5B800', fontWeight: 500})},
          {title: 'Dark emphasis', value: 'accent', component: mark({color: '#001F45', fontWeight: 600})},
          {title: 'Muted', value: 'muted', component: mark({color: '#79746E'})},
          {title: 'Check (vs table)', value: 'check', component: mark({color: '#1F8A4C', fontWeight: 600})},
          {title: 'Green (vs table)', value: 'good', component: mark({color: '#1F8A4C', fontWeight: 700})},
          {title: 'Red (vs table)', value: 'bad', component: mark({color: '#C0392B', fontWeight: 700})},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{name: 'href', type: 'url', title: 'URL', validation: (rule: any) => rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']})}],
          },
        ],
      },
    }),
  ],
})
