import {defineField, defineType} from 'sanity'

/** A single membership benefit: a line-art icon (chosen by key) + title + copy.
 * The actual SVG icons live in the component (MembershipToggle.astro) — those are
 * code, not editable content — so we only store which icon to use. */
export const membershipItem = defineType({
  name: 'membershipItem',
  title: 'Benefit',
  type: 'object',
  fields: [
    defineField({
      name: 'iconKey',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          {title: 'Tag', value: 'tag'},
          {title: 'Hand', value: 'hand'},
          {title: 'Map', value: 'map'},
          {title: 'Doc', value: 'doc'},
          {title: 'Chat', value: 'chat'},
          {title: 'Star', value: 'star'},
          {title: 'Board', value: 'board'},
          {title: 'Umbrella', value: 'umbrella'},
          {title: 'Tools', value: 'tools'},
          {title: 'Lock', value: 'lock'},
          {title: 'Layers', value: 'layers'},
          {title: 'Globe', value: 'globe'},
        ],
      },
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'iconKey'},
  },
})
