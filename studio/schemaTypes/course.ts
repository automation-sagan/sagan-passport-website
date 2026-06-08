import {defineField, defineType} from 'sanity'

/** A featured course card in the Sagan University ticker: title + cover image. */
export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
  },
})
