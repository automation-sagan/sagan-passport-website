import {defineArrayMember, defineField, defineType} from 'sanity'

/** A single pricing plan column. Prices/features differ by billing period. */
export const planItem = defineType({
  name: 'planItem',
  title: 'Plan',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'recommended',
      title: 'Recommended (show badge + pop-out)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'accent',
      title: 'Accent color',
      type: 'string',
      description: 'CSS color for dots, price, checks and CTA — e.g. rgb(33, 151, 255).',
    }),
    defineField({
      name: 'accentDots',
      title: 'Accent dots',
      type: 'number',
      description: 'How many small dots at the card top (1, 2 or 3).',
      initialValue: 1,
      validation: (rule) => rule.min(1).max(3).integer(),
    }),
    defineField({
      name: 'priceMonthly',
      title: 'Price label (monthly)',
      type: 'string',
    }),
    defineField({
      name: 'priceAnnual',
      title: 'Price label (annual)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'bestFor',
      title: 'Best for',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'featuresMonthly',
      title: "What's included (monthly)",
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'featuresAnnual',
      title: "What's included (annual)",
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA link',
      type: 'string',
    }),
    defineField({
      name: 'ctaExternal',
      title: 'CTA opens in new tab',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'priceMonthly'},
  },
})
