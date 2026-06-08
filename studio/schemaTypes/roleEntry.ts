import {defineField, defineType} from 'sanity'

/** A placed-role pill in the customer roles marquee: title + country + rate. */
export const roleEntry = defineType({
  name: 'roleEntry',
  title: 'Role entry',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'country',
      type: 'string',
    }),
    defineField({
      name: 'rate',
      type: 'string',
      description: 'e.g. Full Time $1,000/month',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'country'},
  },
})
