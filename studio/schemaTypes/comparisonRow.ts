import {defineField, defineType} from 'sanity'

/** One row of a "vs" comparison table. Cell text is inline rich text (bold and
 * check/green/red emphasis via the inlineBody decorators); the *State fields
 * drive the cell colour class (cross = red, check = green, neutral = grey,
 * plain = default). */
export const comparisonRow = defineType({
  name: 'comparisonRow',
  title: 'Comparison row',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Row label', type: 'string'}),
    defineField({name: 'labelSmall', title: 'Row label sub-text', type: 'string'}),
    defineField({
      name: 'competitorState',
      title: 'Competitor cell style',
      type: 'string',
      options: {list: ['cross', 'neutral', 'plain'], layout: 'radio'},
      initialValue: 'cross',
    }),
    defineField({name: 'competitorText', title: 'Competitor cell', type: 'inlineBody'}),
    defineField({name: 'competitorSmall', title: 'Competitor cell sub-text', type: 'string'}),
    defineField({
      name: 'saganState',
      title: 'Sagan cell style',
      type: 'string',
      options: {list: ['check', 'neutral', 'plain'], layout: 'radio'},
      initialValue: 'check',
    }),
    defineField({name: 'saganText', title: 'Sagan cell', type: 'inlineBody'}),
    defineField({name: 'saganSmall', title: 'Sagan cell sub-text', type: 'string'}),
  ],
  preview: {
    select: {title: 'label'},
  },
})
