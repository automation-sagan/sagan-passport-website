import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Singleton holding the site footer: tagline, the three link columns (each
 * column stacks one or more headed sections), and the full-width "Sagan"
 * wordmark image at the bottom.
 */
export const footerLink = defineType({
  name: 'footerLink',
  title: 'Link',
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
      description: 'Internal path (e.g. /pricing) or a full URL.',
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
    select: {title: 'label', subtitle: 'href'},
  },
})

export const footerSection = defineType({
  name: 'footerSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      description: 'Uppercase group heading, e.g. SAGAN, HIRE, SERVICES.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'links',
      type: 'array',
      of: [defineArrayMember({type: 'footerLink'})],
    }),
  ],
  preview: {
    select: {title: 'heading', links: 'links'},
    prepare({title, links}) {
      return {title, subtitle: `${links?.length ?? 0} links`}
    },
  },
})

export const footerColumn = defineType({
  name: 'footerColumn',
  title: 'Column',
  type: 'object',
  fields: [
    defineField({
      name: 'sections',
      type: 'array',
      description: 'Headed link groups stacked top-to-bottom inside this column.',
      of: [defineArrayMember({type: 'footerSection'})],
    }),
  ],
  preview: {
    select: {sections: 'sections'},
    prepare({sections}) {
      const headings = (sections ?? []).map((s: any) => s.heading).filter(Boolean)
      return {title: headings.join(' + ') || 'Column'}
    },
  },
})

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'tagline',
      type: 'string',
      description: 'Big heading on the left, e.g. "Source and scale with Sagan."',
    }),
    defineField({
      name: 'columns',
      title: 'Link columns',
      type: 'array',
      description: 'The three link columns (hidden on phones).',
      of: [defineArrayMember({type: 'footerColumn'})],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'wordmark',
      title: 'Wordmark image',
      type: 'image',
      description:
        'Full-width "Sagan" wordmark anchored at the footer bottom. Wide aspect ratio (~4.2:1) recommended.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Footer'}),
  },
})
