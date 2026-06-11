import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding the site navbar: ordered menu items + the two CTA buttons. */
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'logoIcon',
      title: 'Logo icon',
      type: 'image',
      description: 'Small square mark next to the "Sagan" logo text (rendered at 24×24).',
    }),
    defineField({
      name: 'items',
      title: 'Menu items',
      description: 'Top-level navbar entries, in display order.',
      type: 'array',
      of: [defineArrayMember({type: 'navItem'})],
    }),
    defineField({
      name: 'signIn',
      title: 'Sign In button',
      type: 'object',
      fields: [
        defineField({name: 'label', type: 'string', initialValue: 'Sign In'}),
        defineField({
          name: 'url',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['http', 'https']}),
        }),
      ],
    }),
    defineField({
      name: 'scheduleCall',
      title: 'Schedule a Call button',
      type: 'object',
      fields: [
        defineField({name: 'label', type: 'string', initialValue: 'Schedule a Call'}),
        defineField({
          name: 'url',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['http', 'https']}),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Navigation'}),
  },
})
