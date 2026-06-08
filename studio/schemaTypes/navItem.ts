import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A top-level navbar entry. Either a plain Link (How It Works, Pricing, …) or a
 * Dropdown that reveals a panel of cards (Customers, Resources).
 */
export const navItem = defineType({
  name: 'navItem',
  title: 'Nav Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'Link', value: 'link'},
          {title: 'Dropdown', value: 'dropdown'},
        ],
        layout: 'radio',
      },
      initialValue: 'link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'Internal path (e.g. /pricing) or a full URL.',
      hidden: ({parent}) => parent?.type !== 'link',
    }),
    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.type !== 'link',
    }),
    defineField({
      name: 'wide',
      title: 'Wide (two-column) dropdown',
      type: 'boolean',
      description: 'On = two columns with a divider (like Customers). Off = single column (like Resources).',
      initialValue: false,
      hidden: ({parent}) => parent?.type !== 'dropdown',
    }),
    defineField({
      name: 'cards',
      type: 'array',
      of: [defineArrayMember({type: 'navCard'})],
      hidden: ({parent}) => parent?.type !== 'dropdown',
    }),
  ],
  preview: {
    select: {title: 'label', type: 'type'},
    prepare({title, type}) {
      return {title, subtitle: type === 'dropdown' ? 'Dropdown' : 'Link'}
    },
  },
})
