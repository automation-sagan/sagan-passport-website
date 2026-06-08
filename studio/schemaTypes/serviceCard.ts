import {defineField, defineType} from 'sanity'

/** A customer-vertical service card: headline + supporting copy (2×2 grid). */
export const serviceCard = defineType({
  name: 'serviceCard',
  title: 'Service card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'body'},
  },
})
