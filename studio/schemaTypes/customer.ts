import {defineArrayMember, defineField, defineType} from 'sanity'

/** A customer-vertical landing page (multi-entry, one document per vertical,
 * e.g. Home Services, Private Equity). Rendered by web's /customers/[slug]. */
export const customer = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'hero', title: 'Hero'},
    {name: 'logos', title: 'Logos'},
    {name: 'services', title: 'Service cards'},
    {name: 'talent', title: 'Talent'},
    {name: 'caseStudy', title: 'Case study'},
    {name: 'roles', title: 'Roles'},
    {name: 'testimonials', title: 'Testimonials'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Shown in the Studio list, e.g. Home Services.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL path under /customers/ — e.g. home-services.',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
      group: 'meta',
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      group: 'hero',
    }),

    // Hero
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 4}),
        defineField({name: 'image', type: 'image', options: {hotspot: true}}),
      ],
    }),

    // Logos
    defineField({
      name: 'logosHeading',
      title: 'Logos heading',
      type: 'string',
      group: 'logos',
    }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      group: 'logos',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),

    // Service cards
    defineField({
      name: 'serviceCards',
      title: 'Service cards',
      type: 'array',
      group: 'services',
      of: [defineArrayMember({type: 'serviceCard'})],
    }),

    // Talent
    defineField({
      name: 'talent',
      title: 'Talent',
      type: 'object',
      group: 'talent',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'subheading', type: 'string'}),
        defineField({
          name: 'people',
          type: 'array',
          of: [defineArrayMember({type: 'talentPerson'})],
        }),
        defineField({
          name: 'ticker1',
          title: 'Ticker row 1',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'ticker2',
          title: 'Ticker row 2',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
      ],
    }),

    // Case study
    defineField({
      name: 'caseStudy',
      title: 'Case study',
      type: 'object',
      group: 'caseStudy',
      fields: [
        defineField({name: 'title', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 6}),
        defineField({name: 'image', type: 'image', options: {hotspot: true}}),
        defineField({
          name: 'youtubeId',
          title: 'YouTube video ID',
          type: 'string',
          description: 'e.g. ngO1dtGfkcc from https://youtu.be/ngO1dtGfkcc',
        }),
      ],
    }),

    // Roles
    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'object',
      group: 'roles',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({
          name: 'entries',
          type: 'array',
          of: [defineArrayMember({type: 'roleEntry'})],
        }),
      ],
    }),

    // Testimonials
    defineField({
      name: 'testimonials',
      type: 'array',
      group: 'testimonials',
      of: [defineArrayMember({type: 'slide'})],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'eyebrow', media: 'hero.image'},
  },
})
