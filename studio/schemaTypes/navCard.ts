import {defineField, defineType} from 'sanity'

/** A single dropdown menu-item card: icon + uppercase title + description. */
export const navCard = defineType({
  name: 'navCard',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'icon',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Internal path (e.g. /customers/home-services) or a full URL.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'href', media: 'icon'},
  },
})
