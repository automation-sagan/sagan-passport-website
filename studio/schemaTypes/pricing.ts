import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding the Pricing page content (one document, id "pricing"). */
export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing',
  type: 'document',
  groups: [
    {name: 'meta', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'plans', title: 'Plans'},
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
      group: 'meta',
    }),
    defineField({
      name: 'heading',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'subcopy',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'plans',
      type: 'array',
      group: 'plans',
      of: [defineArrayMember({type: 'planItem'})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Pricing'}),
  },
})
