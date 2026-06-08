import {defineField, defineType} from 'sanity'

/** A featured carousel slide: round photo, pull-quote, name and title/company. */
export const slide = defineType({
  name: 'slide',
  title: 'Featured slide',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'e.g. Metal Alliance or From X',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'title', media: 'image'},
  },
})
