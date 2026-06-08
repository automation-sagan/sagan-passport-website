import {defineField, defineType} from 'sanity'

/** One step in the "From Wishlist to A-Player" sticky-stacking process. */
export const processStep = defineType({
  name: 'processStep',
  title: 'Process step',
  type: 'object',
  fields: [
    defineField({
      name: 'step',
      title: 'Step label',
      type: 'string',
      description: 'e.g. 1. Define & Search',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'badgeColor',
      title: 'Badge color',
      type: 'string',
      description: 'CSS color for the icon badge, e.g. rgb(245, 184, 0)',
    }),
    defineField({
      name: 'icon',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'image',
      title: 'Illustration',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'step', media: 'image'},
  },
})
