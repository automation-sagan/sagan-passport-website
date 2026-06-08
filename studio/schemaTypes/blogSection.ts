import {defineField, defineType} from 'sanity'

/** One section of a blog post: optional label + title, plus HTML body content
 * (kept as-is from the Framer CMS, rendered with set:html). */
export const blogSection = defineType({
  name: 'blogSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      description: 'e.g. SECTION 1',
    }),
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content (HTML)',
      type: 'text',
      rows: 10,
      description: 'Rich HTML from the Framer CMS — rendered as-is on the page.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'label'},
    prepare: ({title, subtitle}) => ({title: title || subtitle || 'Section', subtitle}),
  },
})
