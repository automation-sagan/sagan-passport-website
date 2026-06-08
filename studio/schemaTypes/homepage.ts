import {defineArrayMember, defineField, defineType} from 'sanity'

/** Singleton holding all editable homepage content (one document, id "homepage"). */
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {name: 'meta', title: 'SEO'},
    {name: 'hero', title: 'Hero'},
    {name: 'talent', title: 'Talent ticker'},
    {name: 'logos', title: 'Logo wall'},
    {name: 'info', title: 'Info'},
    {name: 'features', title: 'Feature cards'},
    {name: 'testimonials', title: 'Testimonials'},
    {name: 'cta', title: 'CTA'},
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
        defineField({name: 'headline', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
        defineField({
          name: 'buttons',
          type: 'array',
          of: [defineArrayMember({type: 'button'})],
        }),
      ],
    }),

    // Talent ticker
    defineField({
      name: 'talent',
      title: 'Talent',
      type: 'array',
      group: 'talent',
      of: [defineArrayMember({type: 'person'})],
    }),

    // Logo wall
    defineField({
      name: 'logosTagline',
      title: 'Logo wall tagline',
      type: 'string',
      group: 'logos',
    }),
    defineField({
      name: 'logos',
      title: 'Customer logos',
      type: 'array',
      group: 'logos',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),

    // Info section
    defineField({
      name: 'infoRows',
      title: 'Info rows',
      type: 'array',
      group: 'info',
      of: [defineArrayMember({type: 'infoRow'})],
    }),

    // Feature cards
    defineField({
      name: 'bigCard',
      title: 'Big card',
      type: 'object',
      group: 'features',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 4}),
        defineField({name: 'button', type: 'button'}),
        defineField({
          name: 'image',
          title: 'Background image',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      group: 'features',
      of: [defineArrayMember({type: 'feature'})],
    }),

    // Testimonials
    defineField({
      name: 'slides',
      title: 'Featured slides (carousel)',
      type: 'array',
      group: 'testimonials',
      of: [defineArrayMember({type: 'slide'})],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonial wall',
      type: 'array',
      group: 'testimonials',
      of: [defineArrayMember({type: 'testimonialItem'})],
    }),

    // CTA
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'object',
      group: 'cta',
      fields: [
        defineField({name: 'heading', type: 'string'}),
        defineField({name: 'body', type: 'text', rows: 3}),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Homepage'}),
  },
})
