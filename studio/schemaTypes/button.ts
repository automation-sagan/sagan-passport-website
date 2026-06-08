import {defineField, defineType} from 'sanity'

/** A reusable CTA button: label + link, plus how it renders and opens. */
export const button = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Internal path (e.g. /how-it-works) or a full URL.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'variant',
      type: 'string',
      options: {
        list: [
          {title: 'Fill', value: 'fill'},
          {title: 'Outline', value: 'outline'},
          {title: 'Outline (white)', value: 'white'},
        ],
        layout: 'radio',
      },
      initialValue: 'fill',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'href'},
  },
})
