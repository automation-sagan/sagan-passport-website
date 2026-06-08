import {defineField, defineType} from 'sanity'

/** One section of a resource article: optional eyebrow tag + title, plus the
 * body content as HTML (kept as-is from the Framer CMS, rendered with set:html). */
export const resourceSection = defineType({
  name: 'resourceSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'tag',
      title: 'Eyebrow tag',
      type: 'string',
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
    select: {title: 'title', subtitle: 'tag'},
    prepare: ({title, subtitle}) => ({title: title || subtitle || 'Section', subtitle}),
  },
})
