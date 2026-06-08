import {defineField, defineType} from 'sanity'

/** A Sagan University program card: icon disc + title + tagline + body. */
export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'icon',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'tag', media: 'icon'},
  },
})
