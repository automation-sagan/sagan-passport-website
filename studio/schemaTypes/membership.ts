import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding the Membership benefits section (one document, id "membership").
 * Shared by both the How It Works and Pricing pages. */
export const membership = defineType({
  name: 'membership',
  title: 'Membership',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      type: 'string',
    }),
    defineField({
      name: 'subcopy',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tabs',
      type: 'array',
      of: [defineArrayMember({type: 'membershipTab'})],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Membership'}),
  },
})
