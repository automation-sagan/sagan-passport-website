import {defineField, defineType} from 'sanity'

/** One section of a resource article: optional eyebrow tag + title + rich-text
 * body content (serialized back to HTML at build time). */
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
      title: 'Content',
      type: 'richBody',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'tag'},
    prepare: ({title, subtitle}) => ({title: title || subtitle || 'Section', subtitle}),
  },
})
