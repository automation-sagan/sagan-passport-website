import {defineField, defineType} from 'sanity'

/** An optional pull-quote on a resource article: quote + person name.
 * Mirrors the Framer CMS testimonial fields. */
export const resourceTestimonial = defineType({
  name: 'resourceTestimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Quote',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'personName',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'personName', subtitle: 'content'},
  },
})
