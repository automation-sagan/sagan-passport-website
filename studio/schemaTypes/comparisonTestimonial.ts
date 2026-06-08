import {defineField, defineType} from 'sanity'

/** A short testimonial card on a "vs" comparison page. */
export const comparisonTestimonial = defineType({
  name: 'comparisonTestimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Quote', type: 'text', rows: 3}),
    defineField({name: 'author', type: 'string'}),
    defineField({name: 'role', type: 'string'}),
  ],
  preview: {
    select: {title: 'author', subtitle: 'role'},
  },
})
