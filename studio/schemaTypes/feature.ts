import {defineField, defineType} from 'sanity'

/** A feature card in the homepage 3-up grid: title + short description. */
export const feature = defineType({
  name: 'feature',
  title: 'Feature',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
})
