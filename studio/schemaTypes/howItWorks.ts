import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding the How It Works page content (one document, id "howItWorks").
 * The Membership benefits section lives in its own `membership` singleton because
 * it is shared with the Pricing page. */
export const howItWorks = defineType({
  name: 'howItWorks',
  title: 'How It Works',
  type: 'document',
  groups: [
    {name: 'meta', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'process', title: 'Process'},
    {name: 'proof', title: 'Proof'},
    {name: 'faq', title: 'FAQ'},
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
      group: 'meta',
    }),

    // Hero (Spline animation stays in code)
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
      ],
    }),

    // Process
    defineField({
      name: 'process',
      title: 'Process',
      type: 'object',
      group: 'process',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'subcopy', type: 'text', rows: 3}),
        defineField({
          name: 'steps',
          type: 'array',
          of: [defineArrayMember({type: 'processStep'})],
        }),
      ],
    }),

    // Proof
    defineField({
      name: 'proof',
      title: 'Proof',
      type: 'object',
      group: 'proof',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'heading', type: 'string'}),
        defineField({
          name: 'avatar',
          title: 'Testimonial avatar',
          type: 'image',
          options: {hotspot: true},
        }),
        defineField({name: 'quote', title: 'Testimonial quote', type: 'text', rows: 5}),
        defineField({name: 'name', title: 'Testimonial name', type: 'string'}),
        defineField({name: 'org', title: 'Testimonial org', type: 'string'}),
        defineField({
          name: 'ratingCards',
          title: 'Rating cards',
          type: 'array',
          of: [defineArrayMember({type: 'ratingCard'})],
        }),
      ],
    }),

    // FAQ
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'object',
      group: 'faq',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({
          name: 'items',
          type: 'array',
          of: [defineArrayMember({type: 'faqItem'})],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'How It Works'}),
  },
})
