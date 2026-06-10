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
      name: 'seoDescription',
      title: 'Meta description (SEO)',
      type: 'text',
      rows: 3,
      description: 'Shown under the title in search results and social shares. Aim for 150–160 characters.',
      group: 'meta',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Overrides the sitewide default from Site settings. 1200×630 recommended.',
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
