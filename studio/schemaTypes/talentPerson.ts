import {defineField, defineType} from 'sanity'

/** An example-hire card in the customer talent section: role + origin + rate. */
export const talentPerson = defineType({
  name: 'talentPerson',
  title: 'Talent person',
  type: 'object',
  fields: [
    defineField({
      name: 'role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'from',
      title: 'Origin',
      type: 'string',
      description: 'e.g. Mayra from Ecuador',
    }),
    defineField({
      name: 'rate',
      type: 'string',
      description: 'e.g. Full Time - $1,800/month',
    }),
  ],
  preview: {
    select: {title: 'role', subtitle: 'from'},
  },
})
