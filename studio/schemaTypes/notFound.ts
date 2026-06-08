import {defineField, defineType} from 'sanity'

/** Singleton holding the 404 / Not Found page content (one document, id "notFound"). */
export const notFound = defineType({
  name: 'notFound',
  title: '404 Page',
  type: 'document',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
    }),
    defineField({
      name: 'heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'button',
      type: 'button',
    }),
  ],
  preview: {
    prepare: () => ({title: '404 Page'}),
  },
})
