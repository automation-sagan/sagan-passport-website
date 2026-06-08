import {defineArrayMember, defineField, defineType} from 'sanity'

/** One tab in the membership benefits toggle: a label, a photo, and its benefits. */
export const membershipTab = defineType({
  name: 'membershipTab',
  title: 'Membership tab',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'items',
      title: 'Benefits',
      type: 'array',
      of: [defineArrayMember({type: 'membershipItem'})],
    }),
  ],
  preview: {
    select: {title: 'label', media: 'image'},
  },
})
