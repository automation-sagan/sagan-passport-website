import {defineField, defineType} from 'sanity'

/** An info-section row: heading + body copy (the 3D scene stays in code). */
export const infoRow = defineType({
  name: 'infoRow',
  title: 'Info row',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'body'},
  },
})
