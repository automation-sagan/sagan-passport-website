import {defineField, defineType} from 'sanity'

/** A talent-ticker card: photo + name, role and monthly rate. */
export const person = defineType({
  name: 'person',
  title: 'Talent',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
    }),
    defineField({
      name: 'rate',
      type: 'string',
      description: 'e.g. $1,750/month',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'image'},
  },
})
