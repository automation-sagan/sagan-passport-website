import {defineField, defineType} from 'sanity'

/** One section of a blog post. Mirrors the Framer CMS section slots: optional
 * label + title + intro line, rich-text content (+ optional pull-quote and a
 * second content block, rendered after the quote). */
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
      name: 'intro',
      type: 'string',
      description: 'Optional short intro line under the title.',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blogBody',
    }),
    defineField({
      name: 'quote',
      title: 'Pull-quote',
      type: 'text',
      rows: 3,
      description: 'Optional highlighted quote, shown after the content.',
    }),
    defineField({
      name: 'content2',
      title: 'Content 2',
      type: 'blogBody',
      description: 'Optional second content block, shown after the pull-quote.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'label'},
    prepare: ({title, subtitle}) => ({title: title || subtitle || 'Section', subtitle}),
  },
})
