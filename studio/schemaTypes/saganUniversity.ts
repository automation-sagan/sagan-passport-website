import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding the Sagan University page content (one document, id
 * "saganUniversity"). */
export const saganUniversity = defineType({
  name: 'saganUniversity',
  title: 'Sagan University',
  type: 'document',
  groups: [
    {name: 'meta', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'courses', title: 'Courses'},
    {name: 'why', title: 'Why'},
    {name: 'programs', title: 'Programs'},
    {name: 'approach', title: 'Approach'},
    {name: 'testimonials', title: 'Testimonials'},
    {name: 'caseStudy', title: 'Case study'},
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title (SEO)',
      type: 'string',
      description: 'Shown in the browser tab and search results.',
      group: 'meta',
    }),

    // Hero
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'subheading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({
          name: 'buttons',
          type: 'array',
          of: [defineArrayMember({type: 'button'})],
        }),
      ],
    }),

    // Featured courses ticker
    defineField({
      name: 'coursesLabel',
      title: 'Ticker label',
      type: 'string',
      group: 'courses',
    }),
    defineField({
      name: 'courses',
      type: 'array',
      group: 'courses',
      of: [defineArrayMember({type: 'course'})],
    }),

    // Why Sagan University
    defineField({
      name: 'why',
      title: 'Why',
      type: 'object',
      group: 'why',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({
          name: 'features',
          type: 'array',
          of: [defineArrayMember({type: 'feature'})],
        }),
      ],
    }),

    // Programs
    defineField({
      name: 'programs',
      type: 'array',
      group: 'programs',
      of: [defineArrayMember({type: 'program'})],
    }),

    // Approach
    defineField({
      name: 'approach',
      title: 'Approach',
      type: 'object',
      group: 'approach',
      fields: [
        defineField({name: 'eyebrow', type: 'string'}),
        defineField({name: 'heading', type: 'string'}),
        defineField({
          name: 'checks',
          title: 'Checklist',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
        }),
        defineField({
          name: 'checkIcon',
          title: 'Checkmark icon',
          type: 'image',
          options: {hotspot: true},
        }),
        defineField({
          name: 'cardImage',
          title: 'Large card background',
          type: 'image',
          options: {hotspot: true},
        }),
        defineField({name: 'cardHeading', type: 'string'}),
        defineField({name: 'cardBody', type: 'text', rows: 5}),
      ],
    }),

    // Testimonials
    defineField({
      name: 'testimonials',
      type: 'array',
      group: 'testimonials',
      of: [defineArrayMember({type: 'slide'})],
    }),

    // Case study / video
    defineField({
      name: 'caseStudy',
      title: 'Case study',
      type: 'object',
      group: 'caseStudy',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 4}),
        defineField({
          name: 'youtubeId',
          title: 'YouTube video ID',
          type: 'string',
          description: 'e.g. BS_UI7E4k2M from https://youtu.be/BS_UI7E4k2M',
        }),
        defineField({
          name: 'poster',
          title: 'Video poster',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Sagan University'}),
  },
})
